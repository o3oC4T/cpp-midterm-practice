import test from 'node:test';
import assert from 'node:assert/strict';
import { traceAt, traceSteps, initialObjects, setRadius } from '../docs/class-model.js';
import { lessons, checks } from '../docs/class-content.js';
import { lectureDocuments } from '../docs/sources.js';

test('trace shows construction, independent members, read-only getters, then reverse destruction', () => {
  assert.deepEqual(traceAt(0).objects, {});
  assert.deepEqual(traceAt(1).objects, {});
  assert.deepEqual(traceAt(2).objects, {donut: 2});
  assert.deepEqual(traceAt(3).objects, {donut: 2, pizza: 5});
  assert.deepEqual(traceAt(4).objects, {donut: 4, pizza: 5});
  assert.deepEqual(traceAt(5).objects, traceAt(4).objects);
  assert.equal(traceAt(5).output, '4 ');
  assert.equal(traceAt(6).output, '4 5\n');
  const end = traceAt(traceSteps.length);
  assert.deepEqual(end.objects, {});
  assert.deepEqual(end.destroyed, ['pizza', 'donut']);
  assert.equal(end.output, '4 5\n');
  assert.deepEqual(traceAt(3).objects, {donut: 2, pizza: 5}, 'rewinding restores earlier state');
});
test('sandbox updates only the selected object and rejects a nonpositive radius', () => {
  const before = initialObjects();
  const after = setRadius(before, 'pizza', 8);
  assert.equal(after.accepted, true);
  assert.deepEqual(after.objects, {donut: 2, pizza: 8});
  assert.deepEqual(before, {donut: 2, pizza: 5});
  for (const value of [0, -1]) {
    const result = setRadius(after.objects, 'pizza', value);
    assert.equal(result.accepted, false);
    assert.deepEqual(result.objects, after.objects);
  }
  assert.equal(setRadius({}, 'donut', 2).accepted, false, 'cannot mutate an object before construction');
});
test('all lesson routes are unique, references are in range, and checks have valid answers', () => {
  assert.equal(new Set(lessons.map(l => l.id)).size, 9);
  for (const lesson of lessons) {
    assert.ok(lesson.body().length > 200);
    for (const ref of lesson.refs) assert.ok(ref.first >= 1 && ref.last >= ref.first && ref.last <= lectureDocuments[ref.chapter].pages);
  }
  assert.equal(checks.length, 5);
  for (const q of checks) assert.ok(q.explanation && q.options[q.correct]);
});
