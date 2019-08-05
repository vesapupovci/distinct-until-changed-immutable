/**
 * Returns an Observable that emits all items emitted by the source Observable that are deeply distinct by comparison from the previous item.
 *
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 *
 * If a comparator function is not provided, a deep equality check is used by default.
 *
 * ## Example
 * A simple example with objects
 * ```javascript
 * import { of } from 'rxjs';
 * import { distinctUntilChangedImmutable } from 'distinct-until-changed-immutable';
 *
 * of({a: 'a'}, {b: 'b'}, {b: 'b'}).pipe(
 *     distinctUntilChangedImmutable(),
 *   )
 *   .subscribe(x => console.log(x)); // {a: 'a'}, {b: 'b'}
 * ```
 *
 * An example using a compare function
 * ```typescript
 * import { of } from 'rxjs';
 * import { distinctUntilChangedImmutable } from 'rxjs/operators';
 *
 * interface Person {
 *    age: number,
 *    name: string
 * }
 *
 * of<Person>(
 *     { age: 4, name: 'Foo'},
 *     { age: 7, name: 'Bar'},
 *     { age: 4, name: 'Foo'},
 *     { age: 6, name: 'Foo'},
 *   ).pipe(
 *     distinctUntilChangedImmutable((p: Person /*I have been cloned*\/, q: Person) => p === q),
 *   )
 *   .subscribe(x => console.log(x));
 *
 * // displays:
 * // { age: 4, name: 'Foo' }
 * // { age: 7, name: 'Bar' }
 * // { age: 4, name: 'Foo' } // Emitted because the parameters are immutable
 * // { age: 5, name: 'Foo' }
 * ```
 *
 * @see {@link distinct}
 * @see {@link distinctUntilKeyChanged}
 *
 * @param {function} [compare] Optional comparison function called to test if an item is distinct from the previous item in the source.
 * @return {Observable} An Observable that emits items from the source Observable with distinct values.
 * @owner Observable
 */
import { MonoTypeOperatorFunction, Observable, Operator, Subscriber, TeardownLogic } from 'rxjs';
import { deepEqual } from './deep-equals';
import { copy } from './deep-copy';

export function distinctUntilChangedImmutable<T, K>(compare?: (x: K, y: K) => boolean, keySelector?: (x: T) => K): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new DistinctUntilChangedOperator<T, K>(compare, keySelector));
}


class DistinctUntilChangedOperator<T, K> implements Operator<T, T> {
  constructor(
    private compare?: (x: K, y: K) => boolean,
    private keySelector?: (x: T) => K,
  ) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
  }
}


class DistinctUntilChangedSubscriber<T, K> extends Subscriber<T> {
  private key: K | undefined;
  private hasKey: boolean = false;

  constructor(
    destination: Subscriber<T>,
    compare?: (x: K, y: K) => boolean,
    private keySelector?: (x: T) => K,
  ) {
    super(destination);
    if (typeof compare === 'function') {
      this.compare = compare;
    }
  }

  private compare(x: any, y: any): boolean {
    // return x === y;
    return deepEqual(x, y);
  }

  protected _next(value: T): void {
    let key: any;
    try {
      const { keySelector } = this;
      key = keySelector ? keySelector(value) : value;
    } catch (err) {
      return this.destination.error && this.destination.error(err);
    }
    let result = false;
    if (this.hasKey) {
      try {
        const { compare } = this;
        result = compare(this.key, key);
      } catch (err) {
        return this.destination.error && this.destination.error(err);
      }
    } else {
      this.hasKey = true;
    }
    if (!result) {
      this.key = copy(key);
      this.destination.next && this.destination.next(value);
    }
  }
}
