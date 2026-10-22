import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, snapshotAt, pointerStatus, initialPointerLab, pointTo, callThroughPointer } from '../docs/object-model.js';
import { lessons, checks } from '../docs/object-content.js';

test('a pointer declaration does not construct an object',()=>{
  const state=snapshotAt('single',2);
  assert.deepEqual(state.blocks,[]);
  assert.equal(pointerStatus(state,'p'),'null');
  assert.equal(state.output,'');
});
test('single object destruction is separate from null assignment and pointer lifetime',()=>{
  const live=snapshotAt('single',5);
  assert.equal(live.blocks[0].values[0],7);
  assert.equal(pointerStatus(live,'p'),'live');
  const freed=snapshotAt('single',6);
  assert.equal(freed.blocks[0].alive,false);
  assert.equal(pointerStatus(freed,'p'),'dangling');
  assert.equal(freed.output,'C 3\n7\nD 7\n');
  const cleared=snapshotAt('single',7);
  assert.equal(pointerStatus(cleared,'p'),'null');
  assert.equal(cleared.output,freed.output,'null assignment does not call a destructor');
  assert.equal(pointerStatus(snapshotAt('single',8),'p'),'absent');
  assert.equal(snapshotAt('single',5).blocks[0].alive,true,'rewinding recreates the prior state');
});
test('array pointer movement preserves base; delete[] destroys in reverse and leaves both pointers dangling',()=>{
  const moved=snapshotAt('array',7);
  assert.equal(moved.pointers.base.index,0);
  assert.equal(moved.pointers.p.index,1);
  assert.deepEqual(moved.blocks[0].values,[2,4,6]);
  const freed=snapshotAt('array',9);
  assert.deepEqual(freed.destroyed,[{index:2,value:6},{index:1,value:4},{index:0,value:2}]);
  assert.equal(freed.output,'C 1\nC 1\nC 1\n4\nD 6\nD 4\nD 2\n');
  assert.equal(pointerStatus(freed,'base'),'dangling');
  assert.equal(pointerStatus(freed,'p'),'dangling');
  assert.equal(pointerStatus(snapshotAt('array',10),'base'),'null');
  assert.equal(pointerStatus(snapshotAt('array',10),'p'),'dangling');
  assert.equal(pointerStatus(snapshotAt('array',11),'p'),'null');
  assert.deepEqual(snapshotAt('array',scenarios.array.length).pointers,{});
});
test('redirecting a pointer leaves objects intact; calls change only the selected object',()=>{
  const original=initialPointerLab();
  const moved=pointTo(original,'pizza');
  assert.deepEqual(moved.objects,{donut:2,pizza:5});
  const changed=callThroughPointer(moved,7);
  assert.equal(changed.kind,'updated');
  assert.deepEqual(changed.state.objects,{donut:2,pizza:7});
  assert.deepEqual(original.objects,{donut:2,pizza:5});
  assert.deepEqual(callThroughPointer(changed.state,0).state,changed.state);
  const cleared=pointTo(changed.state,null);
  assert.deepEqual(cleared.objects,{donut:2,pizza:7},'nulling a pointer does not destroy local objects');
  assert.equal(callThroughPointer(cleared,4).kind,'null');
});
test('ten lessons and six checks stay within the lecture references',()=>{
  assert.equal(lessons.length,10);
  assert.equal(new Set(lessons.map(l=>l.id)).size,10);
  for(const lesson of lessons){
    assert.ok(lesson.body().length>200);
    for(const ref of lesson.refs)assert.ok(ref.chapter===4 && ref.first>=3 && ref.last>=ref.first && ref.last<=28);
  }
  assert.equal(checks.length,6);
  for(const q of checks)assert.ok(q.explanation && q.options[q.correct]);
});
