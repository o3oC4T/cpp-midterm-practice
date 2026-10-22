import { escapeHTML as esc } from './engine.js';
import { sourceLabel } from './sources.js';
import { lessons, checks } from './object-content.js';
import { scenarios, snapshotAt, pointerStatus, initialPointerLab, pointTo, callThroughPointer } from './object-model.js';
const $=selector=>document.querySelector(selector);
let lessonIndex=0;
const tracePositions={single:0,array:0};
let lab=initialPointerLab();
let radius=7;
const answers=new Map();
function memoryMarkup(state) {
  const pointers=Object.entries(state.pointers).map(([name,ptr])=>{
    const status=pointerStatus(state,name);
    const label=status==='null' ? 'nullptr · 대상 없음' : status==='dangling' ? `${ptr.block}의 해제된 대상을 가리키던 값` : `${ptr.block}${state.blocks.find(b=>b.id===ptr.block)?.kind==='array' ? `[${ptr.index}]` : ''}의 주소`;
    return `<div class="pointer-box ${status==='dangling' ? 'dangling-pointer' : ''}" data-pointer="${name}" data-status="${status}"><strong>${name}</strong><span>${esc(label)}</span></div>`;
  }).join('');
  const blocks=state.blocks.map(block=>`<div class="heap-block ${block.alive ? '' : 'released'}" data-block="${block.id}" data-alive="${block.alive}"><div class="row"><strong>${block.id}</strong><span>${block.kind==='array' ? 'Circle 객체 배열' : 'Circle 객체'}</span></div>${block.alive ? `<div class="heap-elements ${block.kind==='array' ? 'multiple' : ''}">${block.values.map((value,index)=>{
    const pointing=Object.entries(state.pointers).filter(([,ptr])=>ptr?.block===block.id && ptr.index===index).map(([name])=>name);
    const active=state.focus?.block===block.id && state.focus?.index===index;
    return `<div class="heap-element ${active ? 'active-element' : ''}" data-index="${index}"><span>${block.kind==='array' ? `${index}번 객체` : '살아 있는 객체'}</span><code>radius</code><b data-heap-radius>${value}</b><small>${pointing.length ? `${pointing.join(', ')}의 대상` : ' '}</small></div>`;
  }).join('')}</div>` : '<p class="release-note">객체 소멸 · 메모리 해제 완료<br>이 대상에 다시 접근하면 안 됩니다.</p>'}</div>`).join('');
  return `<div class="memory-zone"><h3>지역 포인터 변수</h3><div class="pointer-list">${pointers || `<p class="memory-empty">${state.ended ? '지역 포인터 변수의 수명도 끝났습니다.' : '아직 포인터를 선언하지 않았습니다.'}</p>`}</div><div class="memory-connector" aria-hidden="true">${Object.keys(state.pointers).some(n=>pointerStatus(state,n)==='live') ? '↓' : '· · ·'}</div><h3>동적 메모리 영역</h3>${blocks || '<p class="memory-empty">아직 생성한 동적 객체가 없습니다.</p>'}</div>`;
}
function renderTrace(focusId) {
  const host=$('#dynamic-trace');
  const name=host.dataset.scenario;
  const position=tracePositions[name];
  const steps=scenarios[name];
  const state=snapshotAt(name,position);
  const last=steps[position-1];
  host.innerHTML=`<div class="trace-controls"><button class="button" id="dynamic-reset">처음부터</button><span>${position} / ${steps.length}줄 확인</span><button class="button" id="dynamic-prev" ${position===0 ? 'disabled' : ''}>← 한 줄 이전</button><button class="button primary" id="dynamic-next" ${position===steps.length ? 'disabled' : ''}>한 줄 진행 →</button></div><div class="dynamic-layout"><div><div class="code-panel trace-code"><div class="code-toolbar"><span>C++ main</span><span>강조된 줄 = 방금 실행한 줄</span></div><pre><code>${steps.map((s,i)=>`<span class="code-line ${i===position-1 ? 'executed-line' : ''} ${i>=position ? 'waiting-line' : ''}" ${i===position-1 ? 'aria-current="step"' : ''}><span class="line-no" aria-hidden="true">${i+1}</span>${esc(s.code)}</span>`).join('')}</code></pre></div><div class="simulation-output"><span>생성자·소멸자와 cout의 출력</span><pre id="dynamic-output">${state.output ? esc(state.output) : '아직 출력 없음'}</pre></div></div>${memoryMarkup(state)}</div><div class="trace-explanation" role="status"><h3>${esc(last?.title || '실행 전 상태입니다.')}</h3><p>${esc(last?.explanation || '한 줄 진행을 눌러 포인터와 객체가 언제 만들어지는지 확인해 보세요.')}</p>${state.destroyed.length>1 ? `<p class="destruction-order">소멸 순서: ${state.destroyed.map(d=>`${d.index}번(radius ${d.value})`).join(' → ')}</p>` : ''}</div>`;
  if (focusId) {
    let button=document.getElementById(focusId);
    if (button?.disabled) button=$('#dynamic-prev').disabled ? $('#dynamic-next') : $('#dynamic-prev');
    button?.focus({preventScroll:true});
  }
}
function renderPointerLab() {
  $('#pointer-lab-view').innerHTML=`<div class="pointer-follow"><div class="pointer-box"><span>포인터 변수</span><strong>p</strong><code id="lab-address">${lab.target ? `${lab.target}의 주소` : 'nullptr'}</code></div><span class="address-arrow" aria-hidden="true">${lab.target ? '→' : '×'}</span><div class="follow-objects">${Object.entries(lab.objects).map(([name,value])=>`<div class="pointed-object ${lab.target===name ? 'pointed-active' : ''}" data-lab-object="${name}"><span>${lab.target===name ? '현재 p가 가리키는 객체' : 'Circle 객체'}</span><strong>${name}</strong><div class="mini-circle" style="--diameter:${value*11}px" aria-hidden="true"></div><code>radius = <b data-lab-radius="${name}">${value}</b></code></div>`).join('')}</div></div>`;
  $('#pointer-call').disabled=lab.target===null;
}
function updatePending() {
  $('#pointer-radius-label').value=radius;
  $('#pointer-pending').textContent=`p->setRadius(${radius});`;
}
function initializeLab() {
  $('#pointer-target').value=lab.target || 'null';
  $('#pointer-radius').value=radius;
  renderPointerLab(); updatePending();
  $('#pointer-message').textContent=lab.target ? `p는 ${lab.target}을(를) 가리킵니다. 대상 선택은 p에 저장된 주소만 바꿉니다.` : 'p가 nullptr라 가리키는 객체가 없습니다. 먼저 대상을 선택해야 멤버 함수를 호출할 수 있습니다.';
}
function renderCheck(q) {
  const chosen=answers.get(q.id);
  if (chosen==null) return;
  const box=$(`[data-check="${q.id}"]`);
  box.querySelector(`input[value="${chosen}"]`).checked=true;
  const result=box.querySelector('.check-result');
  const correct=chosen===q.correct;
  result.hidden=false;
  result.className=`check-result ${correct ? 'correct' : 'incorrect'}`;
  result.textContent=`${correct ? '맞아요. ' : '다시 생각해 보세요. '}${q.explanation}`;
}
function renderLesson(focus=false) {
  const found=lessons.findIndex(l=>l.id===location.hash.slice(1));
  lessonIndex=found>=0 ? found : 0;
  const lesson=lessons[lessonIndex];
  $('#lesson-nav').innerHTML=lessons.map((l,i)=>`<a href="#${l.id}" ${lesson.id===l.id ? 'aria-current="step"' : ''}><span>${String(i+1).padStart(2,'0')}</span>${esc(l.nav)}</a>`).join('');
  $('#lesson-content').innerHTML=`<header class="lesson-heading"><span class="eyebrow">OBJECT POINTERS / ${String(lessonIndex+1).padStart(2,'0')}</span><h2 id="lesson-heading" tabindex="-1">${esc(lesson.title)}</h2><div class="lecture-source">${lesson.refs.map(ref=>`<span>${esc(sourceLabel(ref))}</span>`).join('')}</div></header><article class="lesson-body">${lesson.body()}</article>`;
  $('#lesson-position').textContent=`${lessonIndex+1} / ${lessons.length}`;
  $('#lesson-prev').disabled=lessonIndex===0;
  $('#lesson-next').hidden=lessonIndex===lessons.length-1;
  if ($('#dynamic-trace')) renderTrace();
  if (lesson.id==='follow') initializeLab();
  if (lesson.id==='check') checks.forEach(renderCheck);
  document.title=`${lesson.nav} · 객체 포인터·동적 생성`;
  if (focus) { $('#lesson-heading').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
}
$('#lesson-prev').addEventListener('click',()=>{if(lessonIndex>0)location.hash=lessons[lessonIndex-1].id;});
$('#lesson-next').addEventListener('click',()=>{if(lessonIndex<lessons.length-1)location.hash=lessons[lessonIndex+1].id;});
$('#lesson-content').addEventListener('click',event=>{
  const button=event.target.closest('button');
  if (!button) return;
  if (['dynamic-next','dynamic-prev','dynamic-reset'].includes(button.id)) {
    const name=$('#dynamic-trace').dataset.scenario;
    tracePositions[name]=button.id==='dynamic-reset' ? 0 : Math.max(0,Math.min(scenarios[name].length,tracePositions[name]+(button.id==='dynamic-next' ? 1 : -1)));
    renderTrace(button.id);
  } else if (button.id==='pointer-call') {
    const previous=lab.target && lab.objects[lab.target];
    const result=callThroughPointer(lab,radius);
    lab=result.state;
    renderPointerLab();
    $('#pointer-message').textContent=result.kind==='updated' ? `p가 가리키는 ${lab.target}의 radius에 ${radius}을(를) 저장했습니다. 이전 값은 ${previous}입니다. p에 저장된 주소 값과 다른 객체는 그대로입니다.` : result.kind==='null' ? 'nullptr는 객체를 가리키지 않아 호출할 수 없습니다.' : `r = ${radius}이므로 r > 0이 거짓입니다. 대입하지 않아 객체 값은 그대로입니다.`;
  } else if (button.id==='pointer-reset') {
    lab=initialPointerLab();radius=7;initializeLab();
  }
});
$('#lesson-content').addEventListener('input',event=>{
  if(event.target.id==='pointer-radius'){radius=Number(event.target.value);updatePending();}
});
$('#lesson-content').addEventListener('change',event=>{
  if(event.target.id==='pointer-target'){
    const target=event.target.value==='null' ? null : event.target.value;
    lab=pointTo(lab,target);renderPointerLab();
    $('#pointer-message').textContent=target ? `p = &${target}; 실행: p에 저장된 주소만 바꿨습니다. donut과 pizza의 radius는 바뀌지 않았습니다.` : 'p = nullptr; 실행: 두 지역 객체는 그대로 살아 있습니다. 대상이 없으므로 멤버 함수 호출은 할 수 없습니다.';
  }
  const box=event.target.closest('[data-check]');
  if(box && event.target.type==='radio'){
    const q=checks.find(q=>q.id===box.dataset.check);
    answers.set(q.id,Number(event.target.value));renderCheck(q);
  }
});
window.addEventListener('hashchange',()=>renderLesson(true));
renderLesson();
