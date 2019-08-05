import { TestScheduler } from 'rxjs/testing';
import { deepEqual } from '../src/deep-equals';
import { distinctUntilChangedImmutable } from '../src/distinct-until-changed-immutable';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';


describe('distinctUntilChangedImmutable operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {

    testScheduler = new TestScheduler((actual, expected) => {
      const isDeeplyEqual = deepEqual(actual, expected);
      expect(isDeeplyEqual).toBeTruthy();
    });

  });

  it('should distinguish between strings', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const emittedValues = { a: 'a', b: 'b' };

      const e1 = hot('--a--a--a--b--b--a--|', emittedValues);
      const e1subs = '^-------------------!';
      const expected = '--a--------b-----a--|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected, emittedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between numbers', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const emittedValues = { a: 1, b: 2 };

      const e1 = hot('--a--a--a--b--b--a--|', emittedValues);
      const e1subs = '^-------------------!';
      const expected = '--a--------b-----a--|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected, emittedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between deeply equal objects', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const emittedValues = { a: { 1: 1 }, b: { 1: 1 } };

      const e1 = hot('--a--a--a--b--b--a--|', emittedValues);
      const e1subs = '^-------------------!';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected, emittedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between deeply equal NESTED objects', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const emittedValues = {
        a: {
          1: {
            john: 'john',
          },
        },
        b: {
          1: {
            john: 'john',
          },
        },
      };

      const e1 = hot('--a--a--a--b--b--a--|', emittedValues);
      const e1subs = '^-------------------!';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected, emittedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between multiple deeply equal NESTED objects with arrays', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const emittedValues = {
        a: {
          1: {
            john: ['john'],
          },
        },
        b: {
          1: {
            john: ['john'],
          },
        },
        c: {
          harry: 'harry',
          1: {
            john: ['john'],
          },
        },
      };

      const e1 = hot('-a-c-a-b-b-a-b-c-|', emittedValues);
      const e1subs = '^----------------!';
      const expected = '-a-c-a---------c-|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected, emittedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should provide a deep copy of the arguments to the compare function', (done) => {
    const mock = { '1': 1 };
    const stream = of(mock, mock, 'goose', mock);

    stream
      .pipe(
        distinctUntilChangedImmutable((a, b) => {
          expect(a).not.toBe(b);
          return deepEqual(a, b);
        }),
      )
      .subscribe(() => {}, () => {} ,done);
  });

  it('should distinguish between values and does not completes', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--a--a--b--b--a-');
      const e1subs = '^                  ';
      const expected = '--a--------b-----a-';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should not completes if source never completes', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable, expectSubscriptions } = helpers;
      const e1 = cold('-');
      const e1subs = '^';
      const expected = '-';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should not completes if source does not completes', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('-');
      const e1subs = '^';
      const expected = '-';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should complete if source is empty', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable, expectSubscriptions } = helpers;
      const e1 = cold('|');
      const e1subs = '(^!)';
      const expected = '|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should complete if source does not emit', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('------|');
      const e1subs = '^-----!';
      const expected = '------|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should emit if source emits single element only', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--|');
      const e1subs = '^----!';
      const expected = '--a--|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should emit if source is scalar', () => {
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;
      const e1 = of('a');
      const expected = '(a|)';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
    });
  });

  it('should raises error if source raises error', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--a--#');
      const e1subs = '^-------!';
      const expected = '--a-----#';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should raises error if source throws', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable, expectSubscriptions } = helpers;
      const e1 = cold('#');
      const e1subs = '(^!)';
      const expected = '#';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should not omit if source elements are all different', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--c--d--e--f--|');
      const e1subs = '^-------------------!';
      const expected = '--a--b--c--d--e--f--|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--b--d--a--f--|');
      const e1subs = '^---------!----------';
      const expected = '--a--b-----          ';
      const unsub = '----------!----------';

      const result = e1.pipe(distinctUntilChangedImmutable());

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--b--d--a--f--|');
      const e1subs = '^---------!----------';
      const expected = '--a--b-----          ';
      const unsub = '----------!----------';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        distinctUntilChangedImmutable(),
        mergeMap((x: any) => of(x)),
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should emit once if source elements are all same', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--a--a--a--a--a--|');
      const e1subs = '^-------------------!';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should emit once if comparator returns true always regardless of source emits', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--c--d--e--f--|');
      const e1subs = '^-------------------!';
      const expected = '--a-----------------|';

      expectObservable(e1.pipe(distinctUntilChangedImmutable(() => {
        return true;
      }))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit all if comparator returns false always regardless of source emits', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--a--a--a--a--a--|');
      const e1subs = '^-------------------!';
      const expected = '--a--a--a--a--a--a--|';
      expectObservable(e1.pipe(distinctUntilChangedImmutable(() => {
        return false;
      }))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });


  it('should distinguish values by comparator', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const e1subs = '^-------------------!';
      const expected = '--a-----c-----e-----|';
      const comparator = (x: number, y: number) => y % 2 === 0;

      expectObservable(e1.pipe(distinctUntilChangedImmutable(comparator))).toBe(expected, {
        a: 1,
        c: 3,
        e: 5,
      });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raises error when comparator throws', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--c--d--e--f--|');
      const e1subs = '^----------!---------';
      const expected = '--a--b--c--#         ';
      const comparator = (x: string, y: string) => {
        if (y === 'd') {
          throw 'error';

        }
        return x === y;
      };

      expectObservable(e1.pipe(distinctUntilChangedImmutable(comparator))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should use the keySelector to pick comparator values', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const e1subs = '^-------------------!';
      const expected = '--a--b-----d-----f--|';
      const comparator = (x: number, y: number) => y % 2 === 1;
      const keySelector = (x: number) => x % 2;

      expectObservable(e1.pipe(distinctUntilChangedImmutable(comparator, keySelector))).toBe(expected, {
        a: 1,
        b: 2,
        d: 4,
        f: 6,
      });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  });

  it('should raises error when keySelector throws', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('--a--b--c--d--e--f--|');
      const e1subs = '^----------!---------';
      const expected = '--a--b--c--#         ';
      const keySelector = (x: string) => {
        if (x === 'd') {
          throw 'error';
        }
        return x;
      };

      expectObservable(e1.pipe(distinctUntilChangedImmutable(null as any, keySelector))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
