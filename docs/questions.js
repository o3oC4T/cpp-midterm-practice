export const types = { ox: 'OX', choice: '4지선다', fill: '함수 빈칸', trace: '값 추적', debug: '오류 수정', short: '서술형' };
const ox = (id, chapter, title, correct, explanation) => ({ id, chapter, type: 'ox', title, options: ['O', 'X'], correct: correct ? 0 : 1, explanation });
export const questions = [
  ox(1, '1장', 'C++ 소스 코드를 컴파일해서 만든 목적 파일은 링킹 없이 바로 실행할 수 있다.', false, '목적 파일과 필요한 라이브러리를 연결하는 링킹 과정을 거쳐 실행 파일을 만든다.'),
  ox(2, '2장', 'using namespace std;를 작성하지 않아도 std::cout으로 출력할 수 있다.', true, 'std::cout처럼 이름 공간을 직접 지정하면 using namespace std; 없이 사용할 수 있다.'),
  ox(3, '기초 복습', '함수 안에서 int x;로 선언한 일반 지역 변수는 초기화하지 않으면 항상 0이 된다.', false, 'static이 아닌 일반 지역 int 변수는 자동으로 0이 되지 않는다. 초기화하지 않은 값을 읽어 결과를 예측해서는 안 된다.'),
  ox(4, '3장', 'class에서 접근 지정자를 생략한 멤버는 기본적으로 public이다.', false, 'class의 기본 접근 지정자는 private이다. struct의 기본 접근 지정자는 public이다.'),
  ox(5, '3장', '생성자는 반환값이 없으므로 반환형을 void로 선언해야 한다.', false, '생성자에는 void를 포함해 반환형 자체를 쓰지 않는다. 생성자 이름은 클래스 이름과 같다.'),
  ox(6, '3장', '매개변수가 있는 생성자만 직접 정의해도 컴파일러가 매개변수 없는 기본 생성자를 자동으로 추가한다.', false, '생성자를 직접 정의하면 매개변수 없는 생성자가 자동으로 추가되지 않는다. 인자 없이 생성하려면 사용 가능한 기본 생성자가 있어야 한다.'),
  ox(7, '4장', 'string 객체끼리는 + 연산자로 문자열을 연결할 수 있다.', true, 'string은 +를 이용한 연결을 지원한다. 예를 들어 string("C++") + " Study"는 "C++ Study"가 된다.'),
  ox(8, '4장', 'new로 객체 배열을 만들었다면 delete[]로 해제해야 한다.', true, 'new T[n]으로 할당한 배열은 delete[]로 해제한다. 각 원소 객체의 소멸자도 호출된다.'),
  ox(9, '4장', 'this는 멤버 함수를 호출한 객체 자신의 주소를 가리키는 포인터이다.', true, 'this는 현재 객체를 가리키는 포인터이다. *this는 그 객체 자체를 나타낸다.'),
  ox(10, '5장', '참조 매개변수로 전달받은 변수의 값을 바꾸면 원본 변수의 값도 바뀐다.', true, '참조 매개변수는 원본의 별명이다. 복사본을 바꾸는 값 전달과 달리 원본에 영향을 준다.'),
  { id: 11, chapter: '1장', type: 'choice', title: '객체 지향의 대표적인 특징에 해당하지 않는 것은?', options: ['캡슐화', '상속', '다형성', '링킹'], correct: 3, explanation: '캡슐화·상속·다형성은 객체 지향의 대표적인 특징이다. 링킹은 목적 파일 등을 연결해 실행 파일을 만드는 과정이다.' },
  { id: 12, chapter: '2장', type: 'choice', title: 'New York을 입력하고 Enter를 누르면 무엇이 출력될까?', note: '앞서 읽고 남은 입력은 없다고 가정한다.', code: 'string city;\ncin >> city;\ncout << city;', options: ['New York', 'New', 'York', '입력 오류가 발생한다.'], correct: 1, explanation: 'cin >> city는 공백 전까지 읽으므로 New만 저장한다. 공백을 포함한 한 줄은 getline(cin, city)로 읽을 수 있다.' },
  { id: 13, chapter: '4장', type: 'choice', title: '다음과 같이 할당한 메모리를 올바르게 해제하는 코드는?', code: 'int* p = new int[4];', options: ['delete p;', 'delete p[4];', 'delete[] p;', 'free(p);'], correct: 2, explanation: '배열 할당 new[]에는 배열 해제 delete[]를 사용한다. new로 할당한 메모리를 free로 해제해서는 안 된다.' },
  { id: 14, chapter: '5장', type: 'choice', title: '새로운 객체를 만들면서 복사 생성자를 호출하는 코드는?', note: 'Book 객체 a, b는 이미 생성되어 있다. 각 선택지는 독립적으로 판단한다.', options: ['Book copy = a;', 'b = a;', 'Book& ref = a;', 'Book* ptr = &a;'], correct: 0, explanation: 'Book copy = a;는 새로운 객체 copy를 a로 초기화한다. b = a;는 이미 존재하는 객체에 대한 대입이고, 참조·포인터 선언은 새 Book 객체를 복사 생성하지 않는다.' },
  { id: 15, chapter: '3장', type: 'fill', title: '사각형의 넓이가 계산되도록 생성자와 함수를 완성해 보자.', code: `class Rectangle {
    int width;
    int height;
public:
    Rectangle(int w, int h) {
        /* A */;
        /* B */;
    }
    int getArea() {
        return /* C */;
    }
};

int main() {
    Rectangle r(3, 4);
    cout << r.getArea();  // 12 출력
}`, fields: [
      { label: 'A · 너비 저장', answers: ['width = w', 'this->width = w'], mode: 'code' },
      { label: 'B · 높이 저장', answers: ['height = h', 'this->height = h'], mode: 'code' },
      { label: 'C · 반환할 식', answers: ['width * height', 'height * width', 'this->width * this->height', 'this->height * this->width'], mode: 'code' }
    ], solution: 'width = w;\nheight = h;\nreturn width * height;', explanation: '생성자가 멤버 width와 height에 전달받은 값을 저장한다. 넓이는 두 멤버의 곱이다.' },
  { id: 16, chapter: '5장', type: 'fill', title: '같은 객체에 add()를 연이어 호출할 수 있도록 완성해 보자.', code: `class Accumulator {
    int value;
public:
    Accumulator(int n) { value = n; }
    /* A */ add(int n) {
        value += n;
        return /* B */;
    }
    int get() { return value; }
};

int main() {
    Accumulator acc(5);
    acc.add(3).add(2);
    cout << acc.get();
}`, fields: [
      { label: 'A · 반환형', answers: ['Accumulator&'], mode: 'code' },
      { label: 'B · 반환할 대상', answers: ['*this', '(*this)'], mode: 'code' },
      { label: '최종 출력값', answers: ['10'] }
    ], solution: 'Accumulator& add(int n) {\n    value += n;\n    return *this;\n}\n// 출력: 10', explanation: '자기 자신을 참조로 반환하면 이어지는 add()도 같은 acc에 작용한다. 5에 3과 2를 더하므로 10이다.' },
  { id: 17, chapter: '5장', type: 'fill', title: '깊은 복사가 되도록 복사 생성자를 완성하고 출력값을 써 보자.', code: `class Data {
    int* p;
public:
    Data(int n) { p = new int(n); }
    Data(const Data& d) {
        p = /* A */;
    }
    ~Data() { delete p; }
    void set(int n) { *p = n; }
    int get() { return *p; }
};

int main() {
    Data a(10);
    Data b = a;
    b.set(20);
    cout << a.get() << " " << b.get();
}`, fields: [
      { label: 'A · 새 메모리와 초기값', answers: ['new int(*d.p)', 'new int(*(d.p))', 'new int{*d.p}'], mode: 'code' },
      { label: '출력값 · 공백으로 구분', answers: ['10 20'] }
    ], solution: 'p = new int(*d.p);\n// 출력: 10 20', explanation: '새 메모리를 할당하고 원본이 가리키는 값을 복사한다. b의 값을 바꿔도 a의 별도 메모리는 바뀌지 않는다.' },
  { id: 18, chapter: '기초·5장', type: 'trace', title: '포인터와 참조를 따라가며 a, b의 변화를 추적해 보자.', note: '각 출력 위치의 a와 b 값을 공백으로 구분해서 입력한다.', code: `int main() {
    int a = 3, b = 7;
    int* p = &a;
    int& r = b;
    printf("A: %d %d\\n", a, b);

    *p += 2;
    printf("B: %d %d\\n", a, b);

    r = a;
    printf("C: %d %d\\n", a, b);

    p = &b;
    *p += 3;
    printf("D: %d %d\\n", a, b);

    r++;
    printf("E: %d %d\\n", a, b);
}`, fields: ['3 7', '5 7', '5 5', '5 8', '5 9'].map((answer, i) => ({ label: `${'ABCDE'[i]} · a b`, answers: [answer] })), explanation: 'r은 처음부터 끝까지 b의 별명이다. r = a;는 b에 a의 값을 대입한다. p = &b; 이후 *p += 3;은 b를 바꾸며, r++ 역시 b를 증가시킨다.' },
  { id: 19, chapter: '5장', type: 'trace', title: '값 전달, 참조 전달, 주소 전달의 차이를 출력값으로 확인해 보자.', code: `void byValue(int x) {
    x += 10;
    printf("A: %d\\n", x);
}
void byReference(int& x) {
    x += 10;
    printf("C: %d\\n", x);
}
void byPointer(int* x) {
    *x += 10;
    printf("E: %d\\n", *x);
}
int main() {
    int n = 5;
    byValue(n);
    printf("B: %d\\n", n);
    byReference(n);
    printf("D: %d\\n", n);
    byPointer(&n);
    printf("F: %d\\n", n);
}`, fields: ['15', '5', '15', '15', '25', '25'].map((answer, i) => ({ label: `${'ABCDEF'[i]} · 출력값`, answers: [answer] })), explanation: '값 전달에서는 복사본 x만 15가 되므로 원본 n은 5이다. 참조 전달에서 n이 15가 되고, 주소를 전달한 함수에서 *x를 바꾸면 n이 25가 된다.' },
  { id: 20, chapter: '3장', type: 'trace', title: '생성자와 소멸자는 언제 호출될까? 전체 출력 순서를 써 보자.', code: `class Test {
    int id;
public:
    Test(int n) {
        id = n;
        cout << "생성 " << id << endl;
    }
    ~Test() {
        cout << "소멸 " << id << endl;
    }
};
int main() {
    Test a(1);
    {
        Test b(2);
        cout << "A" << endl;
    }
    cout << "B" << endl;
}`, fields: [{ label: '전체 출력 결과', multiline: true, answers: ['생성 1\n생성 2\nA\n소멸 2\nB\n소멸 1'] }], explanation: 'b는 안쪽 중괄호 블록이 끝날 때 소멸한다. a는 main()이 끝날 때 소멸한다. 따라서 소멸 2는 B보다 먼저 출력된다.' },
  { id: 21, chapter: '4장', type: 'trace', title: 'string의 복사, 연결, 길이, 부분 문자열의 결과를 써 보자.', note: 'A:, B: 같은 표시는 빼고 실제 값만 입력한다.', code: `int main() {
    string s = "C++";
    string t = s;
    s += " Study";
    t[0] = 'J';
    cout << "A: " << s << endl;
    cout << "B: " << t << endl;
    cout << "C: " << s.length() << endl;
    cout << "D: " << s.substr(4, 3) << endl;
}`, fields: ['C++ Study', 'J++', '9', 'Stu'].map((answer, i) => ({ label: `${'ABCD'[i]} · 출력값`, answers: [answer] })), explanation: 's와 t는 각각의 문자열을 가진다. 공백도 길이에 포함하므로 C++ Study의 길이는 9이다. substr(4, 3)은 인덱스 4부터 세 글자인 Stu를 반환한다.' },
  { id: 22, chapter: '3장', type: 'debug', title: '컴파일 오류의 원인을 쓰고, main()의 한 줄을 고쳐 3이 출력되게 하라.', note: '클래스 정의는 그대로 둔다. 설명과 수정 코드를 함께 작성한다.', code: `class Box {
    int value;
public:
    Box(int n) { value = n; }
    int get() { return value; }
};
int main() {
    Box b;
    cout << b.get();
}`, solution: 'Box b(3);', explanation: 'Box(int n)을 직접 정의했으므로 매개변수 없는 기본 생성자가 자동으로 추가되지 않는다. Box b; 대신 Box b(3);으로 생성하면 3을 출력한다.' },
  { id: 23, chapter: '5장', type: 'debug', title: '반환된 참조에는 어떤 문제가 있을까? 정수 10을 안전하게 반환하도록 수정하라.', code: 'int& makeNumber() {\n    int n = 10;\n    return n;\n}', solution: 'int makeNumber() {\n    int n = 10;\n    return n;\n}', explanation: '일반 지역 변수 n은 함수가 끝나면 수명이 끝난다. 그 변수에 대한 참조를 반환하면 유효하지 않은 대상을 참조하게 된다. 반환형을 int로 바꾸어 값을 반환한다.' },
  { id: 24, chapter: '3장', type: 'short', title: '클래스와 객체의 차이를 설명하라.', note: 'Rectangle과 Rectangle r(3, 4);를 예로 들어도 된다.', explanation: '클래스는 데이터와 기능을 정의한 자료형이고, 객체는 그 클래스로 생성한 실제 대상이다. Rectangle이 클래스이며 Rectangle r(3, 4);로 생성한 r이 객체이다.' },
  { id: 25, chapter: '5장', type: 'short', title: '동적 메모리를 소유하는 포인터 멤버가 있을 때, 얕은 복사의 문제와 깊은 복사의 해결 방법을 설명하라.', explanation: '얕은 복사는 주소만 복사하여 두 객체가 같은 메모리를 공유하게 한다. 한 객체가 해제하면 다른 객체의 포인터는 유효하지 않게 되며 같은 메모리를 중복 해제할 수도 있다. 깊은 복사는 별도 메모리를 할당하고 내용까지 복사하여 각 객체가 자기 메모리를 사용하게 한다.' }
];
