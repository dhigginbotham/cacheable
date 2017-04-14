const { test } = require('tape');
const { cacheable } = require('../');

const store = {
  ttl: '3s',
  key: 'testCache'
};

test('verify initial object creation', (assert) => {
  const { expired, state, stale, reset, flush } = cacheable(store);

});