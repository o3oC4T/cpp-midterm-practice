import { escapeHTML as esc } from './engine.js';
import { source as s } from './sources.js';
import { circleDefinition, traceProgram } from './class-model.js';
export function code(text, title = 'C++') {
  return `<div class="code-panel"><div class="code-toolbar"><span>${esc(title)}</span></div><pre><code>${text.split('\n').map((line, i) => `<span class="code-line"><span class="line-no" aria-hidden="true">${i + 1}</span>${esc(line)}</span>`).join('')}</code></pre></div>`;
}
const takeaway = text => `<div class="class-takeaway"><strong>여기서 이해할 것</strong><p>${text}</p></div>`;
export const lifecycleProgram = `#include <iostream>
using namespace std;
class Circle {
    int radius;
public:
    Circle(int r) {
        radius = r;
        cout << "C " << radius << endl;
    }
    ~Circle() {
        cout << "D " << radius << endl;
    }
};
int main() {
    Circle a(2);
    {
        Circle b(5);
        cout << "inside" << endl;
    }
    cout << "outside" << endl;
}`;
export const outsideDefinition = `class Circle {
    int radius;
public:
    Circle(int r);
    int getRadius();
};
Circle::Circle(int r) {
    radius = r;
}
int Circle::getRadius() {
    return radius;
}`;
export const checks = [
  { id: 'definition', prompt: 'class Circle { ... };만 작성했어요. 어떤 일이 일어났을까요?', options: ['donut과 pizza 객체가 자동으로 생긴다.', 'Circle이라는 자료형을 정의했다. 객체는 따로 만들어야 한다.'], correct: 1, explanation: '클래스 정의는 멤버와 동작의 규칙을 적는 것입니다. Circle donut(2);처럼 객체를 만드는 문장이 따로 있어야 합니다.' },
  { id: 'independent', prompt: 'Circle a(2), b(5); 뒤 a.setRadius(4);를 호출했어요. a와 b의 radius는?', options: ['4, 4', '2, 5', '4, 5'], correct: 2, explanation: '점 앞의 a가 이번 호출의 대상입니다. a의 radius만 4가 되고 b는 5 그대로입니다.' },
  { id: 'constructor', prompt: 'Circle(int r) { radius = r; }에서 r과 radius는 같은 변수일까요?', options: ['아니다. r은 호출 때 받은 매개변수이고 radius는 객체 안의 멤버 변수이다.', '같다. 이름만 두 개이다.'], correct: 0, explanation: 'Circle a(2);라면 r에 받은 2를 a의 radius에 저장합니다. 생성자 실행이 끝나도 객체의 radius에는 그 값이 남습니다.' },
  { id: 'return', prompt: 'donut의 radius가 4일 때 int n = donut.getRadius();를 실행하면?', options: ['donut이 사라지고 n이 새 객체가 된다.', 'n에 4가 저장되고 donut의 radius도 4 그대로이다.', 'return 때문에 donut의 radius가 0으로 바뀐다.'], correct: 1, explanation: 'getRadius()는 radius 값을 반환합니다. 이 코드에는 radius에 새 값을 대입하는 문장이 없으므로 객체 상태가 그대로입니다.' },
  { id: 'private', prompt: 'radius가 private이면 main에서 값을 바꾸는 올바른 코드는?', options: ['donut.radius = 7;', 'Circle.radius = 7;', 'donut.setRadius(7);'], correct: 2, explanation: 'main에서는 private 멤버에 직접 접근할 수 없습니다. public 멤버 함수를 호출하면 그 함수가 자신의 객체에 있는 radius에 접근해 값을 바꿉니다.' }
];
export const lessons = [
  { id: 'start', nav: '변수에서 클래스로', title: '클래스는 값과 그 값을 다루는 함수를 묶은 자료형이에요.', refs: [s(3,3,12)], body: () => `
    <p class="lesson-lead">지금까지 <code>int</code>로 정수 하나를 다뤘다면, 이제는 <strong>원 하나를 나타내는 Circle이라는 자료형</strong>을 직접 만든다고 생각해 보세요.</p>
    <div class="concept-equation"><div><span>원에 필요한 값</span><strong>반지름 radius</strong></div><b aria-hidden="true">+</b><div><span>그 값으로 할 일</span><strong>반지름 읽기·바꾸기</strong></div><b aria-hidden="true">=</b><div class="concept-result"><span>값과 기능을 함께 정의</span><strong>Circle 클래스</strong></div></div>
    <h3>이미 아는 변수와 함수에서 출발해 볼게요.</h3>
    ${code('int radius = 2;\n\ndouble area(int r) {\n    return 3.14 * r * r;\n}', '따로 있던 데이터와 함수')}
    <p>원의 반지름과 계산 함수가 따로 있습니다. 원이 여러 개라면 <em>어느 반지름에 어떤 함수를 적용할지</em> 호출할 때 연결해 줘야 하죠. 클래스로 묶으면 <code>donut.getRadius()</code>처럼 <strong>어느 객체에게 어떤 일을 시킬지</strong> 코드에 드러납니다.</p>
    <div class="term-grid"><div><h3>멤버 변수</h3><p>클래스 안에 선언한 변수입니다. <code>radius</code>처럼 객체의 상태를 저장합니다.</p></div><div><h3>멤버 함수</h3><p>클래스 안에 선언한 함수입니다. <code>getRadius()</code>처럼 그 객체의 데이터를 다룹니다.</p></div></div>
    <p>이 설명에서는 계산식보다 객체의 상태에 집중하기 위해, 반지름을 저장하고 읽고 바꾸는 작은 <code>Circle</code>을 만들겠습니다.</p>
    ${takeaway('클래스는 내가 만드는 자료형입니다. 그 안에 <strong>무슨 값을 보관하고 어떤 함수를 제공할지</strong> 함께 정의합니다.')}` },
  { id: 'objects', nav: '클래스와 객체의 차이', title: 'Circle은 타입이고, donut과 pizza는 실제 객체예요.', refs: [s(3,7,14)], body: () => `
    <p class="lesson-lead"><code>int n;</code>에서 <code>int</code>는 타입이고 <code>n</code>은 변수입니다. <code>Circle donut;</code>도 같은 구조로 읽으면 됩니다.</p>
    <table class="lesson-table"><thead><tr><th>코드</th><th>자료형</th><th>만들어지는 대상</th></tr></thead><tbody><tr><td><code>int n;</code></td><td>int</td><td>정수 변수 n</td></tr><tr><td><code>Circle donut;</code></td><td>Circle</td><td>Circle 객체 donut</td></tr></tbody></table>
    ${code('class Circle {\npublic:\n    int radius;\n};\n\nint main() {\n    Circle donut;\n    Circle pizza;\n    donut.radius = 2;\n    pizza.radius = 5;\n}', '처음에는 멤버를 public으로 열어 둔 예제')}
    <div class="definition-map"><div class="definition-box"><span>타입 정의</span><strong>Circle</strong><code>int radius;</code><small>각 객체가 가질 멤버를 정함</small></div><span class="map-arrow" aria-hidden="true">→</span><div class="example-object"><strong>donut</strong><span>Circle 객체</span><code>radius = 2</code></div><div class="example-object second"><strong>pizza</strong><span>Circle 객체</span><code>radius = 5</code></div></div>
    <p><code>class Circle { ... };</code>는 타입을 정의합니다. 그 문장만으로 donut이나 pizza가 생기는 것은 아닙니다. <code>Circle donut;</code>과 <code>Circle pizza;</code>에서 실제 객체를 만듭니다.</p>
    <p>두 객체는 모양이 같은 별도 저장 공간을 가집니다. 이 예제의 <code>radius</code>는 객체마다 하나씩 있으므로, <code>donut.radius = 4;</code>를 해도 pizza의 값은 5입니다. <strong>같은 클래스로 만들었다고 멤버 값까지 공유하지 않습니다.</strong></p>
    <p class="class-note">위 코드의 main 안에서 생성 직후 radius가 자동으로 0이 된다고 가정하면 안 됩니다. 그래서 두 객체의 radius에 값을 먼저 대입했습니다. 4단계에서는 생성자로 처음부터 값을 넣겠습니다.</p>
    ${takeaway('<code>Circle</code>은 자료형의 이름, <code>donut</code>은 객체의 이름, <code>donut.radius</code>는 그 객체 안의 멤버입니다.')}` },
  { id: 'members', nav: '멤버 함수와 접근 제어', title: '객체에게 함수를 호출하면, 그 객체의 데이터로 일해요.', refs: [s(3,10,14),s(3,37,40)], body: () => `
    <p class="lesson-lead">이번에는 radius를 <code>private</code>에 두고, 바깥에서는 <code>public</code> 함수를 통해 사용하게 바꿔 보겠습니다.</p>
    ${code('class Circle {\nprivate:\n    int radius;\npublic:\n    void setRadius(int r) { radius = r; }\n    int getRadius() { return radius; }\n};\n\nint main() {\n    Circle donut;\n    donut.setRadius(2);\n    int n = donut.getRadius();\n    cout << n; // 2\n}')}
    <div class="call-breakdown"><code>donut</code><span>.</span><code>setRadius</code><span>(</span><code>2</code><span>);</span></div>
    <div class="term-grid three"><div><h3>donut</h3><p>일을 시킬 대상 객체입니다. 이번 함수 호출은 donut의 데이터를 다룹니다.</p></div><div><h3>setRadius</h3><p>호출할 멤버 함수입니다. 클래스에 적어 둔 함수 본문을 실행합니다.</p></div><div><h3>2 → r</h3><p>2를 인자로 전달하면 매개변수 r에 2가 들어갑니다. 이어서 <code>radius = r;</code>가 실행됩니다.</p></div></div>
    <h3>set은 바꾸고, get은 읽어요.</h3>
    <p>이 예제의 <code>void setRadius(int r)</code>는 값을 바꾸며, 돌려주는 값이 없어서 반환형이 <code>void</code>입니다. <code>int getRadius()</code>는 저장된 정수를 <code>return</code>으로 돌려줍니다. <code>int n = donut.getRadius();</code>를 실행하면 n에 2가 저장됩니다. getRadius() 자체는 화면에 출력하지 않습니다. 반환받은 값을 cout에 전달해야 화면에 보입니다. get/set이라는 이름 자체에 특별한 기능은 없고, <strong>우리가 작성한 본문이 동작을 결정</strong>합니다.</p>
    <table class="lesson-table"><thead><tr><th>main에서 작성</th><th>가능 여부</th><th>이유</th></tr></thead><tbody><tr><td><code>donut.radius = 7;</code></td><td>컴파일 오류</td><td>radius가 private</td></tr><tr><td><code>donut.setRadius(7);</code></td><td>가능</td><td>setRadius는 public</td></tr><tr><td><code>donut.getRadius();</code></td><td>가능</td><td>public 함수가 private 멤버를 읽어 반환</td></tr></tbody></table>
    <p>class에서 접근 지정자를 생략하면 기본은 private입니다. private은 바깥에서 직접 접근하는 경로를 제한합니다. 멤버 함수 안에서는 자기 객체의 private 데이터에 접근할 수 있습니다. 예를 들어 변경 함수에 <code>if (r &gt; 0)</code>를 넣어 검사한 값만 저장하도록 만들 수 있습니다. private이라고 값 검사가 자동으로 생기는 것은 아닙니다.</p>
    ${takeaway('점 앞에서 <strong>어느 객체인지</strong> 찾고, 함수 본문에서 <strong>그 객체의 무엇을 읽거나 바꾸는지</strong> 확인하세요.')}` },
  { id: 'constructor', nav: '생성자로 초기값 넣기', title: '생성자는 객체가 만들어질 때 처음 상태를 정해요.', refs: [s(3,14,28)], body: () => `
    <p class="lesson-lead"><code>Circle donut(2);</code>는 “Circle 객체 donut을 만들면서 2를 전달하겠다”는 뜻입니다. 이때 맞는 생성자가 자동으로 호출됩니다.</p>
    ${code(circleDefinition, '앞으로 실습에 사용할 Circle 클래스')}
    <div class="constructor-flow"><div><span>① 객체 생성 요청</span><code>Circle donut(2);</code></div><div><span>② 매개변수로 받기</span><code>Circle(int r) // r = 2</code></div><div><span>③ 멤버에 저장</span><code>radius = r; // donut의 radius = 2</code></div></div>
    <p><code>r</code>은 이번 호출에서 값을 받는 매개변수이고, <code>radius</code>는 객체 안에 계속 보관할 멤버 변수입니다. 생성자 실행이 끝나도 donut 객체의 radius에는 2가 남습니다.</p>
    <p>다음 줄에서 <code>Circle pizza(5);</code>를 쓰면 같은 생성자 코드가 pizza를 위해 실행됩니다. 이번 r은 5이고 pizza의 radius가 5가 됩니다.</p>
    <ul class="lesson-list"><li>생성자 이름은 클래스 이름과 같습니다: <code>Circle</code>.</li><li>생성자에는 <code>void</code>를 포함해 반환형을 쓰지 않습니다.</li><li><code>Circle(int r)</code>만 직접 만들었다면 <code>Circle c;</code>는 오류입니다. 인자 없이 쓸 수 있는 생성자가 없기 때문입니다.</li></ul>
    <details class="lesson-detail"><summary>그럼 Circle c;도 가능하게 하려면?</summary><p>public 영역에 인자 없는 생성자도 정의하면 됩니다. 둘 중 어떤 생성자가 호출되는지는 객체를 만들 때 전달한 인자로 결정됩니다.</p>${code('Circle() { radius = 1; }\nCircle(int r) { radius = r; }\n\n// Circle a;     → radius = 1\n// Circle b(5);  → radius = 5', '클래스 안에 추가하는 생성자 두 가지')}<p>강의의 위임 생성자 문법으로는 <code>Circle() : Circle(1) { }</code>처럼 다른 생성자에 초기화를 맡길 수도 있습니다.</p></details>
    <p class="class-note">위 실습 클래스는 생성자의 r을 그대로 저장합니다. 이후 setRadius 호출에서는 <code>r &gt; 0</code>일 때만 변경합니다. 예제의 생성 인자는 2와 5입니다.</p>
    ${takeaway('객체 생성 → 생성자에 인자 전달 → 그 객체의 멤버 초기화. 이 순서로 읽으면 됩니다.')}` },
  { id: 'trace', nav: '한 줄씩 따라가기', title: '코드 한 줄이 실행될 때마다 객체 안을 보세요.', refs: [s(3,10,21),s(3,34,36)], body: () => `
    <p class="lesson-lead">먼저 다음 줄에서 어느 객체가 바뀔지 예상한 뒤 <strong>한 줄 진행</strong>을 눌러 보세요. 4단계의 Circle 클래스로 두 객체를 만드는 예제입니다.</p>
    <p class="class-note">예제 코드의 동작을 보여 주는 시각화입니다. 객체 그림은 학습용이며, C++ 프로그램의 실제 출력은 아래 “출력” 영역의 숫자입니다.</p>
    <div id="trace-widget"></div>
    <details class="lesson-detail"><summary>헤더와 클래스가 포함된 전체 코드 보기</summary>${code(traceProgram)}</details>
    ${takeaway('<code>donut.setRadius(4)</code>는 donut만 바꿉니다. 두 getRadius()는 각각 자기 객체의 값을 읽으므로 출력은 <strong>4 5</strong>입니다.')}` },
  { id: 'sandbox', nav: '직접 값 바꿔 보기', title: '이번에는 직접 어느 객체를 바꿀지 정해 보세요.', refs: [s(3,10,14),s(3,37,40)], body: () => `
    <p class="lesson-lead">donut은 2, pizza는 5로 시작합니다. 객체와 인자를 고르고 함수를 호출해 보세요. <strong>인자만 골랐을 때와 함수를 호출했을 때</strong>를 구별해 보세요.</p>
    <div class="sandbox-controls"><label>호출할 객체<select id="object-select"><option value="donut">donut</option><option value="pizza">pizza</option></select></label><label class="radius-control">전달할 반지름 r = <output id="radius-label">4</output><input id="radius-input" type="range" min="0" max="8" step="1" value="4"><span>0부터 8까지 선택</span></label></div>
    <div class="pending-call"><span>실행할 코드</span><code id="pending-call">donut.setRadius(4);</code><button id="apply-radius" class="button primary">함수 호출하기</button></div>
    <div id="sandbox-objects" class="object-grid"></div>
    <p id="sandbox-message" class="simulation-message" role="status">값을 골라도 아직 객체는 바뀌지 않았습니다. 함수 호출하기를 눌러 보세요.</p>
    <div class="simulation-output"><span>지금 두 getRadius()를 출력하면</span><pre id="sandbox-output">2 5</pre></div>
    <button id="sandbox-reset" class="button">처음 값 2, 5로 되돌리기</button>
    ${code('void setRadius(int r) {\n    if (r > 0) radius = r;\n}', '호출할 때 실행되는 함수 본문')}
    <p>r을 0으로 골라 호출해 보세요. <code>r &gt; 0</code>이 거짓이라 대입문을 실행하지 않고, 기존 반지름을 유지합니다. 이런 규칙을 변경 함수에 모아 두는 것이 데이터를 함수로 다루는 이유 중 하나입니다.</p>
    ${takeaway('함수 호출의 <strong>대상 객체</strong>, 전달한 <strong>인자</strong>, 실행할 <strong>본문</strong>을 함께 보면 값의 변화를 설명할 수 있습니다.')}` },
  { id: 'syntax', nav: 'this와 :: 구별하기', title: '이름이 같을 때는 this, 클래스 밖 구현에는 ::를 써요.', refs: [s(3,10,14),s(4,29,33)], body: () => `
    <h3>this는 지금 함수를 호출한 객체의 주소예요.</h3>
    <p><code>donut.setRadius(7);</code>를 실행하는 동안 this는 donut을 가리킵니다. <code>pizza.setRadius(7);</code>에서는 pizza를 가리킵니다. 매개변수와 멤버 이름이 같으면 this로 구별할 수 있습니다.</p>
    ${code('void setRadius(int radius) {\n    if (radius > 0) {\n        this->radius = radius;\n    }\n}', '클래스 안에서 정의하는 멤버 함수')}
    <div class="term-grid"><div><h3>왼쪽 this-&gt;radius</h3><p>현재 객체의 멤버 변수입니다. 여기에 값을 보관합니다.</p></div><div><h3>오른쪽 radius</h3><p>매개변수 이름입니다. 이번 호출에서 전달받은 값입니다.</p></div></div>
    <p>이 함수에서 <code>radius = radius;</code>라고 쓰면 매개변수에 자기 값을 다시 대입할 뿐입니다. 객체의 멤버는 바뀌지 않습니다. 매개변수 이름을 r로 했다면 <code>radius = r;</code>처럼 쓸 수 있습니다.</p>
    <h3>::는 “어느 클래스의 멤버인가”를 붙이는 표시예요.</h3>
    ${code(outsideDefinition, '클래스 안에는 선언, 밖에는 구현')}
    <p><code>int Circle::getRadius()</code>는 Circle에 속한 함수를 구현한다는 뜻입니다. 특정 객체에게 함수를 호출하는 <code>donut.getRadius()</code>와 역할이 다릅니다. 선언 끝에는 세미콜론을 쓰고, 구현에는 실제 실행할 본문을 씁니다.</p>
    <table class="lesson-table"><thead><tr><th>표현</th><th>읽는 방법</th></tr></thead><tbody><tr><td><code>donut.getRadius()</code></td><td>donut 객체의 멤버 함수 호출</td></tr><tr><td><code>Circle::getRadius</code></td><td>Circle 클래스 소속 멤버라는 표시</td></tr><tr><td><code>this-&gt;radius</code></td><td>지금 호출 대상인 객체의 radius</td></tr></tbody></table>
    ${takeaway('객체의 멤버를 사용할 때는 <code>.</code>, 클래스 밖에서 소속을 붙일 때는 <code>::</code>, 현재 객체를 가리키는 포인터는 <code>this</code>입니다.')}` },
  { id: 'lifetime', nav: '생성부터 소멸까지', title: '지역 객체는 자기 블록이 끝날 때 소멸해요.', refs: [s(3,31,36),s(4,21,24)], body: () => `
    <p class="lesson-lead">생성자가 객체의 시작이라면, 소멸자는 끝에서 호출됩니다. 이름은 <code>~Circle()</code>이며 반환형과 매개변수를 쓰지 않습니다.</p>
    ${code(lifecycleProgram, '호출 시점을 보기 위해 생성자·소멸자에 출력문을 넣은 예제')}
    <table class="lesson-table"><thead><tr><th>실행 지점</th><th>일어나는 일</th><th>출력</th></tr></thead><tbody><tr><td>Circle a(2);</td><td>a 생성</td><td><code>C 2</code></td></tr><tr><td>Circle b(5);</td><td>안쪽 블록에서 b 생성</td><td><code>C 5</code></td></tr><tr><td>안쪽 cout</td><td>문자열 출력</td><td><code>inside</code></td></tr><tr><td>안쪽 }</td><td>b의 수명 종료, 소멸자 호출</td><td><code>D 5</code></td></tr><tr><td>바깥 cout</td><td>a는 아직 살아 있음</td><td><code>outside</code></td></tr><tr><td>main의 }</td><td>a의 수명 종료, 소멸자 호출</td><td><code>D 2</code></td></tr></tbody></table>
    <p>소멸자에 출력문을 적었기 때문에 D가 보입니다. 소멸자가 호출된다고 자동으로 “소멸”이라는 문장이 출력되는 것은 아닙니다. 소멸자는 실제 코드에서 객체가 소유한 동적 메모리 같은 자원을 정리할 때 사용합니다.</p>
    <details class="lesson-detail"><summary>4장 연결: new로 만든 객체는 언제 소멸할까?</summary>${code('Circle* p = new Circle(3); // 객체 생성, 생성자 호출\ndelete p;                  // 객체 소멸, 소멸자 호출')}<p>여기서 p는 객체를 가리키는 포인터입니다. 포인터 p의 지역 수명이 끝나는 것만으로 동적 객체가 자동 해제되지는 않습니다. 단일 동적 객체는 delete, new[]로 만든 객체 배열은 delete[]로 해제합니다.</p></details>
    ${takeaway('일반 지역 객체는 <strong>자기 블록을 벗어날 때</strong> 소멸합니다. 같은 블록에서는 나중에 생성한 객체가 먼저 소멸합니다.')}` },
  { id: 'check', nav: '이해했는지 확인하기', title: '이제 코드에서 객체의 이름부터 찾아보세요.', refs: [s(3,7,28),s(3,37,40)], body: () => `
    <p class="lesson-lead">아래에서 답을 고르면 바로 이유를 확인할 수 있습니다. 헷갈리면 왼쪽 목차에서 해당 설명으로 돌아가 보세요.</p>
    <div class="understanding-checks">${checks.map((q,i) => `<fieldset class="class-check" data-check="${q.id}"><legend><span>${i+1}</span>${esc(q.prompt)}</legend>${q.options.map((option,j) => `<label><input type="radio" name="class-check-${q.id}" value="${j}"><span>${esc(option)}</span></label>`).join('')}<p class="check-result" role="status" hidden></p></fieldset>`).join('')}</div>
    <h3>자주 헷갈리는 문법도 확인해 두세요.</h3>
    <table class="lesson-table"><thead><tr><th>코드</th><th>확인할 점</th></tr></thead><tbody><tr><td><code>class Circle { ... };</code></td><td>클래스 정의 끝의 세미콜론 필요</td></tr><tr><td><code>void Circle(int r)</code></td><td>잘못된 생성자 선언: 반환형을 쓰지 않음</td></tr><tr><td><code>Circle c;</code></td><td>인자 없이 호출할 수 있는 생성자가 있어야 함</td></tr><tr><td><code>Circle c();</code></td><td>객체 생성이 아니라 Circle을 반환하는 함수 c의 선언</td></tr><tr><td><code>donut.getRadius()</code></td><td>함수를 호출할 때 괄호 사용</td></tr></tbody></table>
    ${takeaway('클래스는 <strong>자료형 정의</strong>, 객체는 <strong>실제 대상</strong>, 멤버 변수는 <strong>객체의 상태</strong>, 멤버 함수는 <strong>그 상태를 다루는 동작</strong>입니다.')}
    <a class="button primary" href="./">문제와 핵심 암기로 이어가기 →</a>` }
];
