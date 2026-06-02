import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPlan, progress } from '../src/lib/state.js';

const state = {
  goal: 'G',
  recipe: 'demo',
  current: 1,
  steps: [
    { title: 'a', status: 'completed', check: 'x' },
    { title: 'b', status: 'pending', check: 'y' },
  ],
};

test('progress counts completed steps', () => {
  assert.deepEqual(progress(state), { done: 1, total: 2 });
});

test('renderPlan renders checkboxes, current marker, and progress', () => {
  const md = renderPlan(state);
  assert.match(md, /- \[x\] 1\. a/);
  assert.match(md, /- \[ \] 2\. b/);
  assert.match(md, /← current/);
  assert.match(md, /Progress:\*\* 1\/2/);
});
