# cacheable
I built this because I had the need to store expensive and frequently called functions into memory.  It's not a framework for caches, it's not really a class, or a cache wrapper.  It's minimal, and encourages you to decide how you want to interact with the available states of your cached collections.

## install
`npm install --save memory-cacheable`

## api

#### `cacheable({ key, cache, ttl, staleMaths, verbose })`
see below table for options:

| key | required | summary |
| --- | --- | --- | --- |
| `key` | `false` | key for debugging purposes, mostly |
| `ttl` | `false` | defaults to 1 hour, uses the [`ms`](https://github.com/zeit/ms) module for easy formatting |
| `cache` | `false` | defaults to an array, but will also support cleaning out objects |
| `staleMaths` | `false` | defaults to `0.65`, is a multiplier of the ttl |
| `verbose` | `false` | defaults to `false` turn this on for really noisey cache stats and debugging |

### cacheable api
| `function` | summary |
| --- | --- |
| `cacheable(store).debug()` | debug logging, noisey, expensive stuff |
| `cacheable(store).expired()` | check if cache state is expired |
| `cacheable(store).flush()` | flush cache, empty it all out |
| `cacheable(store).size()` | gets the cache size |
| `cacheable(store).stale()` | determines if the cache is stale or not |
| `cacheable(store).state()` | returns whether the cache is expired or not, if cache is expired, `state` will `reset` and `flush` the cache |

## example
```js
const store = {
  key: 'expensiveCacheExample',
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

## debugging
Uses the [`debug`](#) module, and you can set the following environment variable:

`export DEBUG=cacheable:*`

## test
`npm install --save-dev && npm test`

### Made with &hearts;.