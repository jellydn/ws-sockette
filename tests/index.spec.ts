import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {wsSockette} from '../src';

test('exports', () => {
  assert.is(typeof wsSockette, 'function');
});
test.run();
