const log = require('debug')('cacheable:');
const ms = require('ms');

/**
 * Volatile state/cache machine
 * @param { object } store - store for cache
 */

function cacheable(store = {}) {
  const {
    key = 'cacheable',
    ttl = '3h',
    offset = 0.65,
    verbose = false
  } = store;

  if (!('expires' in store)) store.expires = 0;
  if (!('cache' in store)) store.cache = [];

  /**
   * debug logging on cache state
   */
  function debug(now = Date.now()) {
    const isExpired = expired(now);
    const isStale = stale(now);
    const cacheSize = size();
    const expiresInSecs = Math.round((store.expires - now) / 1000);
    const staleInSecs = Math.round((store.stale - now) / 1000);
    const logger = { key, isStale, isExpired, cacheSize, expiresInSecs, staleInSecs }; // eslint-disable-line
    log(Object.keys(logger).reduce((arr, k) => {
      arr.push(`${k}:${logger[k]}:`);
      return arr;
    }, []).join(''));
  }

  /**
   * determine if cache state is expired
   * @param now { Number } - defaults to `Date.now`, but i can
   * see maybe wanting to have control over that adhoc
   * @return { Boolean } - value if cache is expired or not
   */
  function expired(now = Date.now()) {
    let isExpired = false;
    const cacheSize = size();
    if (now >= store.expires || !cacheSize) isExpired = true;
    return isExpired;
  }

  /**
   * flush the cache, resets back to an empty object or array, depending
   * on how you interact with it
   */
  function flush() {
    store.cache = Array.isArray(store.cache) ? [] : {};
    return true;
  }

  /**
   * reset's stale/ttl from ts provided with additional offset
   * @param now { Number } - defaults to `Date.now`, but i can
   * see maybe wanting to have control over that adhoc
   */
  function reset(now = Date.now()) {
    store.ts = now;
    store.expires = store.ts + ms(ttl);
    store.stale = store.ts + (ms(ttl) * offset);
    return true;
  }

  /**
   * determine cache size either by `Object.keys` or `Array.length`
   * @return { Number }
   */
  function size() {
    return Array.isArray(store.cache)
      ? store.cache.length
      : Object.keys(store.cache).length;
  }

  /**
   * determine if the cache state is stale
   * @return { Boolean } - value if cache is stale or not
   * @param now { Number } - defaults to `Date.now`, but i can
   * see maybe wanting to have control over that adhoc
   */
  function stale(now = Date.now()) {
    return !expired() && now >= store.stale;
  }

  /**
   * set the cache collection to provided param
   * @param set { Object | Array } - sets cache to provided
   * collection
   */
  function set(collection = []) {
    store.cache = collection;
  }

  /**
   * fetch's the cache related to the current store
   * @return { Object | Array } - returns cached collection
   */
  function fetch() {
    return store.cache;
  }

  /**
   * determines full cache state, if expired, we'll clean up
   * @param logging { Boolean } - whether or not we log cache state
   * @return { Boolean } - whether cache is expired or not
   */
  function state(logging = verbose) {
    const now = Date.now();
    const isExpired = expired(now);
    if (isExpired && size()) flush();
    if (isExpired) reset(now);
    if (logging) debug(now);
    return isExpired;
  }

  return { debug, expired, fetch, flush, set, size, stale, state, reset }; // eslint-disable-line
}

module.exports = { cacheable };
