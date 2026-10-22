import { escapeHTML as esc } from './engine.js';
import { sourceLabel } from './sources.js';
import { code } from './class-content.js';
import { lessons, checks } from './reference-content.js';
import { stepsFor, snapshotAt, programFor, averageResult, swapFunction, increaseFunction } from './reference-model.js';
const $ = selector => document.querySelector(selector);
const traceStates = Object.fromEntries(['alias','swap','object','return','copy'].map(kind => [kind, { position: 0, mode: kind === 'copy' ? 'shallow' : 'value' }]));
const answers = new Map();
let lessonIndex = 0, averageSize = 6;
function memoryMarkup(state, kind) {
  if (kind === 'copy') return `<div class="reference-memory"><h3>Person 객체와 name의 대상</h3><div class="copy-owners">${state.owners.map(o => {
    const alive = state.heap.find(b => b.id === o.block).alive;
    return `<div class="copy-owner ${!o.alive ? 'owner-ended' : !alive ? 'owner-dangling' : ''}" data-owner="${o.name}" data-alive="${o.alive}" data-target="${o.block}"><strong>${o.name}</strong>${o.alive ? `<span>id = 1</span><code>name → ${o.block}</code><small>${alive ? '문자열을 가리킴' : '해제된 공간 · 접근 금지'}</small>` : '<span>객체 소멸 완료</span>'}</div>`;
  }).join('')}</div><h3>동적 문자열 공간</h3><div class="copy-heap">${state.heap.map(b => `<div class="copy-block ${b.alive ? '' : 'block-ended'}" data-block="${b.id}" data-alive="${b.alive}"><span>${b.id} · char 배열 5칸</span>${b.alive ? `<strong>${esc(b.value)}</strong><small>끝에 널 문자 \\0 포함</small>` : '<strong>해제 완료</strong>'}</div>`).join('') || '<p class="state-empty">아직 동적 공간을 만들지 않았습니다.</p>'}</div>${state.blocked ? '<p class="unsafe-stop" role="status">두 번째 해제 직전에서 멈춤<br>같은 메모리를 다시 해제하면 안 됩니다.</p>' : ''}</div>`;
  const scopes = [...new Set(state.cells.map(c => c.scope))];
  return `<div class="reference-memory"><h3>${kind === 'object' ? '객체의 멤버 저장 공간' : '실제 값을 저장하는 공간'}</h3>${scopes.map(scope => `<section class="memory-scope"><h4>${esc(scope)}${scope === 'main' ? ' · 원본이 있는 곳' : ' · 함수의 별도 변수'}</h4><div class="value-cells">${state.cells.filter(c => c.scope === scope).map(c => `<div class="value-cell" data-cell="${esc(c.name)}"><strong>${esc(c.name)}</strong><b data-value>${esc(String(c.value))}</b>${c.aliases.length ? `<span class="alias-names">${c.aliases.map(a=>`<code>${esc(a)}</code>`).join(' ')}도 같은 공간의 이름</span>` : '<span class="alias-names">별도 저장 공간</span>'}</div>`).join('')}</div></section>`).join('') || `<p class="state-empty">${state.ended ? '지역 객체의 수명이 끝났습니다.' : '아직 선언한 변수가 없습니다.'}</p>`}${state.pointers.length ? `<h3>주소를 저장하는 포인터</h3><div class="pointer-routes">${state.pointers.map(p => `<div data-pointer="${p.name}"><code>${p.name}</code><span aria-hidden="true">→</span><strong>${esc(p.target)}의 주소</strong></div>`).join('')}</div>` : ''}<p class="memory-caption">같은 칸에 붙은 이름들은 같은 값을 읽고 바꿉니다.</p></div>`;
}
function renderTrace(focusId) {
  const kind = $('.reference-trace').dataset.kind;
  const current = traceStates[kind];
  const steps = stepsFor(kind, current.mode);
  const state = snapshotAt(kind, current.mode, current.position);
  const active = steps[current.position - 1];
  const definition = kind === 'swap' ? swapFunction(current.mode) : kind === 'object' ? increaseFunction(current.mode) : null;
  $('#reference-trace-view').innerHTML = `${definition ? code(definition, '선택한 방식의 함수 정의') : ''}<div class="trace-controls"><button class="button" id="trace-reset">처음부터</button><span>${current.position} / ${steps.length}단계</span><button class="button" id="trace-prev" ${current.position === 0 ? 'disabled' : ''}>← 이전 단계</button><button class="button primary" id="trace-next" ${current.position === steps.length ? 'disabled' : ''}>다음 단계 →</button></div><div class="reference-layout"><div><div class="code-panel trace-code"><div class="code-toolbar"><span>실행 순서 · 함수 진입·복귀 포함</span></div><pre><code>${steps.map((s,i) => `<span class="code-line ${i === current.position - 1 ? 'executed-line' : i >= current.position ? 'waiting-line' : ''}" ${i === current.position - 1 ? 'aria-current="step"' : ''}><span class="line-no" aria-hidden="true">${i+1}</span>${esc(s.code)}</span>`).join('')}</code></pre></div><div class="simulation-output"><span>C++ 예제의 출력</span><pre id="trace-output">${state.output ? esc(state.output) : '아직 출력 없음'}</pre></div></div>${memoryMarkup(state,kind)}</div><div class="trace-explanation" role="status"><h3>${state.blocked ? '잘못된 해제는 실행하지 않아요.' : current.position ? `${current.position}단계에서 일어난 일` : '다음 단계의 변화를 먼저 예상해 보세요.'}</h3><p>${esc(active?.note || '다음 단계 버튼으로 실행 흐름과 저장 공간을 함께 확인할 수 있습니다.')}</p></div>${kind !== 'copy' ? `<details class="lesson-detail"><summary>헤더와 main을 포함한 전체 코드</summary>${code(programFor(kind,current.mode))}</details>` : '<p class="class-note">실행 가능한 깊은 복사 전체 코드는 <a href="#deep-code">다음 설명</a>에 있습니다. 위 번호는 원본 소스의 줄 번호가 아닌 실행 단계입니다.</p>'}`;
  if (focusId) {
    let target = document.getElementById(focusId);
    if (target?.disabled) target = $('#trace-prev').disabled ? $('#trace-next') : $('#trace-prev');
    target?.focus({ preventScroll: true });
  }
}
function renderAverage() {
  $('#average-size').value = averageSize;
  const result = averageResult(averageSize);
  $('#average-result').innerHTML = `<div class="pending-call"><code>int avg = -99;<br>bool ok = average(x, ${averageSize}, avg);</code></div><div class="average-values"><div><span>반환값 ok</span><strong data-average-ok>${result.ok}</strong></div><div><span>호출 뒤 avg</span><strong data-average-value>${result.avg}</strong></div></div><p>${result.ok ? `sum = ${result.sum}, 정수 나눗셈 ${result.sum} / ${averageSize}의 결과 ${result.avg}를 원본 avg에 저장했습니다.` : 'avg에 대입하는 줄까지 가지 않아 -99가 남습니다. false이므로 avg를 계산 결과로 출력하지 않습니다.'}</p>`;
}
function renderCheck(q) {
  const chosen = answers.get(q.id);
  if (chosen == null) return;
  const host = $(`[data-check="${q.id}"]`);
  host.querySelector(`input[value="${chosen}"]`).checked = true;
  const result = host.querySelector('.check-result');
  result.hidden = false;
  result.className = `check-result ${chosen === q.correct ? 'correct' : 'incorrect'}`;
  result.textContent = `${chosen === q.correct ? '맞아요. ' : '다시 생각해 보세요. '}${q.explanation}`;
}
function renderLesson(focus = false) {
  const found = lessons.findIndex(l => l.id === location.hash.slice(1));
  lessonIndex = found >= 0 ? found : 0;
  const lesson = lessons[lessonIndex];
  $('#lesson-nav').innerHTML = lessons.map((l,i) => `<a href="#${l.id}" ${l.id === lesson.id ? 'aria-current="step"' : ''}><span>${String(i+1).padStart(2,'0')}</span>${esc(l.nav)}</a>`).join('');
  $('#lesson-content').innerHTML = `<header class="lesson-heading"><span class="eyebrow">REFERENCES &amp; COPYING / ${String(lessonIndex+1).padStart(2,'0')}</span><h2 id="lesson-heading" tabindex="-1">${esc(lesson.title)}</h2><div class="lecture-source">${lesson.refs.map(r => `<span>${esc(sourceLabel(r))}</span>`).join('')}</div></header><article class="lesson-body">${lesson.body()}</article>`;
  $('#lesson-position').textContent = `${lessonIndex+1} / ${lessons.length}`;
  $('#lesson-prev').disabled = lessonIndex === 0;
  $('#lesson-next').hidden = lessonIndex === lessons.length - 1;
  if ($('.reference-trace')) {
    if ($('#trace-mode')) $('#trace-mode').value = traceStates[$('.reference-trace').dataset.kind].mode;
    renderTrace();
  }
  if (lesson.id === 'average') renderAverage();
  if (lesson.id === 'check') checks.forEach(renderCheck);
  document.title = `${lesson.nav} · 5장 참조·복사 생성자`;
  if (focus) { $('#lesson-heading').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}
$('#lesson-prev').addEventListener('click', () => { if (lessonIndex > 0) location.hash = lessons[lessonIndex-1].id; });
$('#lesson-next').addEventListener('click', () => { if (lessonIndex < lessons.length - 1) location.hash = lessons[lessonIndex+1].id; });
$('#lesson-content').addEventListener('click', event => {
  const id = event.target.closest('button')?.id;
  if (!['trace-next','trace-prev','trace-reset'].includes(id)) return;
  const kind = $('.reference-trace').dataset.kind;
  const current = traceStates[kind];
  current.position = id === 'trace-reset' ? 0 : Math.max(0, Math.min(stepsFor(kind,current.mode).length, current.position + (id === 'trace-next' ? 1 : -1)));
  renderTrace(id);
});
$('#lesson-content').addEventListener('change', event => {
  if (event.target.id === 'trace-mode') {
    const current = traceStates[$('.reference-trace').dataset.kind];
    current.mode = event.target.value; current.position = 0; renderTrace();
  }
  if (event.target.id === 'average-size') { averageSize = Number(event.target.value); renderAverage(); }
  const box = event.target.closest('[data-check]');
  if (box && event.target.type === 'radio') {
    const q = checks.find(q => q.id === box.dataset.check);
    answers.set(q.id,Number(event.target.value)); renderCheck(q);
  }
});
window.addEventListener('hashchange', () => renderLesson(true));
renderLesson();
