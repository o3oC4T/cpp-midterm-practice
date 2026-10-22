import test from 'node:test';
import assert from 'node:assert/strict';
import { stepsFor, snapshotAt, averageResult } from '../docs/reference-model.js';
import { lessons, checks } from '../docs/reference-content.js';
const value = (s,n) => s.cells.find(c=>c.name===n)?.value;
const final = (kind,mode) => snapshotAt(kind,mode,stepsFor(kind,mode).length);

test('assigning through an alias changes the original without rebinding it',()=>{
  const assigned=snapshotAt('alias','value',3);
  assert.equal(value(assigned,'n'),9);
  assert.deepEqual(assigned.cells[0].aliases,['ref']);
  const increased=snapshotAt('alias','value',4);
  assert.equal(value(increased,'n'),10);
  assert.equal(value(increased,'i'),9);
  assert.deepEqual(snapshotAt('alias','value',5).pointers,[{name:'p',target:'n'}]);
  assert.equal(final('alias','value').output,'20 20 9\n');
});
test('swap changes only copies in value mode; pointer and reference modes change originals',()=>{
  for(const mode of ['value','pointer','reference']){
    const mid=snapshotAt('swap',mode,4);
    assert.equal(value(mid,'tmp'),2);
    assert.equal(value(mid,'m'),mode==='value'?2:9);
    assert.equal(value(mid,'n'),9);
    const done=final('swap',mode);
    assert.equal(done.output,mode==='value'?'2 9\n':'9 2\n');
    assert.equal(done.cells.length,2);
    assert.deepEqual(done.pointers,[]);
    assert.ok(done.cells.every(c=>c.aliases.length===0));
  }
});
test('a value parameter copies and destroys its own Circle; references and pointers do not',()=>{
  const copied=snapshotAt('object','value',3);
  assert.equal(value(copied,'original.radius'),3);
  assert.equal(value(copied,'c.radius'),4);
  assert.equal(final('object','value').output,'C 3\nCOPY 3\nD 4\n3\nD 3\n');
  for(const mode of ['pointer','reference']){
    assert.equal(value(snapshotAt('object',mode,3),'original.radius'),4);
    const returned=snapshotAt('object',mode,4);
    assert.equal(returned.cells.length,1);
    assert.equal(returned.output,'C 3\n');
    assert.equal(final('object',mode).output,'C 3\n4\nD 4\n');
  }
});
test('a reference return can be copied into an int or bound to another alias',()=>{
  const state=final('return','value');
  assert.equal(value(state,'data'),7);
  assert.equal(value(state,'copy'),3);
  assert.deepEqual(state.cells[0].aliases,['alias']);
  assert.equal(state.output,'7 3 7\n');
});
test('shallow copy aliases one allocation and stops before double deletion',()=>{
  const changed=snapshotAt('copy','shallow',4);
  assert.equal(changed.heap.length,1);
  assert.equal(changed.output,'1 Jisu\n1 Jisu\n');
  const freed=snapshotAt('copy','shallow',5);
  assert.equal(freed.owners[0].alive,true);
  assert.equal(freed.owners[1].alive,false);
  assert.equal(freed.heap[0].alive,false);
  assert.equal(final('copy','shallow').blocked,true);
  assert.equal(final('copy','shallow').ended,false);
});
test('deep copy owns independent strings and destroys each allocation once',()=>{
  const changed=snapshotAt('copy','deep',4);
  assert.equal(changed.heap.length,2);
  assert.equal(changed.output,'1 Mina\n1 Jisu\n');
  const freed=snapshotAt('copy','deep',5);
  assert.equal(freed.heap[0].alive,true);
  assert.equal(freed.heap[1].alive,false);
  const done=final('copy','deep');
  assert.equal(done.blocked,false);
  assert.equal(done.ended,true);
  assert.ok(done.heap.every(b=>!b.alive));
  assert.ok(done.owners.every(o=>!o.alive));
  assert.equal(snapshotAt('copy','deep',2).heap[1].value,'Mina','rewinding recreates state without retaining later mutations');
});
test('average returns success independently of a zero average and preserves output on failure',()=>{
  assert.deepEqual(averageResult(6),{ok:true,avg:2,sum:15});
  assert.deepEqual(averageResult(1),{ok:true,avg:0,sum:0});
  for(const size of [0,-2])assert.deepEqual(averageResult(size),{ok:false,avg:-99,sum:null});
  assert.throws(()=>averageResult(7),RangeError);
});
test('chapter 5 lessons have valid source ranges and rendered code contains no null characters',()=>{
  assert.equal(lessons.length,12);
  assert.equal(new Set(lessons.map(l=>l.id)).size,12);
  for(const l of lessons){
    assert.ok(l.body().length>200);
    assert.ok(!l.body().includes('\0'));
    for(const r of l.refs)assert.ok(r.chapter===5&&r.first>=3&&r.last>=r.first&&r.last<=66);
  }
  assert.equal(checks.length,8);
  assert.equal(new Set(checks.map(q=>q.id)).size,8);
  for(const q of checks)assert.ok(q.options[q.correct]&&q.explanation);
});
