# cacheable
I built this because I had the need to throw expensive, frequently called functions into memory.  It's not a framework for caches, it's not really a class, or a cache wrapper, it's really minimal, and encourages you to decide how you want to interact with the available states of your cached collections.

## example
```js
const store = {
  key: 'expensiveCacheExample',
  cache: {},
  ttl: '1h'
};

const expired = cacheable(store).state; // pulls state out to manage state and check if expired
const { stale, reset, flush } = cacheable(store); // other helpful tings

// example usage for expensive or long running functions
function doSomethingExpensive(fn) {
  const isStale = stale();
  if (!expired() && !isStale) return fn(null, store.cache);
  if (isStale) fn(null, store.cache);
  return funcToExpensiveThings((err, resp) => {
    if (err) return fn(new Error(err), null);
    store.cache = resp;
    if (isStale) return reset();
    return fn(null, resp);
  });
}
```