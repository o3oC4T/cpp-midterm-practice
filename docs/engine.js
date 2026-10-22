import { questions } from './questions.js';
export const STORAGE_KEY = 'cpp-midterm-practice:lecture-v2';
export const isManual = q => ['debug', 'short'].includes(q.type);
export function normalize(value, mode = 'output') {
  const s = String(value ?? '').trim();
  return mode === 'code' ? s.replace(/;+$/, '').replace(/\s+/g, '') : s.replace(/\s+/g, ' ');
}
export function complete(q, answers = []) {
  if (q.options) return answers.length === 1 && /^\d$/.test(answers[0]) && Number(answers[0]) < q.options.length;
  return Array.from({ length: q.fields?.length || 1 }, (_, i) => answers[i]).every(a => typeof a === 'string' && a.trim().length > 0);
}
export function grade(q, answers) {
  if (!complete(q, answers)) return { kind: 'incomplete' };
  if (isManual(q)) return { kind: 'manual' };
  const fields = q.options ? [Number(answers[0]) === q.correct] : q.fields.map((f, i) => f.answers.some(a => normalize(a, f.mode) === normalize(answers[i], f.mode)));
  return { kind: 'automatic', correct: fields.every(Boolean), fields };
}
export function emptyState() { return { version: 1, view: 'practice', current: 1, mode: 'all', type: 'all', entries: {}, bookmarks: [] }; }
export function restore(raw) {
  const clean = emptyState();
  try {
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1) return clean;
    if (saved.view === 'memory') clean.view = 'memory';
    if (questions.some(q => q.id === saved.current)) clean.current = saved.current;
    if (['all', 'wrong', 'bookmarks'].includes(saved.mode)) clean.mode = saved.mode;
    if (['all', ...questions.map(q => q.type)].includes(saved.type)) clean.type = saved.type;
    clean.bookmarks = [...new Set(Array.isArray(saved.bookmarks) ? saved.bookmarks : [])].filter(id => questions.some(q => q.id === id));
    for (const q of questions) {
      const e = saved.entries?.[q.id];
      if (!e || !Array.isArray(e.answers)) continue;
      const answers = e.answers.slice(0, q.fields?.length || 1).map(a => typeof a === 'string' ? a.slice(0, 8000) : '');
      const result = grade(q, answers);
      let status = null;
      if (e.revealed && result.kind === 'automatic') status = result.correct ? 'correct' : 'incorrect';
      if (e.revealed && result.kind === 'manual') status = ['correct', 'incorrect'].includes(e.status) ? e.status : 'review';
      // A learner may recognize a valid equivalent expression not in the automatic answer list.
      if (e.override === true && e.revealed && result.kind === 'automatic' && !q.options) status = ['correct', 'incorrect'].includes(e.status) ? e.status : status;
      clean.entries[q.id] = { answers, status, revealed: Boolean(e.revealed && status), everWrong: Boolean(e.everWrong || status === 'incorrect'), override: Boolean(e.override && !q.options) };
    }
  } catch { /* A missing or damaged local save starts a fresh attempt. */ }
  return clean;
}
export function stats(state) {
  const entries = Object.values(state.entries);
  const correct = entries.filter(e => e.status === 'correct').length;
  const incorrect = entries.filter(e => e.status === 'incorrect').length;
  return { correct, incorrect, reviewed: correct + incorrect, pending: entries.filter(e => e.status === 'review').length, wrongHistory: entries.filter(e => e.everWrong).length };
}
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
