import { questions, types } from './questions.js';
import { STORAGE_KEY, restore, emptyState, complete, grade, stats, isManual, escapeHTML as esc } from './engine.js';
import { chapters, cards, MEMORY_KEY, restoreMemory } from './memory.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let storageAvailable = true;
const read = key => { try { return localStorage.getItem(key); } catch { storageAvailable = false; return null; } };
let state = restore(read(STORAGE_KEY));
let memory = restoreMemory(read(MEMORY_KEY));
let memoryRevealed = false;
let toastTimer;
const current = () => questions.find(q => q.id === state.current);
const entry = id => state.entries[id] ||= { answers: [], status: null, revealed: false, everWrong: false, override: false };
const filtered = () => questions.filter(q => (state.type === 'all' || state.type === q.type) && (state.mode === 'all' || (state.mode === 'wrong' ? entry(q.id).everWrong : state.bookmarks.includes(q.id))));

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('#save-status').textContent = storageAvailable ? '이 브라우저에 자동 저장' : '저장 불가 · 이 창에서만 유지';
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600);
}
function highlight(line) {
  const pattern = /\/\/.*$|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:class|int|char|void|return|public|private|const|new|delete|for|if|else|using|namespace|double|float|this)\b|\b\d+\b/g;
  let text = '', previous = 0;
  for (const match of line.matchAll(pattern)) {
    text += esc(line.slice(previous, match.index));
    const token = match[0];
    const type = /^\/\* [A-Z] \*\/$/.test(token) ? 'code-blank' : /^\//.test(token) ? 'tok-comment' : /^["']/.test(token) ? 'tok-string' : /^\d/.test(token) ? 'tok-number' : 'tok-keyword';
    text += `<span class="${type}">${esc(token)}</span>`; previous = match.index + token.length;
  }
  return text + esc(line.slice(previous));
}
function codePanel(code, title = 'C++') {
  return `<div class="code-panel"><div class="code-toolbar"><span>${esc(title)}</span><span>READ · TRACE · UNDERSTAND</span></div><pre><code>${code.split('\n').map((line, i) => `<span class="code-line"><span class="line-no" aria-hidden="true">${i + 1}</span>${highlight(line)}</span>`).join('')}</code></pre></div>`;
}
function updateChrome() {
  const s = stats(state), learning = state.view === 'memory';
  const done = learning ? memory.known.length : s.reviewed, total = learning ? cards.length : questions.length;
  $('.progress-card .row > span').textContent = learning ? '암기 완료' : '채점 완료';
  $('#progress-text').innerHTML = `${done} <small>/ ${total}</small>`;
  $('#progress').max = total; $('#progress').value = done;
  $('#progress').setAttribute('aria-label', learning ? '암기 완료 카드 수' : '채점 완료 문제 수');
  $('#progress-caption').textContent = done === total ? '모두 확인했어요. 헷갈린 내용을 다시 살펴보세요.' : learning ? '답을 가리고 설명할 수 있으면 암기 완료!' : done ? `${total - done}문제 남았어요. 내 속도로 계속해 보세요.` : '첫 문제부터 시작해 볼까요?';
  $('#count-wrong').textContent = s.wrongHistory; $('#count-bookmarks').textContent = state.bookmarks.length;
  $('#count-memory').textContent = `${memory.known.length}/${cards.length}`;
  $$('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(!learning && b.dataset.mode === state.mode)));
  $('#memory-open').setAttribute('aria-pressed', String(learning));
  $('.navigator').hidden = learning;
  const list = filtered();
  $('#filtered-count').textContent = `${list.length}문제`;
  $('#question-grid').innerHTML = list.map(q => {
    const e = entry(q.id), status = e.status || (e.answers.some(a => a?.trim()) ? 'draft' : '');
    const label = { correct: '정답', incorrect: '오답', draft: '작성 중', review: '직접 채점 대기' }[status] || '미풀이';
    return `<button data-question="${q.id}" class="${status} ${state.bookmarks.includes(q.id) ? 'bookmarked' : ''}" aria-current="${q.id === state.current}" aria-label="${q.id}번 ${types[q.type]}, ${label}">${q.id}</button>`;
  }).join('');
  if (!learning) {
    $('#check').disabled = !complete(current(), entry(state.current).answers);
    $('#check').textContent = isManual(current()) ? '모범답안 보기' : entry(state.current).revealed ? '다시 채점' : '정답 확인';
  }
}
function renderAnswers(q, e) {
  if (q.options) return `<fieldset class="answer-fieldset"><legend class="answer-label">${q.type === 'ox' ? '옳으면 O, 틀리면 X를 선택하세요.' : '정답 하나를 선택하세요.'}</legend><div class="choices ${q.type === 'ox' ? 'ox' : ''}">${q.options.map((option, i) => `<label class="choice ${e.answers[0] === String(i) ? 'selected' : ''}"><input type="radio" name="answer" data-answer="0" value="${i}" ${e.answers[0] === String(i) ? 'checked' : ''}><span class="choice-badge" aria-hidden="true">${q.type === 'ox' ? option : i + 1}</span><span class="choice-label">${q.type === 'ox' ? (i === 0 ? '맞아요' : '아니에요') : esc(option)}</span><span class="sr-only">${q.type === 'ox' ? option : ''}</span></label>`).join('')}</div></fieldset>`;
  const fields = q.fields || [{ label: '내 답안', multiline: true }];
  return `<div class="answer-label">${isManual(q) ? '먼저 작성한 뒤 모범답안과 비교해 보세요.' : '빈칸에 들어갈 내용 또는 출력값을 적어 주세요.'}</div><div class="fields">${fields.map((f, i) => `<div class="field ${f.multiline ? 'wide' : ''}"><label for="answer-${i}">${esc(f.label)}</label>${f.multiline ? `<textarea id="answer-${i}" data-answer="${i}" rows="${q.id === 20 ? 6 : 5}" maxlength="8000" spellcheck="false" placeholder="${isManual(q) ? '내 생각과 풀이를 적어 보세요.' : '출력 순서대로 한 줄씩 입력하세요.'}">${esc(e.answers[i] || '')}</textarea>` : `<input id="answer-${i}" data-answer="${i}" type="text" maxlength="500" spellcheck="false" autocomplete="off" placeholder="답을 입력하세요" value="${esc(e.answers[i] || '')}">`}<span class="field-result" data-field-result="${i}"></span></div>`).join('')}</div><p class="input-note">${isManual(q) ? '문장의 표현이 달라도 핵심 내용이 맞으면 정답으로 표시할 수 있어요.' : '공백·줄바꿈 차이는 채점에서 무시합니다. 코드 빈칸의 마지막 세미콜론은 생략해도 됩니다.'}</p>`;
}
function renderFeedback() {
  const q = current(), e = entry(q.id), box = $('#feedback');
  box.hidden = !e.revealed;
  $$('[data-answer]').forEach(input => input.classList.remove('is-correct', 'is-incorrect'));
  $$('[data-field-result]').forEach(el => el.textContent = '');
  if (!e.revealed) return;
  const result = grade(q, e.answers);
  if (result.kind === 'automatic' && q.fields) q.fields.forEach((f, i) => {
    $(`[data-answer="${i}"]`).classList.add(result.fields[i] ? 'is-correct' : 'is-incorrect');
    $(`[data-field-result="${i}"]`).textContent = result.fields[i] ? '일치해요' : '모범답안과 비교해 보세요';
  });
  box.className = `feedback ${e.status || 'review'}`;
  const heading = e.status === 'correct' ? '잘 이해했어요!' : e.status === 'incorrect' ? '이 부분을 한 번 더 확인해 볼까요?' : '모범답안과 비교해 보세요.';
  const key = q.options ? `${q.type === 'choice' ? `${q.correct + 1}번 · ` : ''}${q.options[q.correct]}` : q.fields ? q.fields.map(f => `${f.label}\n${f.answers[0]}`).join('\n\n') : '';
  box.innerHTML = `<h3>${heading}${e.override ? ' <small>· 직접 채점</small>' : ''}</h3>${key ? `<div class="answer-key">${esc(key)}</div>` : ''}<p>${esc(q.explanation)}</p>${q.solution ? codePanel(q.solution, '모범 코드') : ''}${isManual(q) ? `<p>핵심 원인과 해결 방법이 맞는지 확인한 뒤 직접 채점하세요.</p><div class="self-grade"><button class="button primary" data-self-grade="correct">맞혔어요</button><button class="button" data-self-grade="incorrect">다시 공부할게요</button></div>` : q.fields ? `<details class="equivalent"><summary>답은 다르게 썼지만 의미가 같나요?</summary><p>코드에는 같은 의미의 여러 표현이 있어요. 모범답안과 비교하고 직접 결과를 정할 수 있습니다.</p><div class="self-grade"><button class="button" data-self-grade="correct">내 답도 정답으로 표시</button><button class="button" data-self-grade="incorrect">오답으로 표시</button></div></details>` : ''}`;
}
function renderPractice() {
  $('#memory-view').hidden = true;
  $$('#main > :not(#memory-view)').forEach(el => el.hidden = false);
  const list = filtered();
  $('#view-title').textContent = { all: '오늘의 연습', wrong: '오답노트', bookmarks: '다시 보고 싶은 문제' }[state.mode];
  $('#mode-description').textContent = { all: '정답을 보기 전에, 먼저 내 생각을 적어 보세요.', wrong: '한 번 틀렸던 문제를 모았어요. 다시 맞힌 문제도 남아 있습니다.', bookmarks: '별표로 표시한 문제를 한곳에서 복습하세요.' }[state.mode];
  $('#type-filter').value = state.type;
  if (!list.length) {
    $('#question').innerHTML = `<div class="empty"><div class="empty-icon">${state.mode === 'bookmarks' ? '☆' : '✓'}</div><h3>아직 모인 문제가 없어요.</h3><p>${state.type !== 'all' ? '다른 유형을 선택하거나 전체 문제로 돌아가 보세요.' : state.mode === 'wrong' ? '문제를 풀고 틀린 내용을 여기에서 복습할 수 있어요.' : '문제 오른쪽의 별표를 누르면 여기에 모입니다.'}</p><button class="button primary" data-show-all>전체 문제 풀기</button></div>`;
    $('#feedback').hidden = true; $('#question-actions').hidden = true; updateChrome(); return;
  }
  if (!list.some(q => q.id === state.current)) state.current = list[0].id;
  const q = current(), e = entry(q.id), index = list.findIndex(item => item.id === q.id);
  $('#question').innerHTML = `<div class="question-meta"><div class="question-tags"><span class="type-pill">${types[q.type]}</span><span class="chapter-tag">${q.chapter}</span>${isManual(q) ? '<span class="chapter-tag">· 직접 채점</span>' : ''}</div><button id="bookmark" class="icon-button" aria-pressed="${state.bookmarks.includes(q.id)}" aria-label="${q.id}번 문제 북마크">${state.bookmarks.includes(q.id) ? '★' : '☆'}</button></div><p class="question-number">QUESTION ${String(q.id).padStart(2, '0')} / 25</p><h3 class="question-title">${esc(q.title)}</h3>${q.note ? `<p class="question-note">${esc(q.note)}</p>` : ''}${q.code ? codePanel(q.code) : ''}<div class="answer-area">${renderAnswers(q, e)}</div>`;
  $('#previous').disabled = index === 0; $('#next').disabled = index === list.length - 1;
  $('#position').textContent = `${index + 1} / ${list.length}`;
  renderFeedback(); updateChrome(); save();
}
function render() { if (state.view === 'memory') renderMemory(); else renderPractice(); }
function go(id) { state.current = id; render(); $('#question').focus({ preventScroll: true }); $('#main').scrollIntoView({ block: 'start', behavior: 'instant' }); }
function setMode(mode) { state.view = 'practice'; state.mode = mode; render(); save(); }
function showAll() { state.type = 'all'; setMode('all'); }
function selfGrade(status) {
  const e = entry(state.current);
  if (!complete(current(), e.answers)) return;
  e.status = status; e.override = true; e.revealed = true; if (status === 'incorrect') e.everWrong = true;
  save(); renderFeedback(); updateChrome(); toast(status === 'correct' ? '정답으로 표시했어요.' : '오답노트에 모아두었어요.');
}
function check() {
  const q = current(), e = entry(q.id), result = grade(q, e.answers);
  if (result.kind === 'incomplete') return toast('답안을 모두 입력해 주세요.');
  e.status = result.kind === 'manual' ? 'review' : result.correct ? 'correct' : 'incorrect';
  e.revealed = true; e.override = false; if (e.status === 'incorrect') e.everWrong = true;
  save(); renderFeedback(); updateChrome();
  $('#feedback').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function answerChanged(target) {
  const e = entry(state.current); e.answers[Number(target.dataset.answer)] = target.value;
  e.status = null; e.revealed = false; e.override = false;
  $$('.choice').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
  renderFeedback(); save(); updateChrome();
}
function showSummary() {
  const s = stats(state), percent = s.reviewed ? Math.round(s.correct / s.reviewed * 100) : 0;
  $('#summary-content').innerHTML = `<div class="summary-score">${percent}<small>%</small></div><p>채점 완료 ${s.reviewed}문제 중 ${s.correct}문제를 맞혔어요.<br>직접 채점한 결과도 포함합니다.</p><div class="summary-grid"><div><strong>${s.correct}</strong><span>정답</span></div><div><strong>${s.incorrect}</strong><span>오답</span></div><div><strong>${25 - s.reviewed}</strong><span>채점 전</span></div></div>${s.pending ? `<p>모범답안 확인 후 직접 채점을 기다리는 문제: ${s.pending}개</p>` : ''}<p>핵심 암기 완료 <strong>${memory.known.length} / ${cards.length}</strong></p>`;
  $('#summary-dialog').showModal();
}

// Memorization: each chapter has a concise reference sheet and answer-hidden recall cards.
function saveMemory() { save(); updateChrome(); }
function renderMemory() {
  $$('#main > :not(#memory-view)').forEach(el => el.hidden = true);
  const host = $('#memory-view'); host.hidden = false;
  const chapter = chapters.find(c => c.id === memory.chapter), deck = cards.filter(c => c.chapter === memory.chapter);
  memory.index = Math.min(memory.index, deck.length - 1);
  const known = deck.filter(c => memory.known.includes(c.id)).length;
  host.innerHTML = `<div class="workspace-top"><div><span class="eyebrow">MEMORY LAB / ${cards.length} CORE CARDS</span><h2>읽고, 가리고, 기억하기.</h2></div></div><p class="mode-description">한 문장으로 설명할 수 있으면, 내 지식이 됩니다.</p><div class="chapter-tabs" role="group" aria-label="암기 파트 선택">${chapters.map(c => `<button data-chapter="${c.id}" aria-pressed="${memory.chapter === c.id}">${esc(c.label)}</button>`).join('')}</div><div class="memory-section-heading"><div><h3>${esc(chapter.subtitle)}</h3><p>${deck.length}개의 핵심 · 암기 완료 ${known}개</p></div><div class="memory-switch" role="group" aria-label="암기 학습 방식"><button data-memory-mode="summary" aria-pressed="${memory.mode === 'summary'}">핵심 요약</button><button data-memory-mode="cards" aria-pressed="${memory.mode === 'cards'}">가리고 외우기</button></div></div>${chapter.note ? `<p class="scope-note">${esc(chapter.note)}</p>` : ''}${memory.mode === 'summary' ? `<div class="memory-grid">${deck.map((c, i) => `<article class="memory-note ${memory.known.includes(c.id) ? 'known' : ''}"><div class="row"><span class="memory-index">${String(i + 1).padStart(2, '0')}</span><button class="known-toggle" data-known="${c.id}" aria-pressed="${memory.known.includes(c.id)}">${memory.known.includes(c.id) ? '✓ 암기 완료' : '암기 완료 표시'}</button></div><h4>${esc(c.title)}</h4><p>${esc(c.answer)}</p>${c.code ? `<pre class="memory-code"><code>${esc(c.code)}</code></pre>` : ''}<div class="memory-hook"><span>기억할 한 문장</span>${esc(c.hook)}</div></article>`).join('')}</div>` : renderFlash(deck)}<div class="memory-footer"><span>암기 표시는 이 브라우저에 저장됩니다.</span><button class="button" data-practice-link>문제로 확인하기 →</button></div>`;
  updateChrome(); save();
}
function renderFlash(deck) {
  const c = deck[memory.index];
  return `<article class="flashcard"><div class="row"><span class="type-pill">RECALL CARD</span><span class="chapter-tag">${memory.index + 1} / ${deck.length}</span></div><span class="flash-topic">${esc(c.title)}</span><h3>${esc(c.prompt)}</h3>${memoryRevealed ? `<div class="flash-answer"><p>${esc(c.answer)}</p>${c.code ? `<pre class="memory-code"><code>${esc(c.code)}</code></pre>` : ''}<div class="memory-hook"><span>기억할 한 문장</span>${esc(c.hook)}</div></div><div class="flash-ratings"><button class="button" data-recall="again">한 번 더 볼래요</button><button class="button primary" data-recall="known">기억했어요 ✓</button></div>` : '<p class="recall-hint">먼저 머릿속으로 답하거나, 소리 내어 설명해 보세요.</p><button class="button primary" id="reveal-memory">정답 펼치기</button>'}</article><div class="flash-navigation"><button class="button" data-card-step="-1" ${memory.index === 0 ? 'disabled' : ''}>← 이전 카드</button><span>${memory.known.includes(c.id) ? '✓ 암기 완료한 카드' : '반복해서 내 것으로 만들어요.'}</span><button class="button" data-card-step="1" ${memory.index === deck.length - 1 ? 'disabled' : ''}>다음 카드 →</button></div>`;
}
function toggleKnown(id, force) {
  const shouldKnow = force ?? !memory.known.includes(id);
  memory.known = memory.known.filter(x => x !== id); if (shouldKnow) memory.known.push(id);
  saveMemory();
}

Object.entries(types).forEach(([key, label]) => $('#type-filter').add(new Option(label, key)));
$$('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
$('#type-filter').addEventListener('change', event => { state.type = event.target.value; render(); });
$('#memory-open').addEventListener('click', () => { state.view = 'memory'; render(); });
$('#question-grid').addEventListener('click', event => { const button = event.target.closest('[data-question]'); if (button) go(Number(button.dataset.question)); });
$('#question').addEventListener('input', event => { if (event.target.matches('[data-answer]') && event.target.type !== 'radio') answerChanged(event.target); });
$('#question').addEventListener('change', event => { if (event.target.matches('input[type=radio]')) answerChanged(event.target); });
$('#question').addEventListener('click', event => {
  if (event.target.closest('[data-show-all]')) return showAll();
  if (event.target.closest('#bookmark')) {
    const id = state.current, included = state.bookmarks.includes(id);
    state.bookmarks = included ? state.bookmarks.filter(n => n !== id) : [...state.bookmarks, id];
    render(); save(); toast(included ? '북마크를 해제했어요.' : '북마크에 모아두었어요.');
  }
});
$('#feedback').addEventListener('click', event => { const button = event.target.closest('[data-self-grade]'); if (button) selfGrade(button.dataset.selfGrade); });
$('#check').addEventListener('click', check);
$('#previous').addEventListener('click', () => { const list = filtered(), i = list.findIndex(q => q.id === state.current); if (i > 0) go(list[i - 1].id); });
$('#next').addEventListener('click', () => { const list = filtered(), i = list.findIndex(q => q.id === state.current); if (i < list.length - 1) go(list[i + 1].id); });
$('#summary-open').addEventListener('click', showSummary);
$$('[data-close]').forEach(button => button.addEventListener('click', () => $(`#${button.dataset.close}`).close()));
$('#review-wrong').addEventListener('click', () => { $('#summary-dialog').close(); state.type = 'all'; setMode('wrong'); });
function openReset() { if ($('#summary-dialog').open) $('#summary-dialog').close(); $('#reset-dialog').showModal(); }
$('#reset-open').addEventListener('click', openReset); $('#summary-reset').addEventListener('click', openReset);
$('#reset-confirm').addEventListener('click', () => { state = emptyState(); memory = restoreMemory(null); memoryRevealed = false; save(); $('#reset-dialog').close(); render(); toast('새로운 마음으로 시작해요.'); });
$('#memory-view').addEventListener('click', event => {
  const chapter = event.target.closest('[data-chapter]'), mode = event.target.closest('[data-memory-mode]'), known = event.target.closest('[data-known]'), step = event.target.closest('[data-card-step]'), recall = event.target.closest('[data-recall]');
  if (chapter) { memory.chapter = chapter.dataset.chapter; memory.index = 0; memoryRevealed = false; renderMemory(); }
  else if (mode) { memory.mode = mode.dataset.memoryMode; memoryRevealed = false; renderMemory(); }
  else if (known) { toggleKnown(known.dataset.known); renderMemory(); }
  else if (step) { memory.index += Number(step.dataset.cardStep); memoryRevealed = false; renderMemory(); }
  else if (recall) {
    const deck = cards.filter(c => c.chapter === memory.chapter);
    toggleKnown(deck[memory.index].id, recall.dataset.recall === 'known');
    if (memory.index < deck.length - 1) { memory.index++; memoryRevealed = false; }
    else toast('이 파트를 모두 확인했어요. 다른 파트도 살펴보세요.');
    renderMemory();
  }
  else if (event.target.closest('#reveal-memory')) { memoryRevealed = true; renderMemory(); }
  else if (event.target.closest('[data-practice-link]')) showAll();
});
document.addEventListener('keydown', event => {
  if (state.view !== 'practice' || $('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
  const q = current();
  if (q.options && /^[1-4]$/.test(event.key) && Number(event.key) <= q.options.length && !$('#question-actions').hidden) {
    const input = $(`input[name=answer][value="${Number(event.key) - 1}"]`); input.checked = true; answerChanged(input); event.preventDefault();
  }
});
render();
if (!storageAvailable) $('#save-status').textContent = '저장 불가 · 이 창에서만 유지';
