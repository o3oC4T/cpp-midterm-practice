// Fixed teaching examples only: these transitions visualize C++, not execute it.
export function circleCode(log = false) {
  const created = log ? '\n        cout << "C " << radius << endl;' : '';
  return `class Circle {
    int radius;
public:
    Circle() {
        radius = 1;${created}
    }
    Circle(int r) {
        radius = r;${created}
    }
    ~Circle() {${log ? '\n        cout << "D " << radius << endl;\n    ' : ' '}}
    void setRadius(int r) {
        if (r > 0) radius = r;
    }
    int getRadius() { return radius; }
};`;
}
const step = (code, title, explanation, event) => ({code, title, explanation, event});
export const scenarios = {
  single: [
    step('int main() {', 'main에 들어왔어요.', '아직 포인터 변수도 동적 객체도 만들지 않았습니다.'),
    step('    Circle* p = nullptr;', '포인터 변수 p만 만들었어요.', 'p는 지금 아무 객체도 가리키지 않습니다. Circle 생성자는 호출되지 않았습니다.', {type:'declare',name:'p'}),
    step('    p = new Circle(3);', '동적 객체를 만들고 그 주소를 p에 저장해요.', '메모리를 확보한 뒤 Circle(3)이 실행됩니다. radius가 3인 객체 하나가 생기고 C 3을 출력합니다.', {type:'allocate',name:'p',kind:'single',values:[3]}),
    step('    p->setRadius(7);', '포인터가 가리키는 객체를 바꿔요.', 'p에 저장된 주소는 그대로입니다. 그 주소의 객체 안에 있는 radius가 3에서 7로 바뀝니다.', {type:'set',name:'p',index:0,value:7}),
    step('    cout << p->getRadius() << endl;', '객체의 반지름을 읽어요.', 'p가 가리키는 객체의 getRadius()가 7을 반환하고 cout이 출력합니다.', {type:'print',name:'p',index:0}),
    step('    delete p;', '객체가 소멸하고 동적 메모리가 해제돼요.', '소멸자가 D 7을 출력합니다. p 자체가 사라지거나 자동으로 nullptr가 되지는 않습니다. 이제 이 포인터로 객체에 접근하면 안 됩니다.', {type:'delete',name:'p'}),
    step('    p = nullptr;', 'p가 아무것도 가리키지 않도록 직접 바꿔요.', '객체는 앞 줄에서 이미 해제했습니다. 이 줄은 포인터 변수의 값만 바꾸므로 소멸자를 다시 호출하지 않습니다.', {type:'null',name:'p'}),
    step('}', '포인터 변수 p의 지역 수명도 끝나요.', '동적 객체는 delete에서 이미 소멸했고, 지역 포인터 변수 p는 main이 끝나며 사라집니다. 둘의 수명은 별개입니다.', {type:'end'})
  ],
  array: [
    step('int main() {', '배열 예제를 시작해요.', '각 원소가 하나의 Circle 객체입니다.'),
    step('    Circle* base = new Circle[3];', '객체 3개를 차례로 만들어요.', '인자 없이 만들 수 있는 Circle()이 원소마다 호출됩니다. 모두 radius = 1로 시작하고 C 1이 세 번 출력됩니다. base에는 첫 원소의 주소가 저장됩니다.', {type:'allocate',name:'base',kind:'array',values:[1,1,1]}),
    step('    base[0].setRadius(2);', '0번 원소의 반지름을 2로 바꿔요.', 'base[0]은 객체이므로 점(.)으로 멤버 함수를 호출합니다.', {type:'set',name:'base',index:0,value:2}),
    step('    base[1].setRadius(4);', '1번 원소의 반지름을 4로 바꿔요.', '다른 원소의 멤버 값은 그대로입니다.', {type:'set',name:'base',index:1,value:4}),
    step('    base[2].setRadius(6);', '2번 원소의 반지름을 6으로 바꿔요.', '이제 세 원소의 radius는 순서대로 2, 4, 6입니다.', {type:'set',name:'base',index:2,value:6}),
    step('    Circle* p = base;', '같은 시작 주소를 p에도 복사해요.', '포인터 변수 p를 하나 더 만듭니다. Circle 객체나 배열을 새로 만들지는 않으므로 생성자 출력도 없습니다.', {type:'copy',name:'p',from:'base'}),
    step('    p++;', 'p만 다음 원소로 이동해요.', 'p는 1번 원소를 가리키고 base는 계속 0번 원소의 주소를 보관합니다. 객체 값 자체는 바뀌지 않습니다.', {type:'advance',name:'p'}),
    step('    cout << p->getRadius() << endl;', 'p가 가리키는 1번 원소를 읽어요.', '1번 원소의 radius인 4가 출력됩니다.', {type:'print',name:'p',index:0}),
    step('    delete[] base;', '배열 전체를 역순으로 소멸시켜요.', '2번, 1번, 0번 원소 순으로 소멸하여 D 6, D 4, D 2를 출력합니다. 해제에는 new[]가 반환한 시작 주소 base를 씁니다. 이동한 p를 넘기면 안 됩니다.', {type:'delete',name:'base'}),
    step('    base = nullptr;', 'base의 값만 nullptr로 바꿔요.', 'p는 다른 포인터 변수라 자동으로 바뀌지 않습니다. p 역시 해제된 배열을 가리키던 값이 남아 있습니다.', {type:'null',name:'base'}),
    step('    p = nullptr;', 'p도 직접 nullptr로 바꿔요.', '두 포인터 모두 더 이상 객체를 가리키지 않습니다. 이 대입은 메모리를 해제하는 동작이 아닙니다.', {type:'null',name:'p'}),
    step('}', '지역 포인터 변수들의 수명이 끝나요.', '동적 배열은 이미 delete[]로 정리했습니다.', {type:'end'})
  ]
};
export function programFor(name) {
  return '#include <iostream>\nusing namespace std;\n\n' + circleCode(true) + '\n\n' + scenarios[name].map(s=>s.code).join('\n');
}
export function snapshotAt(name, count) {
  const steps=scenarios[name];
  if (!steps) throw new Error('Unknown teaching example');
  const state={pointers:{},blocks:[],output:'',destroyed:[],ended:false,focus:null};
  const limit=Number.isInteger(count) ? Math.min(steps.length,Math.max(0,count)) : 0;
  for (const current of steps.slice(0,limit)) {
    const e=current.event;
    state.focus=null;
    if (!e) continue;
    if (e.type==='declare' || e.type==='null') state.pointers[e.name]=null;
    if (e.type==='allocate') {
      const id=`H${state.blocks.length+1}`;
      state.blocks.push({id,kind:e.kind,values:[...e.values],alive:true});
      state.pointers[e.name]={block:id,index:0};
      state.output+=e.values.map(v=>`C ${v}\n`).join('');
    }
    if (e.type==='copy') state.pointers[e.name]={...state.pointers[e.from]};
    if (e.type==='advance') state.pointers[e.name].index++;
    if (['set','print','delete'].includes(e.type)) {
      const pointer=state.pointers[e.name];
      const block=state.blocks.find(b=>b.id===pointer.block);
      const index=pointer.index+(e.index||0);
      state.focus={block:block.id,index};
      if (e.type==='set') block.values[index]=e.value;
      if (e.type==='print') state.output+=`${block.values[index]}\n`;
      if (e.type==='delete') {
        block.alive=false;
        state.destroyed=block.values.map((value,index)=>({index,value})).reverse();
        state.output+=state.destroyed.map(item=>`D ${item.value}\n`).join('');
        state.focus=null;
      }
    }
    if (e.type==='end') { state.ended=true;state.pointers={}; }
  }
  return state;
}
export function pointerStatus(state, name) {
  if (!Object.hasOwn(state.pointers,name)) return 'absent';
  const ptr=state.pointers[name];
  if (ptr===null) return 'null';
  return state.blocks.find(b=>b.id===ptr.block)?.alive ? 'live' : 'dangling';
}
export function initialPointerLab() { return {target:'donut',objects:{donut:2,pizza:5}}; }
export function pointTo(state,target) {
  if (![null,'donut','pizza'].includes(target)) return state;
  return {target,objects:{...state.objects}};
}
export function callThroughPointer(state,radius) {
  const next={target:state.target,objects:{...state.objects}};
  if (state.target===null) return {state:next,kind:'null'};
  if (!Number.isInteger(radius) || radius<=0) return {state:next,kind:'rejected'};
  next.objects[state.target]=radius;
  return {state:next,kind:'updated'};
}
export const ownerProgram=`#include <iostream>
using namespace std;
${circleCode(true)}
class CircleManager {
    Circle* circles;
    int size;
public:
    CircleManager(int n) {
        size = n;
        circles = new Circle[size];
    }
    void setAll(int r) {
        for (int i = 0; i < size; i++)
            circles[i].setRadius(r);
    }
    ~CircleManager() {
        delete[] circles;
    }
};
int main() {
    CircleManager manager(3);
    manager.setAll(4);
}`;
