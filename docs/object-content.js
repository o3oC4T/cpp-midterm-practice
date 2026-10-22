import { escapeHTML as esc } from './engine.js';
import { source as s } from './sources.js';
import { code } from './class-content.js';
import { circleCode, programFor, ownerProgram } from './object-model.js';
const takeaway = text => `<div class="class-takeaway"><strong>여기서 이해할 것</strong><p>${text}</p></div>`;
const trace = name => `<div id="dynamic-trace" data-scenario="${name}"></div><details class="lesson-detail"><summary>클래스와 헤더를 포함한 전체 코드 보기</summary>${code(programFor(name))}</details>`;
export const checks = [
  {id:'declaration',prompt:'Circle* p = nullptr;만 실행하면 Circle 객체는 몇 개 만들어질까요?',options:['0개. 포인터 변수만 만들어진다.','1개. Circle 생성자가 호출된다.'],correct:0,explanation:'Circle*는 Circle 객체의 주소를 담는 포인터 타입입니다. 포인터 선언만으로 대상 객체가 생기지는 않습니다.'},
  {id:'alias',prompt:'p = &donut; 다음 Circle* q = p; q->setRadius(7);을 실행하면?',options:['q라는 Circle 객체가 새로 생긴다.','donut의 반지름이 7이 된다.','p에 저장된 주소가 7로 바뀐다.'],correct:1,explanation:'q에도 같은 객체의 주소를 복사했습니다. q와 p가 같은 donut을 가리키므로 q를 통해 donut의 멤버를 바꿉니다.'},
  {id:'delete',prompt:'Circle* p = new Circle(3); 다음 delete p;를 실행하면?',options:['객체와 포인터 변수 p가 모두 사라진다.','객체가 소멸하고 p는 자동으로 nullptr가 된다.','객체가 소멸하지만 p가 자동으로 nullptr가 되지는 않는다.'],correct:2,explanation:'delete는 대상 객체를 소멸시키고 동적 메모리를 해제합니다. 포인터 변수 p의 값은 직접 nullptr로 바꿔야 합니다.'},
  {id:'null',prompt:'동적 객체의 유일한 주소를 가진 p에 바로 p = nullptr;를 대입하면?',options:['소멸자가 호출되고 메모리가 해제된다.','객체는 남아 있는데 주소를 잃어 메모리 누수가 생긴다.'],correct:1,explanation:'nullptr 대입은 포인터 값만 바꿉니다. 객체를 해제하려면 주소를 잃기 전에 delete p;가 필요합니다.'},
  {id:'array',prompt:'Circle* p = new Circle[3];에 대응하는 올바른 해제는?',options:['delete p;','delete[] p;','delete[] p[0];'],correct:1,explanation:'new[]로 만든 배열에는 delete[]를 사용합니다. 원소들의 소멸자가 역순으로 호출됩니다.'},
  {id:'base',prompt:'base = new Circle[3]; p = base; p++; 뒤 배열을 해제하려면?',options:['delete[] p;','delete p;','delete[] base;'],correct:2,explanation:'base가 new[]가 반환한 첫 주소를 보관하고 있습니다. p는 1번 원소로 이동했으므로 delete[]에 넘길 시작 포인터가 아닙니다.'}
];
export const lessons = [
  {id:'pointer',nav:'객체와 포인터 구별',title:'객체는 데이터를 가지고, 포인터는 객체의 주소를 가져요.',refs:[s(4,3,4)],body:()=>`
    <p class="lesson-lead"><code>Circle donut(2);</code>는 객체를 만듭니다. <code>Circle* p = &amp;donut;</code>는 이미 있는 donut의 주소를 p에 저장합니다. <strong>객체 하나와 그 객체를 가리키는 포인터 하나</strong>입니다.</p>
    ${code('Circle donut(2);\nCircle* p = &donut;\n\ncout << donut.getRadius() << endl; // 2\ncout << p->getRadius() << endl;    // 2\ncout << (*p).getRadius() << endl;  // 2')}
    <div class="address-diagram"><div class="pointer-box"><span>포인터 변수</span><strong>p</strong><code>donut의 주소</code></div><span class="address-arrow" aria-hidden="true">→</span><div class="pointed-object"><span>Circle 객체</span><strong>donut</strong><code>radius = 2</code></div></div>
    <table class="lesson-table"><thead><tr><th>표현</th><th>뜻</th></tr></thead><tbody><tr><td><code>p</code></td><td>객체의 주소를 담는 포인터 변수</td></tr><tr><td><code>&amp;donut</code></td><td>donut 객체의 주소</td></tr><tr><td><code>*p</code></td><td>p가 가리키는 객체 자체</td></tr><tr><td><code>p-&gt;getRadius()</code></td><td>가리키는 객체의 멤버 함수 호출</td></tr><tr><td><code>(*p).getRadius()</code></td><td>위와 같은 호출. 먼저 *p로 객체를 얻음</td></tr></tbody></table>
    <p><code>*p.getRadius()</code>로 괄호를 빼면 같은 의미가 아닙니다. 점 연산자가 먼저 묶이기 때문에 p 자체에 점으로 접근하려고 합니다. 포인터에는 <code>-&gt;</code>를 쓰면 간단합니다.</p>
    <p><code>Circle* p;</code>만으로 Circle 객체가 생기지 않습니다. 함수 안의 일반 지역 포인터를 이렇게 선언하면 값도 자동으로 nullptr가 되지 않으므로, 사용할 주소나 <code>nullptr</code>로 초기화하세요.</p>
    <details class="lesson-detail"><summary>이번 설명에서 사용할 Circle 클래스</summary>${code(circleCode())}<p>앞서 배운 클래스에 기본 생성자 Circle()를 추가했습니다. 인자 없이 만들면 radius는 1입니다. 각 코드 조각에는 필요한 헤더와 using namespace std;가 있다고 가정합니다.</p></details>
    ${takeaway('<code>donut</code>은 객체, <code>p</code>는 주소, <code>*p</code>는 그 주소의 객체입니다. 객체에는 <code>.</code>, 객체 포인터에는 <code>-&gt;</code>를 씁니다.')}`},
  {id:'follow',nav:'가리키는 대상 바꾸기',title:'p를 바꾸는 것과 *p의 멤버를 바꾸는 것은 달라요.',refs:[s(4,3,4)],body:()=>`
    <p class="lesson-lead">먼저 p가 가리킬 대상을 바꿔 보세요. 그다음 <code>p-&gt;setRadius()</code>를 호출하면 <strong>현재 가리키는 객체</strong>의 값만 바뀝니다.</p>
    ${code('Circle donut(2), pizza(5);\nCircle* p = &donut;\np = &pizza;          // p에 저장된 주소만 바꿈\np->setRadius(7);     // pizza의 radius를 바꿈')}
    <p class="class-note">정해진 예제의 동작을 보여 주는 시각화입니다. 주소는 숫자 대신 객체 이름으로 표시합니다.</p>
    <div class="sandbox-controls"><label>p가 가리킬 대상<select id="pointer-target"><option value="donut">donut</option><option value="pizza">pizza</option><option value="null">nullptr · 대상 없음</option></select></label><label class="radius-control">전달할 r = <output id="pointer-radius-label">7</output><input id="pointer-radius" type="range" min="0" max="8" value="7" step="1"><span>r이 0이면 setter의 조건에 따라 값을 유지합니다.</span></label></div>
    <div id="pointer-lab-view"></div>
    <div class="pending-call"><code id="pointer-pending">p->setRadius(7);</code><button id="pointer-call" class="button primary">함수 호출하기</button></div>
    <p id="pointer-message" class="simulation-message" role="status">p는 donut을 가리킵니다. 대상 선택은 p에 저장된 주소만 바꿉니다.</p>
    <button id="pointer-reset" class="button">처음 상태로 되돌리기</button>
    <p><code>p = &amp;pizza;</code>를 실행해도 donut이 pizza로 변하거나 pizza가 복사되지 않습니다. 두 객체는 그대로 있고 p가 찾아갈 주소만 달라집니다. nullptr를 선택하면 대상이 없으므로 멤버 함수를 호출할 수 없습니다.</p>
    ${takeaway('<code>p = ...</code>는 <strong>가리킬 대상</strong>을 바꾸고, <code>p-&gt;setRadius(...)</code>는 <strong>가리키는 객체의 상태</strong>를 바꿉니다.')}`},
  {id:'array-basics',nav:'객체 배열과 p++',title:'객체 배열에서는 포인터를 한 칸 움직이면 다음 객체예요.',refs:[s(4,5,10)],body:()=>`
    <p class="lesson-lead"><code>Circle circles[3];</code>은 포인터 세 개가 아니라 <strong>Circle 객체 세 개</strong>를 만듭니다. 각 원소마다 기본 생성자가 호출됩니다.</p>
    ${code('Circle circles[3];\ncircles[0].setRadius(2);\ncircles[1].setRadius(4);\ncircles[2].setRadius(6);\n\nCircle* p = circles;\ncout << p->getRadius() << endl; // 2\np++;\ncout << p->getRadius() << endl; // 4')}
    <div class="array-map"><div><span>0번 객체</span><strong>circles[0]</strong><code>radius = 2</code></div><div class="array-selected"><span>1번 객체 · p++ 후 p의 대상</span><strong>circles[1]</strong><code>radius = 4</code></div><div><span>2번 객체</span><strong>circles[2]</strong><code>radius = 6</code></div></div>
    <p>배열 이름 circles는 위 대입에서 첫 원소의 주소로 사용됩니다. <code>Circle* p</code>에 대해 <code>p++</code>는 1바이트가 아니라 <strong>Circle 원소 하나만큼</strong> 앞으로 이동합니다. 이 예제에서는 같은 배열 안의 다음 원소로 이동합니다.</p>
    <table class="lesson-table"><thead><tr><th>p가 배열 시작일 때</th><th>같은 뜻</th></tr></thead><tbody><tr><td><code>p[0].getRadius()</code></td><td><code>p-&gt;getRadius()</code></td></tr><tr><td><code>p[1].getRadius()</code></td><td><code>(p + 1)-&gt;getRadius()</code></td></tr><tr><td><code>p[i]</code></td><td><code>*(p + i)</code></td></tr></tbody></table>
    <p>p를 이동시킨 뒤의 <code>p[0]</code>은 <em>현재 p가 가리키는 원소</em>입니다. 무조건 처음 배열의 0번 원소라는 뜻은 아닙니다. 배열 끝을 넘어 객체를 읽거나 고치면 안 됩니다.</p>
    <p class="class-note"><code>Circle* pointers[3];</code>는 별개의 문법입니다. Circle 객체가 아니라 Circle 주소를 담는 포인터 원소 3개를 선언합니다.</p>
    ${takeaway('배열 원소는 객체라서 <code>p[i].함수()</code>, 원소의 주소는 포인터라서 <code>(p+i)-&gt;함수()</code>입니다.')}`},
  {id:'new',nav:'new가 하는 세 가지 일',title:'new는 객체를 만들고, 그 주소를 돌려줘요.',refs:[s(4,13,16),s(4,21,22)],body:()=>`
    <p class="lesson-lead"><code>Circle* p = new Circle(3);</code>를 왼쪽과 오른쪽으로 나눠 보세요. 왼쪽은 <strong>주소를 담을 변수</strong>, 오른쪽은 <strong>실행 중 객체 생성</strong>입니다.</p>
    <div class="constructor-flow"><div><span>① 메모리 확보</span><code>Circle 객체가 들어갈 공간</code></div><div><span>② 생성자 실행</span><code>Circle(3) → radius = 3</code></div><div><span>③ 주소 반환</span><code>새 객체의 주소를 p에 저장</code></div></div>
    <div class="address-diagram"><div class="pointer-box"><span>지역 포인터 변수</span><strong>p</strong><code>동적 객체의 주소</code></div><span class="address-arrow" aria-hidden="true">→</span><div class="pointed-object"><span>동적 메모리 영역의 객체</span><strong>Circle</strong><code>radius = 3</code></div></div>
    <table class="lesson-table"><thead><tr><th>코드</th><th>만드는 것</th><th>객체의 소멸 시점</th></tr></thead><tbody><tr><td><code>Circle a(3);</code></td><td>일반 지역 객체 a</td><td>선언된 블록이 끝날 때</td></tr><tr><td><code>Circle* p = &amp;a;</code></td><td>a를 가리키는 포인터</td><td>a의 수명은 그대로</td></tr><tr><td><code>Circle* q = new Circle(3);</code></td><td>지역 포인터 q + 동적 객체</td><td>동적 객체에 delete를 실행할 때</td></tr></tbody></table>
    <p><strong>q가 지역 변수여도 q가 가리키는 객체까지 일반 지역 객체인 것은 아닙니다.</strong> q라는 포인터 변수와 new로 만든 객체는 서로 다른 저장 공간과 수명을 가집니다.</p>
    <p>동적 생성은 실행 중 필요한 객체 수가 정해질 때 유용합니다. 사용자가 입력한 n개만큼 <code>new Circle[n]</code>으로 만들 수 있습니다. 포인터를 쓴다고 반드시 new가 필요한 것은 아닙니다. 이미 있는 객체는 <code>&amp;객체</code>로 가리킬 수 있습니다.</p>
    ${takeaway('<code>new Circle(3)</code>의 결과는 Circle 객체 자체가 아니라 <strong>생성된 객체의 주소</strong>입니다.')}`},
  {id:'dynamic-trace',nav:'생성·사용·해제 따라가기',title:'포인터 변수와 동적 객체의 수명을 따로 보세요.',refs:[s(4,17,18),s(4,21,22)],body:()=>`
    <p class="lesson-lead">한 줄씩 진행하면서 p의 상태와 객체의 생존 여부를 비교해 보세요. 이번 예제에는 생성자에 <code>C 반지름</code>, 소멸자에 <code>D 반지름</code>을 출력하는 문장을 넣었습니다.</p>
    <p class="class-note">H1은 그림에서 객체를 구별하기 위한 이름이며 실제 메모리 주소가 아닙니다. 코드의 상태 변화를 시각화한 화면입니다.</p>
    ${trace('single')}
    ${takeaway('<strong>new에서 객체 생성 → -&gt;로 사용 → delete에서 객체 소멸 → nullptr로 포인터 정리</strong> 순서입니다.')}`},
  {id:'delete-null',nav:'delete와 nullptr의 차이',title:'객체를 없애는 것과 주소를 지우는 것은 다른 일이에요.',refs:[s(4,17,18),s(4,23,28)],body:()=>`
    <div class="term-grid"><div><h3><code>delete p;</code></h3><p>p가 가리키는 <strong>단일 동적 객체</strong>를 소멸시키고 메모리를 해제합니다. p를 자동으로 nullptr로 바꾸지는 않습니다.</p><div class="memory-result">p: 대상이 해제된 포인터<br>객체: 소멸 완료</div></div><div><h3><code>p = nullptr;</code></h3><p><strong>포인터 변수의 값</strong>을 아무것도 가리키지 않는 값으로 바꿉니다. 소멸자를 호출하거나 객체 메모리를 해제하지 않습니다.</p><div class="memory-result">p: 대상 없음<br>객체: 이 대입만으로 소멸하지 않음</div></div></div>
    ${code('Circle* p = new Circle(3);\ndelete p;       // 먼저 객체를 소멸·해제\np = nullptr;    // 그다음 포인터 값을 정리', '올바른 순서')}
    <h3>주소만 먼저 지우면 메모리 누수가 생길 수 있어요.</h3>
    ${code('Circle* p = new Circle(3);\np = nullptr; // delete를 하지 않고 유일한 주소를 잃음', '실수 예제 · 올바른 해제 코드가 아님')}
    <p>위 코드에서는 객체가 여전히 동적 메모리에 남아 있는데 그 주소를 잃었습니다. 이렇게 할당받은 메모리를 더 이상 찾아 해제할 수 없게 되는 것이 메모리 누수입니다. <code>delete nullptr;</code>는 아무 일도 하지 않으므로, 나중에 delete p를 써도 잃어버린 객체를 정리하지 못합니다.</p>
    <h3>같은 객체를 가리키던 다른 포인터도 확인해야 해요.</h3>
    ${code('Circle* p = new Circle(3);\nCircle* q = p;   // 객체 복사가 아니라 주소 복사\ndelete p;\np = nullptr;\n// q는 여전히 해제한 객체를 가리키던 값이다.\n// q->getRadius(); 또는 delete q;를 하면 안 된다.\nq = nullptr;')}
    <p>p와 q는 별도의 포인터 변수입니다. p에 nullptr를 대입해도 q가 자동으로 바뀌지 않습니다. 이미 해제한 대상에 접근하거나 다시 해제하는 코드는 올바르지 않으며, “항상 특정 값이 출력된다”거나 “항상 같은 오류가 난다”고 예측할 수 없습니다.</p>
    <p class="class-note">강의의 NULL처럼 대상이 없음을 나타내기 위해 여기서는 C++의 nullptr를 사용합니다. 또한 <code>Circle a(3); Circle* p = &amp;a;</code>처럼 일반 지역 객체를 가리킬 때는 delete p를 하면 안 됩니다. new로 할당한 대상과 구별하세요.</p>
    ${takeaway('<strong>delete는 대상 정리, nullptr 대입은 포인터 값 정리.</strong> 한쪽이 다른 쪽을 대신하지 않습니다.')}`},
  {id:'new-array',nav:'객체 배열을 동적으로 생성',title:'new Circle[3]은 실제 Circle 객체를 세 개 만들어요.',refs:[s(4,18,20),s(4,23,24)],body:()=>`
    ${code('Circle* p = new Circle[3];\np[0].setRadius(2);\np[1].setRadius(4);\np[2].setRadius(6);\n\ncout << p[1].getRadius() << endl;     // 4\ncout << (p + 1)->getRadius() << endl; // 4\n\ndelete[] p;\np = nullptr;')}
    <p>new[]는 객체 세 개의 공간을 확보하고 각 원소의 기본 생성자를 호출합니다. 이 설명의 <code>Circle()</code>은 radius를 1로 초기화합니다. <code>Circle(int)</code>만 있고 인자 없이 호출할 수 있는 생성자가 없다면 <code>new Circle[3]</code>는 컴파일할 수 없습니다.</p>
    <table class="lesson-table"><thead><tr><th>생성 코드</th><th>의미</th><th>해제 코드</th></tr></thead><tbody><tr><td><code>new Circle(3)</code></td><td>반지름 3인 객체 하나</td><td><code>delete p;</code></td></tr><tr><td><code>new Circle[3]</code></td><td>객체 세 개짜리 배열</td><td><code>delete[] p;</code></td></tr><tr><td><code>new Circle[1]</code></td><td>객체 한 개짜리 배열</td><td><code>delete[] p;</code></td></tr></tbody></table>
    <p><strong>(3)은 생성자에 전달할 인자, [3]은 배열 원소 수</strong>입니다. 객체가 한 개여도 new[]로 만들었다면 delete[]를 사용합니다. delete[]의 괄호 안에 원소 수를 쓰지는 않습니다.</p>
    <p>배열 생성은 0, 1, 2번 순서이고, 배열 해제 시 소멸은 2, 1, 0번 순서입니다. 반지름을 2, 4, 6으로 바꿨다면 소멸자에서 읽는 현재 값도 역순으로 6, 4, 2입니다.</p>
    ${takeaway('<code>new</code>에는 <code>delete</code>, <code>new[]</code>에는 <code>delete[]</code>. 원소 수가 아니라 <strong>할당 방식</strong>으로 짝을 맞춥니다.')}`},
  {id:'array-trace',nav:'배열 이동과 역순 소멸',title:'이동용 포인터와 배열 시작 주소를 나눠 보관해 보세요.',refs:[s(4,23,24),s(4,27)],body:()=>`
    <p class="lesson-lead">base는 처음 주소를 보관하고 p만 움직입니다. 마지막에 <code>delete[] base;</code>를 실행하면 원소가 어떤 순서로 소멸하는지 확인해 보세요.</p>
    <p class="class-note">C와 D는 이 추적 예제에 작성한 생성자·소멸자의 출력입니다. H1은 배열의 식별용 이름이며 실제 주소가 아닙니다.</p>
    ${trace('array')}
    ${takeaway('<code>p++</code>로 이동해도 base는 시작 주소를 유지합니다. <strong>delete[]에는 new[]가 반환한 시작 포인터</strong>를 전달합니다.')}`},
  {id:'owner',nav:'클래스가 동적 배열을 관리',title:'배열을 소유한 클래스가 생성과 해제를 함께 맡을 수 있어요.',refs:[s(4,26,27)],body:()=>`
    <p class="lesson-lead">강의의 CircleManager 예제를 작게 줄여 보겠습니다. manager의 멤버에는 <strong>배열 자체가 아니라 배열의 주소</strong>를 저장합니다.</p>
    ${code('class CircleManager {\n    Circle* circles;\n    int size;\npublic:\n    CircleManager(int n) {\n        size = n;\n        circles = new Circle[size];\n    }\n    void setAll(int r) {\n        for (int i = 0; i < size; i++)\n            circles[i].setRadius(r);\n    }\n    ~CircleManager() {\n        delete[] circles;\n    }\n};\n\nint main() {\n    CircleManager manager(3);\n    manager.setAll(4);\n}')}
    <div class="constructor-flow"><div><span>① manager 생성</span><code>생성자에서 Circle 배열 3개 동적 생성</code></div><div><span>② manager.setAll(4)</span><code>배열 각 원소의 radius를 4로 설정</code></div><div><span>③ main 종료</span><code>manager의 소멸자에서 delete[]</code></div></div>
    <p>manager가 일반 지역 객체라서 main 끝에 소멸자가 자동으로 호출됩니다. <strong>그 소멸자 안에 delete[]를 작성했기 때문에</strong> 동적 배열도 해제됩니다. 포인터 멤버가 있다는 이유만으로 대상 배열까지 자동 해제되는 것은 아닙니다.</p>
    <p>이 예제는 양수 3을 전달하고 manager 하나를 사용합니다. 동적 메모리를 소유한 객체를 복사할 때 생기는 문제는 5장의 얕은 복사·깊은 복사와 연결됩니다.</p>
    <details class="lesson-detail"><summary>생성·소멸 출력까지 포함한 실행 코드와 결과</summary>${code(ownerProgram)}${code('C 1\nC 1\nC 1\nD 4\nD 4\nD 4', '출력')}<p>CircleManager 자체에는 출력문을 넣지 않았습니다. 위 출력은 배열 안의 Circle 원소들에서 나옵니다.</p></details>
    ${takeaway('생성자에서 할당한 동적 자원을 소멸자에서 정리하면, <strong>관리 객체의 수명과 정리 책임</strong>을 연결할 수 있습니다.')}`},
  {id:'check',nav:'이해했는지 확인하기',title:'지금 바뀌는 것이 주소인지 객체인지 구별해 보세요.',refs:[s(4,3,4),s(4,17,28)],body:()=>`
    <p class="lesson-lead">답을 고르면 바로 이유를 확인할 수 있습니다. 처음에는 주소가 담긴 변수와 실제 객체를 따로 그려 가며 풀어 보세요.</p>
    <div class="understanding-checks">${checks.map((q,i)=>`<fieldset class="class-check" data-check="${q.id}"><legend><span>${i+1}</span>${esc(q.prompt)}</legend>${q.options.map((option,j)=>`<label><input type="radio" name="object-check-${q.id}" value="${j}"><span>${esc(option)}</span></label>`).join('')}<p class="check-result" role="status" hidden></p></fieldset>`).join('')}</div>
    <table class="lesson-table"><thead><tr><th>한 줄</th><th>머릿속으로 읽는 말</th></tr></thead><tbody><tr><td><code>p = &amp;obj;</code></td><td>기존 객체의 주소 저장</td></tr><tr><td><code>p = new Circle(3);</code></td><td>객체 생성 + 생성자 실행 + 주소 저장</td></tr><tr><td><code>p-&gt;setRadius(7);</code></td><td>가리키는 객체의 멤버 수정</td></tr><tr><td><code>delete p;</code></td><td>단일 동적 객체 소멸·해제</td></tr><tr><td><code>p = nullptr;</code></td><td>포인터 값만 대상 없음으로 변경</td></tr><tr><td><code>delete[] base;</code></td><td>배열 원소를 역순 소멸·해제</td></tr></tbody></table>
    ${takeaway('코드를 읽을 때 <strong>주소를 가진 변수 / 실제 객체 / 할당·해제 방식</strong>을 따로 확인하세요.')}
    <a class="button primary" href="./references.html">5장 참조·복사 생성자로 →</a>`}
];
