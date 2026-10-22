import { escapeHTML as esc } from './engine.js';
import { source as s } from './sources.js';
import { code } from './class-content.js';
import { circleCode, averageFunction, personCode, personProgram, nrvoProgram, csvProgram } from './reference-model.js';
const takeaway = text => `<div class="class-takeaway"><strong>이렇게 기억하세요</strong><p>${text}</p></div>`;
const trace = (kind, choices = false) => `<div class="reference-trace" data-kind="${kind}">${choices ? `<label class="trace-mode-label">비교할 방식<select id="trace-mode">${(kind === 'copy' ? [['shallow','얕은 복사'],['deep','깊은 복사']] : [['value','값 전달'],['pointer','주소 전달'],['reference','참조 전달']]).map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select><span>방식을 바꾸면 처음부터 비교합니다.</span></label>` : ''}<div id="reference-trace-view"></div></div>`;
export const checks = [
  {id:'alias',prompt:'int n = 2, m = 9; int& r = n; r = m; r++; 이후 n과 m은?',options:['2, 10','10, 9','9, 10','2, 9'],correct:1,explanation:'r은 끝까지 n의 별명입니다. r = m은 n에 9를 대입하고 r++는 n을 10으로 만듭니다.'},
  {id:'swap',prompt:'void swapNumbers(int a, int b) 안에서 두 값을 교환했습니다. 원본 m, n도 바뀔까요?',options:['바뀐다. 함수 이름이 swap이기 때문이다.','바뀌지 않는다. a와 b는 별도 복사본이다.','m만 바뀐다.','참조 반환을 쓰면 자동으로 바뀐다.'],correct:1,explanation:'이름이 아닌 매개변수 타입과 본문을 봐야 합니다. int a, int b는 값 전달입니다.'},
  {id:'object',prompt:'Circle original(3); 다음 increase(Circle c)에 original을 전달합니다. c는 어떻게 생기나요?',options:['생성자 없이 생긴다.','Circle(int)가 다시 호출된다.','original에서 복사 생성된다.','original의 별명이다.'],correct:2,explanation:'이 예제의 값 매개변수 c는 복사 생성자로 만듭니다. 일반 생성자 로그가 없어도 생성자가 전혀 호출되지 않은 것은 아닙니다.'},
  {id:'return',prompt:'int& refReturn(int& r) { return r; }가 있습니다. int x = refReturn(data); 이후 x = 7;을 하면?',options:['data도 7이 된다.','x만 7이 된다.','참조 반환을 int로 받을 수 없다.','data가 소멸한다.'],correct:1,explanation:'받는 쪽이 int x라 현재 값을 별도 변수에 복사합니다. int& x로 받아야 data의 별명이 됩니다.'},
  {id:'init',prompt:'Circle a(3); 다음 코드 중 새 객체를 복사 생성하는 것은?',options:['Circle b(a);','a.setRadius(5);','이미 존재하는 b에 b = a;','Circle& r = a;'],correct:0,explanation:'Circle b(a);와 Circle b = a;는 모두 기존 a를 이용해 새 객체 b를 복사 생성합니다. 이미 있는 b에 하는 대입은 복사 생성자 호출이 아닙니다.'},
  {id:'deep',prompt:'동적 문자열을 소유한 Person을 깊은 복사하려면?',options:['name 포인터의 주소 값만 복사한다.','두 객체가 같은 문자열을 계속 공유한다.','새 문자열 공간을 할당하고 내용도 복사한다.','소멸자를 두 번 호출한다.'],correct:2,explanation:'객체 자체의 공간만 다른 것으로는 부족합니다. 소유한 동적 메모리도 별도로 마련해야 독립적으로 수정·해제할 수 있습니다.'},
  {id:'nrvo',prompt:'Circle make() { Circle local(5); return local; }에서 NRVO가 적용되면?',options:['반드시 이동 생성자가 호출된다.','반환을 위한 복사·이동 생성이 생략될 수 있다.','지역 변수의 참조를 반환한 것이다.','반환된 객체가 절대로 소멸하지 않는다.'],correct:1,explanation:'반환형은 여전히 Circle입니다. NRVO는 결과가 놓일 위치에 직접 객체를 구성하여 복사·이동을 생략하는 최적화입니다.'},
  {id:'average',prompt:'average()가 size <= 0이면 avg에 대입하지 않고 false를 반환합니다. avg가 -99였다면?',options:['avg는 자동으로 0이다.','false만 보고 실패를 처리하고, avg를 이번 평균으로 사용하지 않는다.','평균이 -99이다.','반환형 bool이면 avg를 바꿀 수 없다.'],correct:1,explanation:'실패 경로에는 avg 대입이 없어 이전 값 -99가 남습니다. true일 때만 계산 결과로 사용하세요.'}
];
export const lessons = [
  {id:'passing',nav:'값·주소·참조 한눈에',title:'함수에 무엇을 전달했는지부터 보면 돼요.',refs:[s(5,3,11),s(5,21,25)],body:()=>`
    <p class="lesson-lead">함수 안에서 값을 바꿨는데 main에서는 그대로인 이유가 뭘까요? <strong>복사본을 바꿨는지, 원본을 바꿨는지</strong>부터 확인하면 됩니다.</p>
    <div class="term-grid three"><div><h3>값 전달</h3><code>void f(int x)</code><p>x에 원본의 값을 복사합니다. x를 바꿔도 원본 정수는 그대로입니다.</p></div><div><h3>주소 전달</h3><code>void f(int* p)</code><p>주소 값을 포인터에 복사합니다. <code>*p</code>로 원본을 바꿀 수 있습니다.</p></div><div><h3>참조 전달</h3><code>void f(int& r)</code><p>r은 원본의 별명입니다. r을 바꾸는 것이 곧 원본을 바꾸는 것입니다.</p></div></div>
    <table class="lesson-table"><thead><tr><th>방식</th><th>호출</th><th>함수에서 7을 저장</th><th>원본 n</th></tr></thead><tbody><tr><td>값</td><td><code>f(n)</code></td><td><code>x = 7;</code></td><td>그대로</td></tr><tr><td>주소</td><td><code>f(&n)</code></td><td><code>*p = 7;</code></td><td>7</td></tr><tr><td>참조</td><td><code>f(n)</code></td><td><code>r = 7;</code></td><td>7</td></tr></tbody></table>
    <p>값 전달과 참조 전달은 <code>f(n)</code>이라는 호출 모양이 같습니다. 그래서 <strong>함수 선언의 매개변수 타입</strong>을 꼭 봐야 합니다. 주소 전달도 포인터 값 자체는 복사됩니다. 함수 안에서 p가 다른 곳을 가리키게 하는 것과, <code>*p</code>로 대상의 값을 바꾸는 것은 다른 일입니다.</p>
    ${takeaway('값 전달은 <strong>값을 받은 별도 변수</strong>, 주소 전달은 <strong>원본의 주소</strong>, 참조 전달은 <strong>원본의 다른 이름</strong>입니다.')}`},
  {id:'alias',nav:'참조는 원본의 별명',title:'ref에 대입하면, ref가 부르는 원본의 값이 바뀌어요.',refs:[s(5,15,20),s(5,54,55,true)],body:()=>`
    <p class="lesson-lead"><code>int& ref = n;</code>을 “ref라는 이름으로도 n을 부르겠다”라고 읽어 보세요. n과 ref를 서로 다른 값 상자 두 개로 생각하면 헷갈립니다.</p>
    ${trace('alias')}
    <table class="lesson-table"><thead><tr><th>표현</th><th>&amp;의 역할</th></tr></thead><tbody><tr><td><code>int& ref = n;</code></td><td>선언에서 참조 타입 표시</td></tr><tr><td><code>int* p = &n;</code></td><td>식에서 n의 주소를 구함</td></tr><tr><td><code>&ref == &n</code></td><td>같은 원본의 주소라 true</td></tr></tbody></table>
    <p>이런 지역 참조는 선언할 때 대상을 정해야 합니다. <code>int& ref;</code>처럼 대상을 빼면 오류입니다. 초기화한 뒤에는 다른 대상으로 다시 연결할 수 없습니다. 객체 참조 <code>Circle& r = original;</code>도 같은 원리이며, 멤버는 <code>r.setRadius(5)</code>처럼 점으로 사용합니다.</p>
    ${takeaway('<code>int& ref = n;</code>은 <strong>별명 만들기</strong>, 그 뒤 <code>ref = i;</code>는 <strong>n에 i의 값을 대입하기</strong>입니다.')}`},
  {id:'swap',nav:'swap을 한 단계씩',title:'a와 b가 바뀔 때 main의 m과 n도 바뀌는지 보세요.',refs:[s(5,3,5),s(5,21,22)],body:()=>`
    <p class="lesson-lead">세 방식 모두 2와 9로 시작합니다. 함수를 호출한 뒤에는 <strong>실제로 실행되는 함수 본문 안으로 들어가</strong> 순서대로 보여 줍니다. 방식 선택을 바꿔 결과를 비교해 보세요.</p>
    ${trace('swap',true)}
    <p><code>tmp</code>는 처음 값을 보관하는 역할입니다. <code>a = b;</code> 직후에는 같은 값이 두 곳에 있으므로, tmp가 없으면 원래 a의 값을 잃어버립니다.</p>
    ${takeaway('함수 안의 이름만 따라가지 말고, <strong>그 이름이 가리키는 저장 공간</strong>을 따라가세요. 값 전달의 최종 출력은 2 9, 주소·참조 전달은 9 2입니다.')}`},
  {id:'object-call',nav:'객체를 함수에 넘기면',title:'Circle c는 복사본, Circle& c는 원본의 별명이에요.',refs:[s(5,6,11),s(5,25,27),s(5,36,38)],body:()=>`
    <p class="lesson-lead">반지름 3인 original을 함수에 넘겨 1을 더해 보겠습니다. 이번에는 <strong>일반 생성자 C / 복사 생성자 COPY / 소멸자 D</strong>를 모두 출력해 객체가 몇 개 생기는지 확인합니다.</p>
    ${trace('object',true)}
    <details class="lesson-detail"><summary>COPY를 출력하는 Circle 클래스 보기</summary>${code(circleCode)}<p><code>Circle(const Circle& other)</code>가 복사 생성자입니다. const는 원본을 이 참조를 통해 바꾸지 않겠다는 뜻입니다. 7단계에서 복사 생성과 대입을 구별합니다.</p></details>
    <p>교재의 “값 전달 때 생성자가 실행되지 않는다”는 표현은 <strong>일반 생성자 대신 복사 생성자가 호출된다</strong>고 이해해야 합니다. 자동 복사 생성자에는 우리가 작성한 출력문이 없어서 로그에 보이지 않을 수 있습니다.</p>
    <p class="class-note">여기 Circle은 int 멤버 하나라 복사본 수정이 원본에 영향을 주지 않습니다. 포인터 멤버가 같은 동적 공간을 가리키는 경우는 8단계에서 따로 확인합니다.</p>
    ${takeaway('값 매개변수 객체는 <strong>복사 생성 → 자기 멤버 변경 → 소멸</strong>합니다. 참조·포인터로 전달할 때는 원본 객체에 접근합니다.')}`},
  {id:'average',nav:'참조로 결과 받아 오기',title:'성공 여부는 return, 계산 결과는 참조로 받을 수 있어요.',refs:[s(5,23,24)],body:()=>`
    <p class="lesson-lead">평균 0은 정상적인 계산 결과일 수도 있습니다. 실패 표시도 0으로 하면 구별이 어렵습니다. 강의의 average 함수는 <strong>bool 반환값으로 성공 여부</strong>를 알리고 <strong>참조 매개변수로 평균</strong>을 저장합니다.</p>
    ${code(averageFunction)}
    <div class="average-lab"><label for="average-size">x = {0, 1, 2, 3, 4, 5}에서 전달할 size</label><select id="average-size"><option value="6">6 — 전체 계산</option><option value="1">1 — 평균이 0인 정상 계산</option><option value="0">0 — 실패</option><option value="-2">-2 — 실패</option></select><div id="average-result" aria-live="polite"></div></div>
    ${code('int avg = -99;\nif (average(x, 6, avg))\n    cout << avg << endl;\nelse\n    cout << "error" << endl;', 'x 배열을 만든 뒤의 호출 코드')}
    <p><code>sum</code>과 <code>size</code>가 둘 다 int라 <code>15 / 6</code>의 결과는 2입니다. 실패 경로에서는 avg에 대입하지 않아 이전 값이 남습니다. 따라서 <strong>true일 때만 avg를 이번 계산 결과로 사용</strong>합니다.</p>
    ${takeaway('참조 매개변수는 입력을 받는 용도뿐 아니라, <strong>호출한 쪽의 변수에 결과를 써 주는 용도</strong>로도 씁니다.')}`},
  {id:'return',nav:'참조 반환과 연속 호출',title:'참조 반환은 살아 있는 원본을 계속 사용할 수 있게 해요.',refs:[s(5,28,32),s(5,56,56,true)],body:()=>`
    ${code('int& refReturn(int& ref) {\n    return ref;\n}', 'main의 변수를 참조로 받아 그대로 참조 반환')}
    ${trace('return')}
    <h3>Circle&amp; plus()가 연속 호출되는 이유</h3>
    ${code('Circle& plus(int n) {\n    radius += n;\n    return *this;\n}\n\n// Circle a(5);\n// a.plus(1).plus(2).plus(3);', 'Circle 클래스의 public 멤버 함수')}
    <p><code>this</code>는 현재 객체의 주소이고 <code>*this</code>는 그 객체 자체입니다. 반환형이 Circle&amp;라 같은 a에 대한 참조를 돌려줍니다. 따라서 다음 plus도 같은 a에 실행됩니다.</p>
    <table class="lesson-table"><thead><tr><th>반환형</th><th>plus(1) 뒤 a</th><th>plus(2) 뒤 a</th><th>plus(3) 뒤 a</th></tr></thead><tbody><tr><td><code>Circle&</code></td><td>6</td><td>8</td><td>11</td></tr><tr><td><code>Circle</code></td><td>6</td><td>6</td><td>6</td></tr></tbody></table>
    <p>Circle을 값으로 반환하면 첫 호출만 a를 바꾸고, 뒤의 호출들은 반환된 별도 객체에 실행됩니다. 마지막 반환 객체의 radius는 11이어도 a는 6입니다.</p>
    <p class="class-note"><code>int& bad() { int x = 3; return x; }</code>처럼 함수 안의 일반 지역 변수 참조를 반환하면 안 됩니다. 함수가 끝나면 x가 사라집니다. 위 refReturn은 함수 밖 main에 살아 있는 data를 참조하므로 다릅니다.</p>
    ${takeaway('함수의 <strong>반환형</strong>과 받는 변수의 <strong>타입</strong>을 함께 보세요. <code>int copy</code>는 값 복사, <code>int& alias</code>는 별명입니다.')}`},
  {id:'constructor',nav:'복사 생성과 대입 구별',title:'새 객체가 생기는 순간인지 먼저 확인하세요.',refs:[s(5,12,14),s(5,36,40),s(5,58,60,true)],body:()=>`
    <p class="lesson-lead"><code>=</code>가 보인다고 모두 같은 동작은 아닙니다. <strong>선언과 동시에 새 객체를 만드는지</strong>, 이미 있는 객체에 대입하는지 구별해야 합니다.</p>
    ${code('Circle a(3);    // 정수 인자 생성자\nCircle b(a);    // 복사 생성자\nCircle c = a;   // 이것도 복사 생성자\nCircle d(1);    // 정수 인자 생성자\nd = a;          // 이미 있는 d에 대입\nCircle& ref = a; // 별명만 만듦')}
    <table class="lesson-table"><thead><tr><th>문장</th><th>새 Circle 객체?</th><th>복사 생성자?</th></tr></thead><tbody><tr><td><code>Circle b(a);</code></td><td>있음</td><td>호출</td></tr><tr><td><code>Circle c = a;</code></td><td>있음</td><td>호출</td></tr><tr><td><code>d = a;</code></td><td>없음</td><td>호출하지 않음 · 대입 연산</td></tr><tr><td><code>Circle& ref = a;</code></td><td>없음</td><td>호출하지 않음</td></tr></tbody></table>
    ${code('Circle(const Circle& other) {\n    radius = other.radius;\n}', 'Circle 클래스 안의 복사 생성자')}
    <p>이 코드에서 <code>radius</code>는 새로 만드는 객체의 멤버이고, <code>other.radius</code>는 원본의 멤버입니다. 같은 클래스의 멤버 함수이므로 다른 Circle 객체의 private 멤버에도 접근할 수 있습니다.</p>
    <p>강의의 <code>Circle(Circle& other)</code>도 복사 생성자입니다. 여기서는 원본을 읽기만 하도록 const를 붙였습니다. 매개변수를 <code>Circle other</code>처럼 값으로 받는 복사 생성자는 사용할 수 없습니다. 그 매개변수를 만들기 위해 또 복사가 필요해지기 때문입니다.</p>
    <p>단순한 Circle처럼 복사 가능한 멤버로 이루어진 클래스에 복사 생성자를 직접 쓰지 않으면, 컴파일러가 멤버별로 복사하는 생성자를 제공합니다. 이는 “인자 없는 기본 생성자”와 별개입니다. int 멤버는 값이 복사되고, 포인터 멤버는 주소 값이 복사됩니다.</p>
    <details class="lesson-detail"><summary>암기할 때 주의할 표현</summary><p>복사 생성자를 직접 작성했다는 사실만으로 깊은 복사가 되는 것은 아닙니다. 동적 메모리의 새 할당과 내용 복사가 있어야 합니다. 또한 복사 생성자의 수를 소멸자처럼 “무조건 하나”라고 외우지 마세요. 이번 강의의 기본 형태와 호출 시점을 먼저 구별하세요.</p><p>초기화·대입 및 const 참조 형식은 <a href="https://learn.microsoft.com/en-us/cpp/cpp/copy-constructors-and-copy-assignment-operators-cpp?view=msvc-170" target="_blank" rel="noopener noreferrer">Microsoft C++ 문서</a>에서도 확인할 수 있습니다.</p></details>
    ${takeaway('<strong>새로 만들면서 원본 사용 → 복사 생성.</strong> 이미 있는 객체에 <code>=</code> → 대입. 참조 선언 → 같은 객체의 별명.')}`},
  {id:'copy',nav:'얕은 복사·깊은 복사',title:'객체 안의 포인터가 같은 문자열을 가리키는지 보세요.',refs:[s(5,33,35),s(5,40,50)],body:()=>`
    <p class="lesson-lead">Person은 정수 id와 문자열의 주소를 가진 name을 저장합니다. <strong>Person 객체 두 개가 따로 있어도, name이 같은 동적 공간을 가리킬 수 있습니다.</strong> 이것이 얕은 복사에서 살펴볼 문제입니다.</p>
    ${trace('copy',true)}
    <p class="class-note">호출·소멸 순서를 펼친 시각화입니다. 얕은 복사에서 해제된 공간을 읽거나 두 번 해제하는 코드는 실제 실행하지 않습니다. 이런 코드가 반드시 특정 문구를 출력하거나 즉시 종료한다고 가정할 수 없습니다.</p>
    ${takeaway('얕은 복사는 <strong>주소 값까지 그대로 복사</strong>합니다. 깊은 복사는 <strong>새 공간을 만들고 그 안의 내용도 복사</strong>합니다.')}`},
  {id:'deep-code',nav:'깊은 복사 코드 읽기',title:'새 공간 할당 → 내용 복사 → 각자 해제, 이 순서예요.',refs:[s(5,41,50)],body:()=>`
    <p class="lesson-lead">강의 Person 예제의 구조를 작은 이름 변경 예제로 정리했습니다. 복사 생성자 안의 <code>new[]</code>와 <code>strcpy</code>를 먼저 찾아보세요.</p>
    ${code(personCode)}
    <div class="constructor-flow"><div><span>① 일반 멤버 복사</span><code>id = other.id;</code></div><div><span>② 사본만의 문자열 공간</span><code>new char[strlen(other.name) + 1]</code></div><div><span>③ 새 공간에 문자 복사</span><code>strcpy(name, other.name);</code></div></div>
    <p><code>strlen</code>은 끝의 널 문자 <code>'\\0'</code>를 세지 않습니다. 따라서 4글자 이름에는 5칸을 할당합니다. 소멸자에서는 <code>new char[]</code>와 짝인 <code>delete[]</code>로 각자의 공간을 정리합니다.</p>
    <p>changeName은 강의처럼 현재 문자열보다 긴 이름을 거부합니다. 예제는 길이가 같은 Mina → Jisu로 변경합니다.</p>
    <details class="lesson-detail"><summary>헤더와 main을 포함한 실행 가능한 전체 코드</summary>${code(personProgram)}<div class="simulation-output"><span>출력</span><pre>1 Mina\n1 Jisu</pre></div></details>
    <p class="class-note">이 수업 예제는 복사 <strong>생성</strong>을 연습합니다. 이미 있는 Person끼리 <code>clone = original;</code>로 대입하는 것은 별도 문제입니다. 깊은 복사 생성자를 작성해도 대입 연산이 자동으로 깊은 복사가 되는 것은 아닙니다.</p>
    ${takeaway('소유한 동적 메모리가 있으면 <strong>포인터의 주소 값 복사</strong>만으로 충분한지 확인하세요. 이 예제는 각 객체가 자기 문자열을 따로 소유해야 합니다.')}`},
  {id:'nrvo',nav:'객체 반환과 NRVO',title:'객체를 반환할 때 복사 횟수는 설정에 따라 달라질 수 있어요.',refs:[s(5,12,14),s(5,51,52)],body:()=>`
    <p class="lesson-lead"><code>Circle makeCircle()</code>은 Circle을 값으로 반환합니다. 참조 반환 <code>Circle&</code>과는 다릅니다. 다만 <strong>반환 과정의 복사 자체를 생략하는 최적화</strong>가 가능합니다.</p>
    ${code('Circle makeCircle() {\n    Circle local(5);\n    return local;\n}\n\nint main() {\n    Circle result = makeCircle();\n    cout << result.getRadius() << endl;\n}')}
    <div class="term-grid"><div><h3>NRVO 적용</h3><p>local을 결과가 놓일 위치에 직접 구성합니다. 반환을 위한 별도 복사·이동 생성이 생략됩니다.</p><pre class="return-output">C 5\n5\nD 5</pre></div><div><h3>NRVO 미적용 · C++17</h3><p>아래 전체 코드에는 이동 생성자가 없습니다. local에서 결과를 복사 생성한 뒤 local이 소멸합니다.</p><pre class="return-output">C 5\nCOPY 5\nD 5\n5\nD 5</pre></div></div>
    <p>위 출력 비교는 <strong>아래 전체 코드와 C++17 조건</strong>의 예입니다. 다른 언어 표준, 클래스 정의, 컴파일 옵션이라면 생성·소멸 로그 수가 달라질 수 있습니다. 결과 반지름은 두 경우 모두 5입니다.</p>
    <p>NRVO를 “이동 생성자가 반드시 호출된다”라고 외우면 안 됩니다. <strong>복사·이동 생략</strong>이 핵심입니다. Visual Studio에서는 강의 52쪽의 <code>/Zc:nrvo-</code>가 선택적 NRVO를 끄는 옵션입니다. 적용 여부는 옵션에 따라 달라지며, C++17의 필수 복사 생략까지 끄는 것은 아닙니다. <a href="https://learn.microsoft.com/en-us/cpp/build/reference/zc-nrvo?view=msvc-170" target="_blank" rel="noopener noreferrer">Microsoft의 옵션 설명</a></p>
    <details class="lesson-detail"><summary>비교에 사용한 전체 코드</summary>${code(nrvoProgram)}</details>
    ${takeaway('반환형은 <strong>값인지 참조인지</strong> 먼저 구별하세요. 생성자 출력 횟수 문제는 <strong>복사 생략 조건</strong>도 함께 확인합니다.')}`},
  {id:'csv',nav:'추가 실습 · CSV 읽기',title:'한 줄 읽기 → 쉼표로 분리 → 숫자 변환 순서예요.',refs:[s(5,61,66,true)],body:()=>`
    <p class="lesson-lead">교수님 추가 코드의 파일 읽기 흐름입니다. 아래는 연습용 가상 자료를 쓰는 짧은 예제로, 문자열을 읽고 숫자로 바꾸는 순서에 집중합니다.</p>
    ${code('id,name,korean,english\nS01,Mina,80,90\nS02,Jisu,70,85', 'practice.csv · 연습용 데이터')}
    <div class="constructor-flow"><div><span>① 파일에서 한 줄</span><code>getline(file, line)</code></div><div><span>② 그 줄을 읽을 스트림</span><code>stringstream row(line)</code></div><div><span>③ 쉼표까지 문자열 읽기</span><code>getline(row, korean, ',')</code></div><div><span>④ 정수로 변환</span><code>stoi(korean)</code></div></div>
    <p><code>string("80") + "90"</code>처럼 string의 연결 연산을 하면 문자열 <code>"8090"</code>입니다. 점수 합 170을 계산하려면 먼저 <code>stoi</code>로 정수로 바꿔야 합니다. id는 숫자처럼 보여도 계산할 대상이 아니면 string으로 보관할 수 있습니다.</p>
    <details class="lesson-detail"><summary>파일 읽기 전체 코드와 출력</summary>${code(csvProgram)}<div class="simulation-output"><span>출력</span><pre>S01 Mina 170\nS02 Jisu 155</pre></div></details>
    <p class="class-note">파일 경로는 프로그램의 현재 작업 폴더를 기준으로 찾습니다. 이 예제는 첫 줄에 열 이름이 있고 점수 칸에 올바른 정수가 들어 있는 단순 CSV를 가정합니다. 따옴표로 감싼 쉼표가 포함된 필드는 여기서 다루지 않습니다.</p>
    ${takeaway('<code>getline</code>은 문자열을 읽습니다. <strong>화면에서 숫자처럼 보여도 int가 된 것은 아닙니다.</strong> 계산 전에 변환하세요.')}`},
  {id:'check',nav:'이해 확인과 핵심 암기',title:'복사본인지, 별명인지, 같은 주소인지 구별해 보세요.',refs:[s(5,3,52)],body:()=>`
    <p class="lesson-lead">답을 고르면 이유가 바로 나옵니다. 헷갈린 항목은 왼쪽 설명으로 돌아가 코드의 저장 공간을 다시 따라가 보세요.</p>
    <div class="understanding-checks">${checks.map((q,i)=>`<fieldset class="class-check" data-check="${q.id}"><legend><span>${i+1}</span>${esc(q.prompt)}</legend>${q.options.map((option,j)=>`<label><input type="radio" name="reference-check-${q.id}" value="${j}"><span>${esc(option)}</span></label>`).join('')}<p class="check-result" role="status" hidden></p></fieldset>`).join('')}</div>
    <table class="lesson-table"><thead><tr><th>파트</th><th>외워 둘 한 문장</th></tr></thead><tbody><tr><td>참조</td><td>새 값 상자가 아닌 원본의 별명. 다시 연결할 수 없음.</td></tr><tr><td>함수 전달</td><td>값은 복사본, 포인터·참조는 원본에 접근.</td></tr><tr><td>참조 반환</td><td>반환 대상이 살아 있어야 하며 받는 쪽 타입도 확인.</td></tr><tr><td>복사 생성</td><td>새 객체를 기존 객체로 초기화할 때.</td></tr><tr><td>깊은 복사</td><td>새 동적 공간을 할당하고 내용도 복사.</td></tr><tr><td>NRVO</td><td>반환을 위한 복사·이동을 생략할 수 있음.</td></tr></tbody></table>
    ${takeaway('문제에서 <strong>새로 생긴 저장 공간</strong>과 <strong>기존 공간을 부르는 이름·주소</strong>를 구별하면 값 변화와 소멸 순서를 따라갈 수 있습니다.')}
    <a class="button primary" href="./">문제·핵심 암기로 돌아가기 →</a>`}
];
