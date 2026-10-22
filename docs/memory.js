export const chapters = [
  { id: 'basics', label: 'C 기초 복습', subtitle: '변수 · 자료형 · 배열 · 포인터', note: 'Chap. 0 별도 자료가 없어 C언어 기초 복습으로 구성했습니다.' },
  { id: 'ch1', label: '1장 · C++ 시작', subtitle: '개발 과정 · 객체 지향의 특징' },
  { id: 'ch2', label: '2장 · 입출력', subtitle: '이름 공간 · 문자열 입력' },
  { id: 'ch3', label: '3장 · 클래스', subtitle: '생성자 · 소멸자 · 접근 지정자' },
  { id: 'ch4', label: '4장 · 객체 활용', subtitle: '동적 메모리 · this · string' },
  { id: 'ch5', label: '5장 · 참조와 복사', subtitle: '인자 전달 · 참조 반환 · 깊은 복사' }
];
const card = (id, chapter, title, prompt, answer, hook, code) => ({ id, chapter, title, prompt, answer, hook, code });
export const cards = [
  card('b1','basics','초기화와 대입','일반 지역 변수 int x;의 초기값은 항상 0일까?','아니다. static이 아닌 일반 지역 변수는 초기값을 지정하지 않으면 0으로 보장되지 않는다. 값을 읽기 전에 초기화해야 한다.','지역 변수는 직접 초기화.','int x = 0;\nx = 7; // 이미 존재하는 변수에 대입'),
  card('b2','basics','값 · 문자 · 문자열','1.4, 18, \'c\', "1.4", c는 각각 무엇일까?','1.4는 double 실수 리터럴, 18은 int 정수 리터럴, \'c\'는 C++의 char 문자 리터럴, "1.4"는 끝의 널 문자를 포함하는 문자열 리터럴이다. 따옴표 없는 c는 식별자이며 타입과 값은 선언에 달려 있다.','작은따옴표는 문자, 큰따옴표는 문자열.','sizeof("1.4") // 4: 1, ., 4, \\0\n// 여러 문자를 작은따옴표로 감싼 값은 일반 문자처럼 판단하지 않는다.'),
  card('b3','basics','sizeof와 바이트','자료형의 바이트 수는 모든 C++ 환경에서 같을까?','아니다. 자료형 크기는 구현에 따라 달라질 수 있다. sizeof(char)는 항상 1이며, Windows Visual Studio에서 흔히 int 4, float 4, double 8바이트를 사용한다. x64 환경에서는 포인터가 보통 8바이트이다.','자료형과 리터럴을 구별하고, 실행 환경도 확인.','cout << sizeof(int);\ncout << sizeof(double);\ncout << sizeof(int*);'),
  card('b4','basics','주소와 역참조','&x와 *p는 각각 무엇을 의미할까?','&x는 변수 x의 주소이다. 포인터 p가 x를 가리킬 때 *p는 x의 값을 읽거나 바꾸는 데 사용한다. p 자체의 값을 바꾸면 가리키는 대상이 달라진다.','&는 주소, *는 가리킨 대상.','int x = 3;\nint* p = &x;\n*p = 8; // x도 8'),
  card('b5','basics','배열과 C 문자열','char name[10]에 영문 문자열은 최대 몇 글자 저장할까?','널 종료 문자인 \\0의 공간 한 칸이 필요하므로 최대 9글자이다. 배열 인덱스는 0부터 시작한다. 한글처럼 여러 바이트를 쓰는 문자를 단순히 같은 글자 수로 계산하면 안 된다.','문자열 공간 = 내용 + 널 문자 1칸.','char text[] = "C++";\n// C, +, +, \\0 → 배열 크기 4'),
  card('c1','ch1','프로그램 개발 과정','소스 파일은 어떤 과정을 거쳐 실행 파일이 될까?','소스 코드를 컴파일해 목적 코드를 만들고, 목적 파일과 필요한 라이브러리를 링크해 실행 파일을 만든다. 오류를 찾아 수정하는 작업은 디버깅이다.','소스 → 컴파일 → 목적 → 링크 → 실행.'),
  card('c2','ch1','클래스와 객체','클래스와 객체의 차이를 한 문장으로 말하면?','클래스는 데이터와 기능을 정의한 자료형이고, 객체는 그 클래스로 실제 생성한 대상이다. 객체는 인스턴스라고도 부른다.','클래스는 설계, 객체는 실제 대상.','Rectangle r(3, 4);\n// Rectangle: 클래스 / r: 객체'),
  card('c3','ch1','객체 지향의 특징','객체 지향의 대표적인 특징 세 가지는?','캡슐화, 상속, 다형성이다. 캡슐화는 데이터와 기능을 묶고 접근을 제어하는 개념이다. 1~5장에서는 상속·다형성의 상세 구현보다 기본 개념을 구별해 둔다.','캡슐화 · 상속 · 다형성.'),
  card('c4','ch1','C++와 C','C++ 프로그램은 반드시 모든 함수를 클래스 안에 만들어야 할까?','아니다. C++는 객체 지향 프로그래밍을 지원하면서 C 스타일의 일반 함수와 절차적인 작성 방식도 지원한다. main()도 일반적인 클래스 밖 함수이다.','C++는 클래스 밖 함수도 가능.'),
  card('i1','ch2','입출력의 기본','cout, cin의 헤더와 연산자는 무엇일까?','입출력에는 <iostream>을 사용한다. cout은 <<로 출력하고, cin은 >>로 입력받는다.','cout << 출력 / cin >> 입력.','#include <iostream>\nstd::cout << 10;\nstd::cin >> x;'),
  card('i2','ch2','이름 공간 std','using namespace std; 없이 cout을 사용하려면?','std::cout처럼 이름 공간을 직접 붙인다. namespace는 이름 충돌을 줄이기 위해 이름을 구분하는 데 사용한다.','이름을 직접 지정할 때 std::.','std::cout << "Hello";'),
  card('i3','ch2','공백 포함 입력','cin >> s와 getline(cin, s)의 차이는?','cin >> s는 공백으로 구분된 한 단어를 읽는다. getline(cin, s)는 공백을 포함한 한 줄을 string에 읽는다.','단어는 >>, 한 줄은 getline.','string s;\ngetline(cin, s);'),
  card('i4','ch2','입력 버퍼의 개행','cin >> n; 직후 getline(cin, s);가 빈 줄을 읽는 흔한 이유는?','숫자를 입력한 뒤의 개행 문자가 입력 버퍼에 남아 있기 때문이다. getline 전에 남은 개행을 적절히 처리한다. cin.ignore() 한 번으로 처리하는 예는 다음 문자가 바로 개행인 경우에 해당한다.','>>는 개행을 남길 수 있다.','cin >> n;\ncin.ignore(); // 다음 문자가 개행인 상황\ngetline(cin, s);'),
  card('i5','ch2','문자 배열과 string 입력','char 배열과 string에 한 줄을 읽는 함수 형태는?','char 배열은 cin.getline(배열, 크기), string은 getline(cin, 문자열객체)를 사용한다. 서로 함수 형태가 다르다.','배열: cin.getline / string: getline(cin, …).','char a[30];\ncin.getline(a, 30);\nstring b;\ngetline(cin, b);'),
  card('o1','ch3','접근 지정자','class와 struct에서 생략된 접근 지정자는?','class는 private, struct는 public이다. 외부에서 private 멤버에 직접 접근할 수 없다.','class는 private / struct는 public.'),
  card('o2','ch3','생성자의 규칙','생성자의 이름, 반환형, 호출 시점을 말해 보자.','이름은 클래스 이름과 같고 반환형은 쓰지 않는다. 객체를 생성할 때 자동으로 호출되어 객체를 초기화한다. 매개변수가 다른 생성자를 여러 개 정의할 수 있다.','이름은 클래스명, 반환형은 없음, 생성 시 호출.','Circle(int r) { radius = r; }'),
  card('o3','ch3','기본 생성자','생성자를 하나 직접 만들었는데 Circle c;가 왜 안 될 수 있을까?','사용자가 생성자를 정의하면 컴파일러가 매개변수 없는 생성자를 자동으로 추가하지 않는다. Circle(int)만 있다면 인자 없이 Circle c;를 만들 수 없다.','직접 생성자를 만들면 기본 생성자를 자동으로 더해 주지 않는다.'),
  card('o4','ch3','소멸자의 규칙','소멸자의 이름과 매개변수, 반환형은?','클래스 이름 앞에 ~를 붙인다. 매개변수와 반환형이 없으며, 이 수업 범위에서는 클래스당 하나만 정의한다. 객체가 소멸할 때 호출된다.','~클래스명(), 매개변수 없음, 반환형 없음.','~Circle() { }'),
  card('o5','ch3','지역 객체의 수명','블록 안의 일반 지역 객체는 언제 소멸할까?','그 객체가 속한 블록을 벗어날 때 소멸한다. 같은 블록에서 차례로 만들어진 일반 지역 객체는 생성된 순서의 역순으로 소멸한다.','블록이 끝나면 소멸, 생성의 역순.','{\n    A first;\n    A second;\n} // second 소멸 → first 소멸'),
  card('o6','ch3','클래스 밖 멤버 정의','클래스 밖에서 멤버 함수를 정의할 때 무엇을 붙일까?','반환형 다음에 클래스이름::함수이름을 사용한다. 클래스 선언부는 헤더 파일에, 멤버 함수 구현은 cpp 파일에 나눌 수 있다.','어느 클래스의 함수인지 ::로 표시.','int Rectangle::getArea() {\n    return width * height;\n}'),
  card('d1','ch4','객체와 객체 포인터','객체와 객체 포인터의 멤버 접근 연산자는?','객체에는 .을, 객체를 가리키는 포인터에는 ->를 사용한다. p->get()은 (*p).get()과 같다.','객체는 점, 포인터는 화살표.','obj.get();\np->get();\n(*p).get();'),
  card('d2','ch4','동적 할당과 해제','new와 new[]의 올바른 해제 짝은?','단일 객체는 new와 delete, 배열은 new[]와 delete[]를 짝지어 사용한다. 동적 객체를 해제할 때 소멸자도 호출된다.','하나: delete / 배열: delete[].','int* p = new int(7);\ndelete p;\nint* a = new int[3];\ndelete[] a;'),
  card('d3','ch4','객체 배열','new Circle[3]은 어떤 생성자를 필요로 할까?','각 원소를 인자 없이 생성할 수 있는 기본 생성자가 필요하다. 각 원소마다 생성자가 호출되고, delete[]에서는 원소들의 소멸자가 역순으로 호출된다.','배열 원소마다 생성 · 소멸.'),
  card('d4','ch4','this와 *this','this와 *this를 구별하면?','this는 현재 객체의 주소인 포인터이고, *this는 현재 객체 자체이다. 멤버 이름과 매개변수 이름이 같을 때 this->멤버로 구별할 수 있다.','this는 주소, *this는 객체.','Box(int value) {\n    this->value = value;\n}'),
  card('d5','ch4','string의 기본','문자열 연결, 길이, 첫 문자 접근은 어떻게 할까?','+ 또는 +=로 연결하고, length()로 길이를 얻는다. 인덱스는 0부터 시작하므로 s[0]이 첫 문자이다. 예제의 영문 문자열에서는 공백도 길이에 포함된다.','연결 + / 길이 length() / 첫 문자 [0].','string s = "Hello";\ns += "!";\n// s.length(): 6 / s[0]: \'H\''),
  card('d6','ch4','부분 문자열','s.substr(시작, 개수)는 무엇을 반환할까?','시작 인덱스부터 지정한 개수만큼의 부분 문자열을 반환한다. 두 번째 인자는 끝 인덱스가 아니라 문자 개수이다.','substr의 두 번째 값은 개수.','string s = "C++ Study";\ns.substr(4, 3); // "Stu"'),
  card('r1','ch5','세 가지 인자 전달','값 전달, 주소 전달, 참조 전달에서 원본이 달라지는 경우는?','값 전달은 복사본을 전달한다. 주소 전달은 포인터가 가리키는 대상을 수정하면 원본이 바뀐다. 참조 전달은 원본의 별명을 통해 수정한다.','값은 복사본, 주소·참조는 원본에 접근 가능.','void f(int x);\nvoid g(int* x);\nvoid h(int& x);'),
  card('r2','ch5','참조는 별명','int& r = a; 이후 r = b;를 실행하면 r이 b를 가리키게 될까?','아니다. r은 계속 a의 별명이며 a에 b의 값을 대입한다. 참조는 선언할 때 대상을 정하고, 이후 대입으로 대상을 바꾸지 않는다.','참조 대입은 대상 변경이 아니라 값 대입.'),
  card('r3','ch5','참조 반환','지역 변수의 참조를 반환하면 왜 위험할까?','일반 지역 변수는 함수가 종료되면 수명이 끝나므로 반환된 참조가 유효한 대상을 가리키지 못한다. 값으로 반환하거나, 호출 이후에도 살아 있는 객체를 참조해야 한다.','반환한 참조의 대상이 계속 살아 있어야 한다.'),
  card('r4','ch5','연속 호출과 *this','acc.add(3).add(2);를 같은 객체에 적용하려면?','add의 반환형을 클래스의 참조형으로 하고 return *this;로 자기 자신을 반환한다. 값으로 반환하면 뒤의 호출이 복사된 객체에 작용할 수 있다.','반환형은 클래스&, 반환값은 *this.','Accumulator& add(int n) {\n    value += n;\n    return *this;\n}'),
  card('r5','ch5','복사 생성과 대입','Book b = a;와 b = a;의 차이는?','Book b = a;는 새로운 객체를 기존 객체로 초기화하므로 복사 생성이다. 이미 생성된 b에 b = a;를 실행하는 것은 대입이다. 기존 객체를 값 매개변수로 전달할 때도 복사 생성이 일어난다.','새로 만들며 복사 = 복사 생성 / 이미 있으면 대입.','Book(const Book& other); // 복사 생성자'),
  card('r6','ch5','얕은 복사와 깊은 복사','포인터 멤버의 주소만 복사하면 어떤 문제가 생길까?','동적 메모리를 소유하는 두 객체가 같은 메모리를 공유해 해제 후 접근이나 중복 해제가 발생할 수 있다. 깊은 복사는 새 메모리를 할당하고 내용까지 복사한다.','주소만 복사하지 말고, 별도 메모리와 내용을 만든다.','Data(const Data& d) {\n    p = new int(*d.p);\n}')
];
export const MEMORY_KEY = 'cpp-midterm-memory:v1';
export function restoreMemory(raw) {
  const base = { chapter: 'basics', mode: 'summary', index: 0, known: [] };
  try {
    const obj = JSON.parse(raw);
    if (chapters.some(c => c.id === obj?.chapter)) base.chapter = obj.chapter;
    if (obj?.mode === 'cards') base.mode = 'cards';
    const length = cards.filter(c => c.chapter === base.chapter).length;
    if (Number.isInteger(obj?.index) && obj.index >= 0 && obj.index < length) base.index = obj.index;
    base.known = [...new Set(Array.isArray(obj?.known) ? obj.known : [])].filter(id => cards.some(c => c.id === id));
  } catch { /* Fall back to a fresh study session. */ }
  return base;
}
