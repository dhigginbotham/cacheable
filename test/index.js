const { test } = require('tape');
const log = require('debug')('cacheable:test:'); // eslint-disable-line
const { cacheable } = require('../');

const store = {
  ttl: '1s',
  key: 'testCache',
  offset: 0.65
};

test('verify initial object creation', (assert) => {
  assert.equal(store.ttl, '1s', 'Verify that the ttl is not mutated upon cache creation');
  assert.end();
});

test('verify stale state', (assert) => {
  const { state, stale } = cacheable(store);
  assert.equal(state(), true, 'it should be expired to begin with');
  assert.equal(stale(), false, 'it shouldn\'t be stale to begin with');

  store.cache.push({ testing: true });

  setTimeout(() => {
    assert.equal(stale(), true, 'verify that the stale state happens ~2/3 the ttl');
    assert.end();
  }, 1000 * store.offset);
});

test('verify expired state', (assert) => {
  const { state } = cacheable(store);

  setTimeout(() => {
    assert.equal(state(), true, 'verify expired happens when it should');
    assert.equal(store.cache.length, 0, 'verify that we empty the cache whenever we call into state');
    assert.end();
  }, 1000);
});
