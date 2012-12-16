Console Extras
--------------

This package contains chainable enhancements to the JavaScript console object.

Builds: `dist/console-extras.js` and `dist/console-extras.min.js`.

Methods
-------

__console.times(n)__  
Limits the next call to `n` invocations.  
e.g.

```javascript
console.times(5).log("This message will only show up 5 times.")
```

__console.throttle(n)__  
Throttles the next call to at most once every `n` milliseconds.  
e.g.

```javascript
console.throttle(1000).log("This message will only show up once per second.")
```

__console.collate(...)__  
Collects arbitrary data for summarization. Accepts numbers, strings, arrays, objects.

__console.summary()__  
Displays a summary of collated data: Average/stddev for numbers, unique string counts, objects by type, arrays by elements. Must be called in the same chain as `.collate()`.

Examples
-----

__Chaining__

```javascript
console.times(5).throttle(1000).log("This message will be printed once per second, up to 5 times.")
```

__Collecting data in a live app__
e.g.

```javascript
console
  .collate(1, "foo", { x: 1, y: 2 }, [ 1, 2 ])
  .collate(2, "bar", { x: 2, y: 4 }, [ 5, 4 ])
  .collate(3, "bar", { x: 3, y: 4 }, [ 2, 3 ])
  .throttle(1000)
  .summary()
```

results in:

```
0: 2 ± 0.82 (×3)
1: 
  "foo" (×1)
  "bar" (×2)
2: 
  Object (×3)
    x: 2 ± 0.82 (×3)
    y: 3.33 ± 0.94 (×3)
3: 
  Array
    0: 2.67 ± 1.7 (×3)
    1: 3 ± 0.82 (×3)
```

If you do this in a loop with dynamic data, you will get a summary printed out every second of all collected data. The data is reset every time the summary is output.
