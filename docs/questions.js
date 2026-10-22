import { source as s } from './sources.js';
export const types = { ox: 'OX', choice: '4지선다', fill: '함수 빈칸', trace: '값 추적', debug: '오류 수정', short: '서술형' };
const ox = (id, source, title, correct, explanation) => ({ id, chapter: `${source.chapter}장`, source, type: 'ox', title, options: ['O', 'X'], correct: correct ? 0 : 1, explanation });
const outputs = values => values.map((answer, i) => ({ label: `${'ABCDE'[i]} · 출력값`, answers: [answer] }));
export const questions = [
  ox(1, s(1,18,21), 'C++ 소스 코드를 컴파일해서 만든 목적 파일은 링킹 없이 바로 실행할 수 있다.', false, '목적 파일(.obj)과 필요한 라이브러리를 링크하여 실행 파일(.exe)을 만든다. 컴파일과 링크의 역할을 구별한다.'),
  ox(2, s(2,5), '#include <iostream>은 컴파일에 앞선 전처리 과정에서 처리된다.', true, '#include는 전처리 지시문이다. 전처리기는 해당 헤더의 내용을 포함시켜 컴파일할 소스를 준비한다.'),
  ox(3, s(2,10,13), 'using std::cout;만 선언하면 std::endl도 이름 공간 표시 없이 endl로 사용할 수 있다.', false, 'using std::cout;은 cout 이름만 가져온다. endl은 std::endl로 쓰거나 using std::endl;을 따로 선언해야 한다. using namespace std;와 구별한다.'),
  ox(4, s(3,26,28), '매개변수가 있는 생성자만 직접 정의해도 컴파일러가 매개변수 없는 기본 생성자를 자동으로 추가한다.', false, '생성자를 직접 선언하면 컴파일러가 기본 생성자를 자동으로 추가하지 않는다. Circle(int)만 있는 클래스에서 Circle c;는 사용할 수 없다.'),
  ox(5, s(3,23,25), '위임 생성자는 위임 대상 생성자의 실행을 마친 뒤 자기 본문을 실행한다.', true, 'Point() : Point(1, 2) { ... }에서는 Point(int, int)가 객체를 초기화한 다음 Point()의 본문을 실행한다. 초기화 목록에서 위임하는 것과 본문에서 별도 임시 객체를 만드는 것은 다르다.'),
  ox(6, s(3,43,46), '일반적인 헤더·cpp 구성에서 클래스 선언 안에 본문까지 정의한 멤버 함수는 암시적으로 inline 함수이다.', true, '클래스 안에서 본문까지 작성한 멤버 함수는 암시적으로 inline이다. 실제 호출 코드를 그 자리에 펼쳐 넣을지는 컴파일러가 판단하므로 항상 인라인 확장된다는 뜻은 아니다.'),
  ox(7, s(4,23,24), 'new Circle[3]은 원소마다 생성자를 호출하고, delete[]는 원소들의 소멸자를 생성의 역순으로 호출한다.', true, '배열의 0, 1, 2번 원소가 차례로 생성되고 delete[]에서는 2, 1, 0번 원소가 차례로 소멸한다. 인자 없이 원소를 만들 수 있는 생성자가 필요하다.'),
  ox(8, s(4,17,23), 'delete p;를 실행하면 p에 저장된 주소도 자동으로 nullptr로 바뀐다.', false, 'delete는 대상 메모리를 해제하지만 포인터 변수의 값을 자동으로 바꾸지 않는다. 해제한 대상을 다시 사용하거나 중복 해제하면 안 된다. 필요하면 해제 후 p = nullptr;로 직접 바꾼다.'),
  ox(9, s(5,6,9), '기존 객체를 값 매개변수로 전달할 때 일반 생성자의 출력이 없으면, 매개변수 객체는 생성되지 않은 것이다.', false, '값 매개변수 객체는 기존 객체를 복사 생성하여 만든다. 일반 생성자 Circle()·Circle(int)가 호출되지 않는 것과 객체가 생성되지 않는 것은 다르다. 암시적 복사 생성자는 직접 작성한 출력문이 없어 조용히 실행되고, 매개변수는 함수 호출이 끝나며 소멸한다.'),
  ox(10, s(5,34,47), '동적 배열을 가리키는 포인터 멤버를 얕은 복사하면 원본과 복사본이 같은 배열을 가리킨다.', true, '주소만 복사되므로 같은 메모리를 공유한다. 각 객체의 소멸자가 그 배열을 해제하면 중복 해제가 생길 수 있다. 깊은 복사에서는 별도 메모리를 할당하고 내용을 복사한다.'),
  { id: 11, chapter: '1장', source: s(1,23), type: 'choice', title: '강의에서 구분한 C++ 표준 라이브러리의 세 범주에 해당하지 않는 것은?', options: ['C 라이브러리', 'C++ 입출력 라이브러리', 'STL', 'C++ 컴파일러'], correct: 3, explanation: '강의에서는 C 라이브러리, C++ 입출력 라이브러리, STL로 구분한다. 컴파일러는 소스 코드를 번역하는 개발 도구이다.' },
  { id: 12, chapter: '2장', source: s(2,26,27), type: 'choice', title: 'Hi C++#Go를 입력하면 무엇이 출력될까?', note: '앞서 읽고 남은 입력은 없다. #도 실제 입력 문자이다.', code: 'char text[12];\ncin.getline(text, 12, \'#\');\ncout << text;', options: ['Hi', 'Hi C++', 'Hi C++#', 'Hi C++#Go'], correct: 1, explanation: 'cin.getline은 공백을 포함해 구분자 # 앞까지 읽고 널 문자를 붙인다. #는 입력에서 제거하지만 배열에 저장하지 않는다. Go는 아직 입력 버퍼에 남는다.' },
  { id: 13, chapter: '4장 · 추가 실습', source: s(4,44,45,true), type: 'choice', title: 'CSV 파일에 출력하기 위한 파일 스트림 객체 선언은?', note: '<fstream>과 필요한 이름 공간 선언이 있다고 가정한다.', options: ['ifstream file("result.csv");', 'string file("result.csv");', 'ofstream file("result.csv");', 'stringstream file("result.csv");'], correct: 2, explanation: 'ofstream은 파일 출력 스트림이다. ifstream은 파일 입력, stringstream은 메모리의 문자열을 대상으로 하는 스트림이다. 파일 열기 성공을 확인한 뒤 <<로 쉼표와 줄바꿈을 기록한다.' },
  { id: 14, chapter: '5장', source: s(5,28,30), type: 'choice', title: '참조를 반환하는 함수 호출을 대입문의 왼쪽에 쓰면 어떤 결과가 나올까?', code: `char& at(char text[], int index) {
    return text[index];
}
int main() {
    char word[] = "abc";
    at(word, 1) = 'X';
    cout << word;
}`, options: ['abc', 'Xbc', 'aXc', '참조 반환 함수는 대입문의 왼쪽에 쓸 수 없다.'], correct: 2, explanation: 'at(word, 1)은 살아 있는 word[1]의 참조를 반환한다. 반환된 참조에 X를 대입하므로 word[1]이 바뀐다.' },
  { id: 15, chapter: '3장', source: s(3,23,25), type: 'fill', title: '위임 생성자와 멤버 초기화 목록을 완성하라.', note: 'A는 다른 생성자에 위임하고, B는 x와 y를 각각 a와 b로 초기화한다.', code: `class Point {
    int x, y;
public:
    Point() : /* A */ { }
    Point(int a, int b) : /* B */ { }
    void show() { cout << x << " " << y; }
};
int main() {
    Point p;
    p.show(); // 1 2 출력
}`, fields: [
      { label: 'A · 위임 대상 생성자', answers: ['Point(1, 2)', 'Point{1, 2}'], mode: 'code' },
      { label: 'B · 멤버 초기화 목록', answers: ['x(a), y(b)', 'x{a}, y{b}'], mode: 'code' }
    ], solution: 'Point() : Point(1, 2) { }\nPoint(int a, int b) : x(a), y(b) { }', explanation: 'Point()가 Point(1, 2)에 초기화를 맡긴다. 위임 대상 생성자의 초기화 목록에서 x와 y가 각각 1과 2로 초기화된다.' },
  { id: 16, chapter: '5장', source: s(5,23,24), type: 'fill', title: '성공 여부는 반환값으로, 평균은 참조 매개변수로 전달하라.', code: `bool average(int a[], int size, /* A */ result) {
    if (size <= 0) return false;
    int sum = 0;
    for (int i = 0; i < size; i++) sum += a[i];
    result = sum / size;
    return /* B */;
}
int main() {
    int scores[] = {3, 6, 9};
    int mean = 0;
    bool ok = average(scores, 3, mean);
    cout << ok << " " << mean;
}`, fields: [
      { label: 'A · 매개변수 타입', answers: ['int&'], mode: 'code' },
      { label: 'B · 성공을 뜻하는 값', answers: ['true', '1'], mode: 'code' },
      { label: '출력값', answers: ['1 6'] }
    ], solution: '// A: int&\n// B: true\n// 출력: 1 6', explanation: 'result가 mean의 별명이므로 평균 6을 원본에 저장한다. cout은 별도 형식 설정이 없으면 true를 1로 출력한다. 성공 여부를 따로 반환하면 평균 0과 계산 실패를 구별할 수 있다.' },
  { id: 17, chapter: '5장', source: s(5,41,50), type: 'fill', title: '문자 배열을 소유하는 객체의 깊은 복사를 완성하라.', note: '<cstring>이 포함되어 있다. 모든 이름은 비어 있지 않은 영문 문자열이다.', code: `class Person {
    char* name;
public:
    Person(const char* text) {
        name = new char[strlen(text) + 1];
        strcpy(name, text);
    }
    Person(const Person& other) {
        name = new char[/* A */];
        /* B */;
    }
    ~Person() { delete[] name; }
    void setFirst(char c) { name[0] = c; }
    const char* getName() { return name; }
};
int main() {
    Person a("Mina");
    Person b = a;
    b.setFirst('R');
    cout << a.getName() << " " << b.getName();
}`, fields: [
      { label: 'A · 널 문자까지 포함한 크기', answers: ['strlen(other.name) + 1', '1 + strlen(other.name)'], mode: 'code' },
      { label: 'B · 내용 복사 함수 호출', answers: ['strcpy(name, other.name)', 'strcpy(this->name, other.name)'], mode: 'code' },
      { label: '출력값', answers: ['Mina Rina'] }
    ], solution: 'name = new char[strlen(other.name) + 1];\nstrcpy(name, other.name);\n// 출력: Mina Rina', explanation: 'strlen은 널 문자를 제외하므로 한 칸을 더 할당한다. 서로 다른 배열을 소유하게 되어 b의 이름을 수정해도 a의 이름은 그대로이다. 이 예제의 복사 생성과 이미 존재하는 객체에 대한 대입은 별개의 동작이다.' },
  { id: 18, chapter: '5장', source: s(5,17,19), type: 'trace', title: '참조의 대입과 포인터의 대상 변경을 구별하여 추적하라.', note: 'A: 등의 표시는 빼고 a와 b를 공백으로 구분해 입력한다.', code: `int main() {
    int a = 2, b = 9;
    int& alias = a;
    int* p = &b;
    cout << "A: " << a << " " << b << endl;
    alias = b;
    cout << "B: " << a << " " << b << endl;
    *p = 4;
    cout << "C: " << a << " " << b << endl;
    alias += 2;
    cout << "D: " << a << " " << b << endl;
    p = &alias;
    *p += 1;
    cout << "E: " << a << " " << b << endl;
}`, fields: outputs(['2 9', '9 9', '9 4', '11 4', '12 4']), explanation: 'alias는 끝까지 a의 별명이다. alias = b는 a에 9를 대입한다. 처음 p는 b를 바꾸지만, p = &alias 이후에는 a를 가리키므로 a가 12가 된다.' },
  { id: 19, chapter: '5장', source: s(5,6,9), type: 'trace', title: '객체를 값으로 전달할 때의 생성·소멸과 출력 순서를 써라.', note: '복사 생성자는 직접 정의하지 않았다. C, A, D, B 표시도 포함해 전체 출력을 입력한다.', code: `class Circle {
    int radius;
public:
    Circle(int r) : radius(r) { cout << "C " << radius << endl; }
    ~Circle() { cout << "D " << radius << endl; }
    int get() { return radius; }
    void grow() { radius += 2; }
};
void increase(Circle c) {
    c.grow();
    cout << "A " << c.get() << endl;
}
int main() {
    Circle original(4);
    increase(original);
    cout << "B " << original.get() << endl;
}`, fields: [{ label: '전체 출력 결과', multiline: true, answers: ['C 4\nA 6\nD 6\nB 4\nD 4'] }], explanation: 'original은 일반 생성자로 만들어 C 4를 출력한다. c는 암시적 복사 생성자로 만들어져 추가 C 출력이 없다. c만 6으로 바뀌고 함수 호출이 끝나며 D 6을 출력한다. 원본은 4이며 main 끝에서 D 4가 출력된다.' },
  { id: 20, chapter: '3장', source: s(3,34,36), type: 'trace', title: '전역 객체와 지역 객체의 생성·소멸 순서를 써라.', code: `class Probe {
    int id;
public:
    Probe(int n) : id(n) { cout << "C " << id << endl; }
    ~Probe() { cout << "D " << id << endl; }
};
Probe global(9);
void work() {
    Probe local(2);
    cout << "A" << endl;
}
int main() {
    Probe first(1);
    work();
    cout << "B" << endl;
}`, fields: [{ label: '전체 출력 결과', multiline: true, answers: ['C 9\nC 1\nC 2\nA\nD 2\nB\nD 1\nD 9'] }], explanation: '전역 객체 global이 먼저 생성된다. main의 first, work의 local이 차례로 생성되고 local은 work가 끝날 때 소멸한다. main 끝에서 first가 소멸하고 프로그램 종료 과정에서 global이 소멸한다.' },
  { id: 21, chapter: '5장 · 추가 실습', source: s(5,62,66,true), type: 'trace', title: 'CSV 한 줄을 나눠 읽고, 문자열과 정수 계산을 비교하라.', note: '<sstream>과 <string>이 포함되어 있다. A: 등의 표시는 제외한다.', code: `int main() {
    string line = "Rin,12,8";
    stringstream row(line);
    string name, first, second;
    getline(row, name, ',');
    getline(row, first, ',');
    getline(row, second, ',');
    int a = stoi(first), b = stoi(second);
    cout << "A: " << name << endl;
    cout << "B: " << first + second << endl;
    cout << "C: " << a + b << endl;
    cout << "D: " << (a + b) / 2 << endl;
}`, fields: outputs(['Rin', '128', '20', '10']), explanation: '쉼표를 구분자로 필드를 읽는다. string의 +는 연결이므로 12와 8을 붙인 128이다. stoi로 변환한 int끼리는 덧셈과 정수 나눗셈을 하므로 20과 10이다. 마지막 필드는 끝의 쉼표가 없어도 문자열 끝까지 읽는다.' },
  { id: 22, chapter: '4장', source: s(4,17,20), type: 'debug', title: '잘못된 해제의 원인을 쓰고 마지막 줄을 수정하라.', code: 'int* base = new int[3];\nint* p = base;\np++;\ndelete[] p;', solution: 'delete[] base;', explanation: 'p++ 이후 p는 배열의 첫 주소가 아니라 두 번째 원소를 가리킨다. delete[]에는 new[]가 돌려준 시작 포인터를 전달해야 한다. 여기서는 그대로 보관한 base를 사용한다. delete p로 바꾸는 것도 올바른 수정이 아니다.' },
  { id: 23, chapter: '5장', source: s(5,28,30), type: 'debug', title: '반환된 참조의 문제를 설명하고 정수 10을 안전하게 반환하도록 수정하라.', code: 'int& makeNumber() {\n    int n = 10;\n    return n;\n}', solution: 'int makeNumber() {\n    int n = 10;\n    return n;\n}', explanation: '일반 지역 변수 n의 수명은 함수가 끝나면 종료된다. 그 참조를 반환하면 더 이상 살아 있지 않은 대상을 참조한다. 반환형을 int로 바꾸어 값으로 반환한다.' },
  { id: 24, chapter: '3장', source: s(3,50,56), type: 'short', title: '클래스를 헤더와 cpp로 나누는 이유와 헤더 중복 포함 방지 방법을 설명하라.', note: 'Box.h, Box.cpp를 예로 들고, 전처리 지시문 세 가지를 적어 보자.', solution: '#ifndef BOX_H\n#define BOX_H\nclass Box {\n    // 멤버 선언\n};\n#endif', explanation: '클래스 선언을 Box.h에, 멤버 함수 구현을 Box.cpp에 두면 다른 소스 파일에서 헤더를 포함해 클래스를 사용하기 쉽다. 같은 번역 단위에 헤더 내용이 반복되어 클래스가 중복 정의되는 일을 막기 위해 #ifndef, #define, #endif로 포함 가드를 만든다. 강의에 나온 #pragma once도 대안이다.' },
  { id: 25, chapter: '5장', source: s(5,51,52), type: 'short', title: '이름 있는 지역 객체를 값으로 반환할 때 복사 생성자 출력이 생략될 수 있는 이유는?', note: 'NRVO의 의미와, 지역 변수의 참조를 반환하는 경우와의 차이를 설명한다. 생성자 호출 횟수를 하나로 단정하지 않는다.', code: 'Item makeItem() {\n    Item result;\n    return result;\n}\n// Item item = makeItem();', explanation: 'NRVO는 이름 있는 지역 객체를 반환할 때 복사·이동 생성을 생략할 수 있는 최적화이다. 반환받을 객체의 저장 공간에 직접 생성할 수 있어 복사 생성자 출력이 없을 수 있으며, 적용 여부는 코드와 컴파일러 설정에 따라 달라진다. 이동 생성자가 반드시 호출된다는 뜻이 아니다. 값 반환은 결과 객체를 만들지만, 일반 지역 변수의 참조 반환은 수명이 끝난 대상을 참조하는 문제를 만든다. Visual Studio의 /Zc:nrvo-는 선택적인 NRVO를 끄는 옵션이며, 언어 규칙상 필수인 복사 생략까지 끄지는 않는다.' }
];
