const log = require('debug')('cacheable:');
const ms = require('ms');

/**
 * Volatile state/cache machine
 * @param { object } settings - Settings for cache
 */

function cacheable(settings = {}) {
  const { key = 'cacheable', ttl = '3h',
    staleMaths = 0.65, verbose = false } = settings;

  if (!(settings.hasOwnProperty('expires'))) settings.expires = 0;
  if (!(settings.hasOwnProperty('cache'))) settings.cache = [];

  /**
   * debug logging on cache state
   */
  function debug(now = Date.now()) {
    const isExpired = expired(now);
    const isStale = stale(now);
    const cacheSize = size();
    const expiresInSecs = Math.round((settings.expires - now) / 1000);
    const staleInSecs = Math.round((settings.stale - now) / 1000);
    const logger = { key, isStale, isExpired, cacheSize, expiresInSecs, staleInSecs };
    log(Object.keys(logger).reduce((arr, k) => {
      arr.push(`${k}:${logger[k]}:`);
      return arr;
    }, []).join(''));
  }

  /**
   * determine if cache state is expired
   * @return { boolean } - value if cache is expired or not
   */
  function expired(now = Date.now()) {
    let isExpired = false;
    const cacheSize = size();
    if (now >= settings.expires || !cacheSize) isExpired = true;
    return isExpired;
  }

  /**
   * flush the cache, resets back to an empty object or array, depending
   * on how you interact with it
   */
  function flush() {
    settings.cache = Array.isArray(settings.cache) ? [] : {};
    return true;
  }

  /**
   * reset's stale/ttl from ts provided with additional offset
   * @param now - Defaults to `Date.now()`, however you can provide
   * an future date, or a past date to do some funky stuff
   */
  function reset(now = Date.now()) {
    settings.ts = now;
    settings.expires = settings.ts + ms(ttl);
    settings.stale = settings.ts + (ms(ttl) * staleMaths);
    return true;
  }

  /**
   * determine cache size either by `Object.keys` or `Array.length`
   * @return { number }
   */
  function size() {
    if (!(settings.hasOwnProperty('cache'))) flush();
    return Array.isArray(settings.cache)
      ? settings.cache.length
      : Object.keys(settings.cache).length;
  }

  /**
   * determine if the cache state is stale
   * @return { boolean } - value if cache is stale or not
   * @param now { number } - defaults to now, but i can
   * see maybe wanting to have control over that adhoc
   */
  function stale(now = Date.now()) {
    return !expired() && now >= settings.stale;
  }

  /**
   * determines full cache state, if expired, we'll clean up
   * @param logging { boolean } - whether or not we log cache state
   * @return { boolean } - whether cache is expired or not
   */
  function state(logging = verbose) {
    const now = Date.now();
    const isExpired = expired(now);
    if (isExpired && size()) flush();
    if (isExpired) reset(now);
    if (logging) debug(now);
    return isExpired;
  }

  return { debug, expired, flush, size, stale, state, reset };
}

module.exports = { cacheable };
