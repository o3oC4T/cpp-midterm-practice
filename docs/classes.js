import { escapeHTML as esc } from './engine.js';
import { sourceLabel } from './sources.js';
import { lessons, checks } from './class-content.js';
import { traceSteps, traceAt, initialObjects, setRadius } from './class-model.js';
const $ = selector => document.querySelector(selector);
let lessonIndex = 0;
let traceStep = 0;
let sandbox = initialObjects();
let target = 'donut';
let inputRadius = 4;
const answers = new Map();

function objectsMarkup(objects, focus = null, destroyed = []) {
  return ['donut', 'pizza'].map(name => {
    const radius = objects[name];
    const alive = Number.isInteger(radius);
    return `<article class="live-object ${name === 'pizza' ? 'second' : ''} ${focus === name ? 'object-focus' : ''}" data-object="${name}"><div class="row"><strong>${name}</strong><span>${focus === name ? '이번 호출 대상' : 'Circle 객체'}</span></div><div class="circle-stage">${alive ? `<div class="radius-circle" style="--diameter:${radius * 14}px" aria-hidden="true"></div>` : `<span>${destroyed.includes(name) ? '소멸 완료' : '아직 생성 전'}</span>`}</div><div class="member-value"><code>radius</code><strong data-radius="${name}">${alive ? radius : '—'}</strong></div><p>${alive ? '이 객체가 가진 별도의 멤버 값' : '현재 살아 있는 객체가 없습니다.'}</p></article>`;
  }).join('');
}
function renderTrace(focusId) {
  const snapshot = traceAt(traceStep);
  const current = traceSteps[traceStep - 1];
  $('#trace-widget').innerHTML = `<div class="trace-controls"><button class="button" id="trace-reset">처음부터</button><span>${traceStep} / ${traceSteps.length}줄 확인</span><button class="button" id="trace-prev" ${traceStep === 0 ? 'disabled' : ''}>← 한 줄 이전</button><button class="button primary" id="trace-next" ${traceStep === traceSteps.length ? 'disabled' : ''}>한 줄 진행 →</button></div><div class="trace-layout"><div><div class="code-panel trace-code"><div class="code-toolbar"><span>main의 실행 흐름</span><span>강조된 줄 = 방금 실행한 줄</span></div><pre><code>${traceSteps.map((step, i) => `<span class="code-line ${i === traceStep - 1 ? 'executed-line' : ''} ${i >= traceStep ? 'waiting-line' : ''}" ${i === traceStep - 1 ? 'aria-current="step"' : ''}><span class="line-no" aria-hidden="true">${i+1}</span>${esc(step.code)}</span>`).join('')}</code></pre></div><div class="simulation-output"><span>출력</span><pre id="trace-output">${snapshot.output ? esc(snapshot.output) : '아직 출력 없음'}</pre></div></div><div class="object-grid">${objectsMarkup(snapshot.objects, snapshot.focus, snapshot.destroyed)}</div></div><div class="trace-explanation" role="status"><h3>${esc(current?.title || '아직 main을 실행하지 않았어요.')}</h3><p>${esc(current?.explanation || 'Circle은 정의되어 있지만, donut과 pizza 객체는 아직 없습니다. 한 줄 진행을 눌러 시작해 보세요.')}</p>${snapshot.destroyed.length ? `<p class="destruction-order">소멸 순서: ${snapshot.destroyed.join(' → ')}</p>` : ''}</div>`;
  if (focusId) {
    let button = document.getElementById(focusId);
    if (button?.disabled) button = $('#trace-prev').disabled ? $('#trace-next') : $('#trace-prev');
    button?.focus({ preventScroll: true });
  }
}
function renderSandboxObjects(focus = null) {
  $('#sandbox-objects').innerHTML = objectsMarkup(sandbox, focus);
  $('#sandbox-output').textContent = `${sandbox.donut} ${sandbox.pizza}`;
}
function updatePending() {
  $('#radius-label').value = inputRadius;
  $('#pending-call').textContent = `${target}.setRadius(${inputRadius});`;
}
function initializeSandbox() {
  $('#object-select').value = target;
  $('#radius-input').value = inputRadius;
  updatePending();
  renderSandboxObjects();
}
function renderCheck(q) {
  const chosen = answers.get(q.id);
  if (chosen == null) return;
  const box = $(`[data-check="${q.id}"]`);
  box.querySelector(`input[value="${chosen}"]`).checked = true;
  const result = box.querySelector('.check-result');
  const correct = chosen === q.correct;
  result.hidden = false;
  result.className = `check-result ${correct ? 'correct' : 'incorrect'}`;
  result.textContent = `${correct ? '맞아요. ' : '다시 생각해 보세요. '}${q.explanation}`;
}
function renderLesson(focus = false) {
  const requested = location.hash.slice(1);
  const found = lessons.findIndex(l => l.id === requested);
  lessonIndex = found >= 0 ? found : 0;
  const lesson = lessons[lessonIndex];
  $('#lesson-nav').innerHTML = lessons.map((l,i) => `<a href="#${l.id}" ${lesson.id === l.id ? 'aria-current="step"' : ''}><span>${String(i+1).padStart(2,'0')}</span>${esc(l.nav)}</a>`).join('');
  $('#lesson-content').innerHTML = `<header class="lesson-heading"><span class="eyebrow">UNDERSTAND CLASSES / ${String(lessonIndex+1).padStart(2,'0')}</span><h2 id="lesson-heading" tabindex="-1">${esc(lesson.title)}</h2><div class="lecture-source">${lesson.refs.map(ref => `<span>${esc(sourceLabel(ref))}</span>`).join('')}</div></header><article class="lesson-body">${lesson.body()}</article>`;
  $('#lesson-position').textContent = `${lessonIndex+1} / ${lessons.length}`;
  $('#lesson-prev').disabled = lessonIndex === 0;
  $('#lesson-next').hidden = lessonIndex === lessons.length - 1;
  if (lesson.id === 'trace') renderTrace();
  if (lesson.id === 'sandbox') initializeSandbox();
  if (lesson.id === 'check') checks.forEach(renderCheck);
  document.title = `${lesson.nav} · 클래스 이해하기`;
  if (focus) {
    $('#lesson-heading').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
$('#lesson-prev').addEventListener('click', () => { if (lessonIndex > 0) location.hash = lessons[lessonIndex-1].id; });
$('#lesson-next').addEventListener('click', () => { if (lessonIndex < lessons.length-1) location.hash = lessons[lessonIndex+1].id; });
$('#lesson-content').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.id === 'trace-next') { traceStep = Math.min(traceSteps.length, traceStep + 1); renderTrace(button.id); }
  else if (button.id === 'trace-prev') { traceStep = Math.max(0, traceStep - 1); renderTrace(button.id); }
  else if (button.id === 'trace-reset') { traceStep = 0; renderTrace(button.id); }
  else if (button.id === 'apply-radius') {
    const before = sandbox[target];
    const result = setRadius(sandbox, target, inputRadius);
    sandbox = result.objects;
    renderSandboxObjects(target);
    $('#sandbox-message').textContent = result.accepted ? `${target}.setRadius(${inputRadius}) 호출: ${target}의 radius에 ${inputRadius}을(를) 저장했습니다. 이전 값은 ${before}입니다. 다른 객체의 값은 그대로입니다.` : `r = ${inputRadius}이므로 r > 0이 거짓입니다. 대입문을 실행하지 않아 ${target}의 radius는 ${before} 그대로입니다.`;
  }
  else if (button.id === 'sandbox-reset') {
    sandbox = initialObjects();
    renderSandboxObjects();
    $('#sandbox-message').textContent = 'donut의 radius는 2, pizza의 radius는 5로 되돌렸습니다.';
  }
});
$('#lesson-content').addEventListener('input', event => {
  if (event.target.id === 'radius-input') { inputRadius = Number(event.target.value); updatePending(); }
});
$('#lesson-content').addEventListener('change', event => {
  if (event.target.id === 'object-select') { target = event.target.value; updatePending(); }
  const box = event.target.closest('[data-check]');
  if (box && event.target.type === 'radio') {
    const q = checks.find(q => q.id === box.dataset.check);
    answers.set(q.id, Number(event.target.value));
    renderCheck(q);
  }
});
window.addEventListener('hashchange', () => renderLesson(true));
renderLesson();
