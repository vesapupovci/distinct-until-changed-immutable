# Distinct Until Changed Immutable

### tl;dr

Install:

`npm i -S distinct-until-changed-immutable`

then import:

`import { distinctUntilChangedImmutable } from 'distinct-until-changed-immutable';`

then use: 

```javascript
of({a: 'a'}, {b: 'b'}, {b: 'b'})
  .pipe(
    distinctUntilChangedImmutable(),
  )
```
___
Returns an Observable that emits all items emitted by the source Observable that are deeply distinct by comparison from the previous item.
 
 If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 
 If a comparator function is not provided, a deep equality check is used by default.
 
 ## Example
 A simple example with numbers
 ```javascript
 import { of } from 'rxjs';
 import { distinctUntilChangedImmutable } from 'distinct-until-changed-immutable';
 
 of({a: 'a'}, {b: 'b'}, {b: 'b'}).pipe(
     distinctUntilChangedImmutable(),
   )
   .subscribe(x => console.log(x)); // {a: 'a'}, {b: 'b'}
 ```
 
 An example using a compare function
 ```javascript
 import { of } from 'rxjs';
 import { distinctUntilChangedImmutable } from 'distinct-until-changed-immutable';
 
 interface Person {
    age: number,
    name: string
 }
 
 of<Person>(
     { age: 4, name: 'Foo'},
     { age: 7, name: 'Bar'},
     { age: 4, name: 'Foo'},
     { age: 6, name: 'Foo'},
   ).pipe(
     distinctUntilChangedImmutable((p: Person /*I have been cloned*/, q: Person) => p === q),
   )
   .subscribe(x => console.log(x));
 
 // displays:
 // { age: 4, name: 'Foo' }
 // { age: 7, name: 'Bar' }
 // { age: 4, name: 'Foo' } // Emitted because the parameters are immutable and we are doing a simple === check in the comparator function above
 // { age: 5, name: 'Foo' }
