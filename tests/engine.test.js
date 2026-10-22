import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, types } from '../docs/questions.js';
import { cards, chapters, restoreMemory } from '../docs/memory.js';
import { complete, grade, restore, emptyState, stats, escapeHTML } from '../docs/engine.js';

test('question bank covers the agreed mix, unique IDs, and complete answer keys', () => {
  assert.deepEqual(questions.map(q => q.id), Array.from({ length: 25 }, (_, i) => i + 1));
  const counts = Object.fromEntries(Object.keys(types).map(type => [type, questions.filter(q => q.type === type).length]));
  assert.deepEqual(counts, { ox: 10, choice: 4, fill: 3, trace: 4, debug: 2, short: 2 });
  for (const q of questions) {
    assert.ok(q.title && q.explanation && q.chapter);
    const answers = q.options ? [String(q.correct)] : q.fields ? q.fields.map(f => f.answers[0]) : ['내 설명'];
    const result = grade(q, answers);
    assert.equal(result.kind, ['debug', 'short'].includes(q.type) ? 'manual' : 'automatic');
    if (result.kind === 'automatic') assert.equal(result.correct, true, `Q${q.id}`);
  }
});
test('blank and partial answers cannot be graded as correct', () => {
  assert.equal(complete(questions[0], []), false);
  assert.equal(complete(questions[0], ['']), false);
  assert.equal(complete(questions[0], ['-1']), false);
  assert.equal(complete(questions[0], ['2']), false);
  assert.equal(grade(questions[14], ['width=w', 'height=h', '   ']).kind, 'incomplete');
  assert.equal(grade(questions[23], ['\n']).kind, 'incomplete');
});
test('incorrect choices and values are rejected without loose numeric coercion', () => {
  assert.equal(grade(questions[0], ['0']).correct, false);
  assert.equal(grade(questions[18], ['15', '15', '15', '15', '25', '25']).correct, false);
  assert.equal(grade(questions[20], ['C++ Study', 'J++', '09', 'Stu']).correct, false);
});
test('code whitespace and known equivalent expressions are accepted', () => {
  assert.equal(grade(questions[14], ['this->width = w;', 'height=h;', 'height * width;']).correct, true);
  assert.equal(grade(questions[15], ['Accumulator &', '(*this)', '10']).correct, true);
  assert.equal(grade(questions[16], ['new int { *d.p };', ' 10   20 ']).correct, true);
  assert.equal(grade(questions[15], ['Accumulator', '*this', '10']).correct, false);
});
test('trace answers preserve case and values but ignore layout whitespace', () => {
  const q = questions[19];
  assert.equal(grade(q, ['생성 1\r\n생성 2\nA\n소멸 2\nB\n소멸 1\n']).correct, true);
  assert.equal(grade(q, ['생성 1 생성 2 A B 소멸 2 소멸 1']).correct, false);
  assert.equal(grade(questions[20], ['C++ Study', 'J++', '9', 'stu']).correct, false);
});
test('restoration rejects damaged data and recomputes automatic results', () => {
  assert.deepEqual(restore('not-json'), emptyState());
  assert.deepEqual(restore('{"version":99}'), emptyState());
  const restored = restore(JSON.stringify({ version: 1, current: 999, bookmarks: [1, 1, 999], entries: { 1: { answers: ['0'], status: 'correct', revealed: true }, 22: { answers: ['원인과 코드'], status: 'correct', revealed: true }, 999: {} } }));
  assert.equal(restored.current, 1); assert.deepEqual(restored.bookmarks, [1]);
  assert.equal(restored.entries[1].status, 'incorrect'); assert.equal(restored.entries[22].status, 'correct');
  assert.equal(restored.entries[999], undefined); assert.equal(stats(restored).reviewed, 2);
});
test('self grading and wrong-answer history survive a reload', () => {
  const restored = restore(JSON.stringify({ version: 1, entries: { 15: { answers: ['w = width', 'height=h', 'width*height'], status: 'correct', revealed: true, override: true, everWrong: true } } }));
  assert.equal(restored.entries[15].status, 'correct'); assert.equal(restored.entries[15].override, true);
  assert.equal(stats(restored).wrongHistory, 1); assert.equal(stats(restored).incorrect, 0);
});
test('memory cards cover all six parts and clean restored progress', () => {
  assert.equal(cards.length, 32); assert.equal(new Set(cards.map(c => c.id)).size, 32);
  for (const chapter of chapters) assert.ok(cards.filter(c => c.chapter === chapter.id).length >= 4);
  for (const card of cards) assert.ok(card.prompt && card.answer && card.hook);
  const saved = restoreMemory(JSON.stringify({ chapter: 'ch5', mode: 'cards', index: 999, known: ['r1', 'r1', 'bogus'] }));
  assert.equal(saved.index, 0); assert.deepEqual(saved.known, ['r1']); assert.equal(saved.chapter, 'ch5');
});
test('user text is escaped before HTML rendering', () => {
  assert.equal(escapeHTML('<img src=x onerror="bad()">'), '&lt;img src=x onerror=&quot;bad()&quot;&gt;');
});
