// These transitions visualize this fixed example; they do not execute arbitrary C++.
export const circleDefinition = `class Circle {
private:
    int radius;
public:
    Circle(int r) {
        radius = r;
    }
    void setRadius(int r) {
        if (r > 0) radius = r;
    }
    int getRadius() {
        return radius;
    }
};`;
export const traceSteps = [
  { code: 'int main() {', title: 'main에 들어왔어요.', explanation: 'Circle의 정의는 준비되어 있습니다. 아직 donut과 pizza 객체는 만들지 않았습니다.' },
  { code: '    Circle donut(2);', title: 'donut 객체를 만들어요.', explanation: 'Circle(int r)의 r에 2가 전달됩니다. 생성자 본문의 radius = r;가 donut의 멤버 radius에 2를 저장합니다.', event: { type: 'create', target: 'donut', value: 2 } },
  { code: '    Circle pizza(5);', title: 'pizza 객체를 하나 더 만들어요.', explanation: '이번에는 r이 5입니다. pizza의 radius에 5를 저장합니다. 이미 만들어진 donut의 radius는 2 그대로입니다.', event: { type: 'create', target: 'pizza', value: 5 } },
  { code: '    donut.setRadius(4);', title: 'donut에게 반지름 변경을 요청해요.', explanation: '점 앞의 donut이 이번 호출의 대상입니다. r에 4를 넘기고, 4 > 0이므로 donut의 radius만 4로 바꿉니다.', event: { type: 'set', target: 'donut', value: 4 } },
  { code: '    cout << donut.getRadius() << " ";', title: 'donut의 값을 읽어서 출력해요.', explanation: 'getRadius()가 donut의 radius인 4를 반환합니다. cout이 4와 공백을 출력합니다. 값을 읽기만 하므로 radius는 바뀌지 않습니다.', event: { type: 'print', target: 'donut', suffix: ' ' } },
  { code: '    cout << pizza.getRadius() << endl;', title: 'pizza의 값을 읽어서 출력해요.', explanation: 'pizza의 radius는 계속 5였습니다. 5와 줄바꿈이 출력되어 최종 결과는 4 5입니다.', event: { type: 'print', target: 'pizza', suffix: '\n' } },
  { code: '}', title: 'main의 지역 객체들이 소멸해요.', explanation: '나중에 만들어진 pizza, 먼저 만들어진 donut 순으로 소멸합니다. 이 클래스에는 소멸자의 출력문을 작성하지 않았으므로 화면에 추가 문장은 나오지 않습니다.', event: { type: 'end' } }
];
export const traceProgram = '#include <iostream>\nusing namespace std;\n\n' + circleDefinition + '\n\n' + traceSteps.map(s => s.code).join('\n');
export function initialObjects() { return { donut: 2, pizza: 5 }; }
export function setRadius(objects, target, radius) {
  if (!['donut', 'pizza'].includes(target) || objects[target] == null || !Number.isInteger(radius)) return { objects: { ...objects }, accepted: false };
  const accepted = radius > 0;
  return { objects: { ...objects, ...(accepted ? { [target]: radius } : {}) }, accepted };
}
export function traceAt(step) {
  const snapshot = { objects: {}, output: '', destroyed: [], focus: null };
  const end = Number.isInteger(step) ? Math.max(0, Math.min(step, traceSteps.length)) : 0;
  for (let i = 0; i < end; i++) {
    const event = traceSteps[i].event;
    snapshot.focus = event?.target || null;
    if (!event) continue;
    if (event.type === 'create') snapshot.objects[event.target] = event.value;
    if (event.type === 'set') snapshot.objects = setRadius(snapshot.objects, event.target, event.value).objects;
    if (event.type === 'print') snapshot.output += snapshot.objects[event.target] + event.suffix;
    if (event.type === 'end') {
      snapshot.destroyed = Object.keys(snapshot.objects).reverse();
      snapshot.objects = {};
    }
  }
  return snapshot;
}
