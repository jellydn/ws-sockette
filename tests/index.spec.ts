import {test} from 'uvu';
import * as assert from 'uvu/assert';

import fn from '../src';

test('exports', () => {
  assert.is(typeof fn, 'function');
});
test.run();
