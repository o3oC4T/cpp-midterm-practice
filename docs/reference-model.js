// State transitions for fixed teaching examples; this is not a C++ interpreter.
const step = (code, note, event = () => {}) => ({ code, note, event });
const cell = (name, value, scope = 'main') => ({ name, value, scope, aliases: [] });
const get = (s, name) => s.cells.find(c => c.name === name || c.aliases.includes(name));
const set = (s, name, value) => { get(s, name).value = value; };
const output = (s, ...names) => { s.output += names.map(n => get(s, n).value).join(' ') + '\n'; };
export const modes = { value: '값 전달', pointer: '주소 전달', reference: '참조 전달' };
export const circleCode = `class Circle {
    int radius;
public:
    Circle(int r) {
        radius = r;
        cout << "C " << radius << endl;
    }
    Circle(const Circle& other) {
        radius = other.radius;
        cout << "COPY " << radius << endl;
    }
    ~Circle() { cout << "D " << radius << endl; }
    int getRadius() { return radius; }
    void setRadius(int r) { radius = r; }
};`;
export function swapFunction(mode) {
  const type = mode === 'pointer' ? 'int*' : mode === 'reference' ? 'int&' : 'int';
  const a = mode === 'pointer' ? '*a' : 'a', b = mode === 'pointer' ? '*b' : 'b';
  return `void swapNumbers(${type} a, ${type} b) {\n    int tmp = ${a};\n    ${a} = ${b};\n    ${b} = tmp;\n}`;
}
export function increaseFunction(mode) {
  const type = mode === 'pointer' ? 'Circle*' : mode === 'reference' ? 'Circle&' : 'Circle';
  const dot = mode === 'pointer' ? '->' : '.';
  return `void increase(${type} c) {\n    c${dot}setRadius(c${dot}getRadius() + 1);\n}`;
}
export function stepsFor(kind, mode = 'reference') {
  if (kind === 'alias') return [
    step('int n = 2, i = 9;', 'n과 i는 서로 다른 정수 변수입니다.', s => { s.cells = [cell('n', 2), cell('i', 9)]; }),
    step('int& ref = n;', 'ref는 n의 별명입니다. 정수 저장 공간을 하나 더 만드는 것이 아닙니다.', s => { get(s, 'n').aliases.push('ref'); }),
    step('ref = i;', '참조 대상을 i로 바꾸는 문장이 아닙니다. i의 값 9를 n에 대입합니다.', s => set(s, 'ref', get(s, 'i').value)),
    step('ref++;', 'ref는 여전히 n의 별명입니다. n만 10으로 증가하고 i는 9입니다.', s => set(s, 'ref', get(s, 'ref').value + 1)),
    step('int* p = &ref;', '&ref는 n의 주소입니다. p도 같은 n을 가리킵니다.', s => { s.pointers = [{ name: 'p', target: 'n' }]; }),
    step('*p = 20;', 'p가 가리키는 n을 바꿉니다. ref로 읽어도 같은 20입니다.', s => set(s, 'n', 20)),
    step('cout << n << " " << ref << " " << i << endl;', '별명 ref와 원래 이름 n으로 읽는 값은 항상 같습니다.', s => output(s, 'n', 'ref', 'i'))
  ];
  if (kind === 'swap') {
    const pointer = mode === 'pointer', value = mode === 'value';
    const a = pointer ? '*a' : 'a', b = pointer ? '*b' : 'b';
    const an = value ? 'a' : 'm', bn = value ? 'b' : 'n';
    return [
      step('int m = 2, n = 9;', 'main의 m과 n을 먼저 만듭니다.', s => { s.cells = [cell('m', 2), cell('n', 9)]; }),
      step(`swapNumbers(${pointer ? '&m, &n' : 'm, n'});`, value ? '함수에 진입합니다. a와 b에 값만 복사하여 별도 변수를 만듭니다.' : pointer ? '함수에 진입합니다. a와 b는 각각 m과 n의 주소를 받은 포인터입니다.' : '함수에 진입합니다. a는 m, b는 n의 별명입니다.', s => {
        if (value) s.cells.push(cell('a', 2, 'swapNumbers'), cell('b', 9, 'swapNumbers'));
        else if (pointer) s.pointers = [{ name: 'a', target: 'm' }, { name: 'b', target: 'n' }];
        else { get(s, 'm').aliases.push('a'); get(s, 'n').aliases.push('b'); }
      }),
      step(`    int tmp = ${a};`, '처음 값 2를 tmp에 보관해야 나중에 되살릴 수 있습니다.', s => s.cells.push(cell('tmp', get(s, an).value, 'swapNumbers'))),
      step(`    ${a} = ${b};`, value ? '복사본 a에 9를 넣습니다. main의 m은 2 그대로입니다.' : '원본 m에 n의 값 9를 넣습니다. 이 순간 m과 n이 모두 9입니다.', s => set(s, an, get(s, bn).value)),
      step(`    ${b} = tmp;`, value ? '복사본 b에 2를 넣습니다. 함수 안에서만 교환했습니다.' : '원본 n에 보관해 둔 2를 넣어 교환을 마칩니다.', s => set(s, bn, get(s, 'tmp').value)),
      step('} // swapNumbers에서 main으로 복귀', '함수의 매개변수와 tmp의 수명이 끝납니다. main의 두 변수는 남습니다.', s => { s.cells = s.cells.filter(c => c.scope === 'main'); s.cells.forEach(c => { c.aliases = []; }); s.pointers = []; }),
      step('cout << m << " " << n << endl;', value ? '값 전달은 복사본만 바꿨으므로 2 9입니다.' : '원본을 바꿨으므로 9 2입니다.', s => output(s, 'm', 'n'))
    ];
  }
  if (kind === 'object') {
    const value = mode === 'value', pointer = mode === 'pointer';
    const dot = pointer ? '->' : '.';
    return [
      step('Circle original(3);', '정수 인자를 받는 생성자가 original을 만듭니다. C는 일반 생성자, COPY는 복사 생성자, D는 소멸자의 출력입니다.', s => { s.cells = [cell('original.radius', 3)]; s.output = 'C 3\n'; }),
      step(`increase(${pointer ? '&original' : 'original'});`, value ? 'original로 매개변수 객체 c를 복사 생성합니다. COPY 3이 출력되고 두 객체가 따로 존재합니다.' : '원본에 접근할 경로만 받습니다. 매개변수용 Circle 객체를 복사 생성하지 않습니다.', s => {
        if (value) { s.cells.push(cell('c.radius', 3, 'increase')); s.output += 'COPY 3\n'; }
        else if (pointer) s.pointers = [{ name: 'c', target: 'original' }];
        else get(s, 'original.radius').aliases.push('c.radius');
      }),
      step(`    c${dot}setRadius(c${dot}getRadius() + 1);`, value ? 'c의 반지름만 4입니다. original의 반지름은 3입니다.' : '원본 객체의 반지름이 4가 됩니다.', s => set(s, value ? 'c.radius' : 'original.radius', 4)),
      step('} // increase에서 main으로 복귀', value ? '매개변수 객체 c의 소멸자가 D 4를 출력합니다. original은 살아 있습니다.' : '참조나 포인터 매개변수의 수명이 끝나도 original은 소멸하지 않습니다.', s => {
        if (value) s.output += 'D 4\n';
        s.cells = s.cells.filter(c => c.scope === 'main'); s.cells.forEach(c => { c.aliases = []; }); s.pointers = [];
      }),
      step('cout << original.getRadius() << endl;', value ? '원본은 3 그대로입니다.' : '원본이 4로 바뀌었습니다.', s => output(s, 'original.radius')),
      step('} // main 종료', '마지막으로 original의 소멸자가 호출됩니다.', s => { s.output += `D ${get(s, 'original.radius').value}\n`; s.cells = []; s.ended = true; })
    ];
  }
  if (kind === 'return') return [
    step('int data = 3;', 'main에 있는 data는 함수 호출이 끝난 뒤에도 살아 있습니다.', s => { s.cells = [cell('data', 3)]; }),
    step('int copy = refReturn(data);', '함수가 참조를 반환해도 받는 쪽이 int이면 현재 값 3을 별도 변수에 복사합니다.', s => s.cells.push(cell('copy', get(s, 'data').value))),
    step('int& alias = refReturn(data);', '이번에는 int&로 받았습니다. alias는 data의 별명입니다.', s => { get(s, 'data').aliases.push('alias'); }),
    step('refReturn(data) = 5;', '반환된 참조가 가리키는 data에 5를 저장합니다. copy는 3 그대로입니다.', s => set(s, 'data', 5)),
    step('alias = 7;', 'alias를 통한 대입도 같은 data를 바꿉니다.', s => set(s, 'alias', 7)),
    step('cout << data << " " << copy << " " << alias << endl;', 'data와 alias는 7, 별도로 복사한 copy는 3입니다.', s => output(s, 'data', 'copy', 'alias'))
  ];
  if (kind === 'copy') return [
    step('Person original(1, "Mina");', 'original 객체의 name 포인터와, 그 포인터가 가리키는 문자열 공간 H1은 별개입니다. H1/H2는 실제 주소가 아닌 학습용 표시입니다.', s => { s.owners = [{ name: 'original', block: 'H1', alive: true }]; s.heap = [{ id: 'H1', value: 'Mina', alive: true }]; }),
    step('Person clone(original);', mode === 'shallow' ? '두 객체는 별개지만 name의 주소 값이 복사되어 같은 H1을 가리킵니다.' : 'H2를 새로 할당하고 문자열 내용까지 복사합니다. 각 객체가 다른 공간을 가집니다.', s => {
      if (mode === 'deep') s.heap.push({ id: 'H2', value: 'Mina', alive: true });
      s.owners.push({ name: 'clone', block: mode === 'deep' ? 'H2' : 'H1', alive: true });
    }),
    step('clone.changeName("Jisu");', mode === 'shallow' ? '공유한 H1의 문자열이 바뀌어 original로 읽어도 Jisu입니다.' : 'clone의 H2만 바뀝니다. original의 H1에는 Mina가 남습니다.', s => { s.heap.find(b => b.id === s.owners[1].block).value = 'Jisu'; }),
    step('original.show(); clone.show();', 'id는 정수 멤버이므로 각각 1을 저장합니다. 차이는 name이 가리키는 문자열 공간입니다.', s => { s.output = s.owners.map(o => `1 ${s.heap.find(b => b.id === o.block).value}\n`).join(''); }),
    step('~Person() // 블록 종료: clone부터 소멸', mode === 'shallow' ? 'clone이 H1을 해제합니다. original.name은 이제 해제된 공간을 가리키던 값입니다.' : 'clone이 자기 H2만 해제합니다. original의 H1은 살아 있습니다.', s => { const o = s.owners[1]; s.heap.find(b => b.id === o.block).alive = false; o.alive = false; }),
    step('~Person() // 다음은 original 소멸', mode === 'shallow' ? '여기서 같은 H1을 다시 delete[]하면 정의되지 않은 동작입니다. 시각화는 두 번째 해제 직전에 멈춥니다. 정해진 출력이나 종료 결과를 예측할 수 없습니다.' : 'original이 H1을 해제합니다. 각각 한 번씩 정리되어 정상적으로 끝납니다.', s => {
      if (mode === 'shallow') s.blocked = true;
      else { s.heap[0].alive = false; s.owners[0].alive = false; s.ended = true; }
    })
  ];
  throw new Error('Unknown lesson trace');
}
export function snapshotAt(kind, mode, count) {
  const state = { cells: [], pointers: [], owners: [], heap: [], output: '', ended: false, blocked: false };
  const steps = stepsFor(kind, mode);
  const limit = Number.isInteger(count) ? Math.max(0, Math.min(count, steps.length)) : 0;
  for (const item of steps.slice(0, limit)) item.event(state);
  return state;
}
export const averageFunction = `bool average(int a[], int size, int& avg) {
    if (size <= 0) return false;
    int sum = 0;
    for (int i = 0; i < size; i++) sum += a[i];
    avg = sum / size;
    return true;
}`;
export function averageResult(size) {
  const values = [0, 1, 2, 3, 4, 5];
  if (!Number.isInteger(size) || size > values.length) throw new RangeError('Invalid example size');
  return size <= 0 ? { ok: false, avg: -99, sum: null } : { ok: true, avg: Math.trunc(values.slice(0, size).reduce((a, b) => a + b, 0) / size), sum: values.slice(0, size).reduce((a, b) => a + b, 0) };
}
export const personCode = `class Person {
    char* name;
    int id;
public:
    Person(int number, const char* text) {
        id = number;
        name = new char[strlen(text) + 1];
        strcpy(name, text);
    }
    Person(const Person& other) {
        id = other.id;
        name = new char[strlen(other.name) + 1];
        strcpy(name, other.name);
    }
    void changeName(const char* text) {
        if (strlen(text) > strlen(name)) return;
        strcpy(name, text);
    }
    void show() { cout << id << " " << name << endl; }
    ~Person() { delete[] name; }
};`;
export const personProgram = `#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <cstring>
using namespace std;
${personCode}
int main() {
    Person original(1, "Mina");
    Person clone(original);
    clone.changeName("Jisu");
    original.show();
    clone.show();
}`;
export function programFor(kind, mode = 'reference') {
  const intro = '#include <iostream>\nusing namespace std;\n';
  if (kind === 'copy') return personProgram;
  if (kind === 'swap') return `${intro}${swapFunction(mode)}\nint main() {\n    int m = 2, n = 9;\n    swapNumbers(${mode === 'pointer' ? '&m, &n' : 'm, n'});\n    cout << m << " " << n << endl;\n}`;
  if (kind === 'object') return `${intro}${circleCode}\n${increaseFunction(mode)}\nint main() {\n    Circle original(3);\n    increase(${mode === 'pointer' ? '&original' : 'original'});\n    cout << original.getRadius() << endl;\n}`;
  const functionCode = kind === 'return' ? 'int& refReturn(int& ref) { return ref; }\n' : '';
  return `${intro}${functionCode}int main() {\n${stepsFor(kind).map(s => '    ' + s.code).join('\n')}\n}`;
}
export const nrvoProgram = `#include <iostream>
using namespace std;
${circleCode}
Circle makeCircle() {
    Circle local(5);
    return local;
}
int main() {
    Circle result = makeCircle();
    cout << result.getRadius() << endl;
}`;
export const csvProgram = `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
using namespace std;
int main() {
    ifstream file("practice.csv");
    if (!file.is_open()) {
        cout << "open failed" << endl;
        return 1;
    }
    string line;
    getline(file, line); // 첫 줄의 열 이름 건너뛰기
    while (getline(file, line)) {
        stringstream row(line);
        string id, name, korean, english;
        if (getline(row, id, ',') && getline(row, name, ',') &&
            getline(row, korean, ',') && getline(row, english, ',')) {
            int total = stoi(korean) + stoi(english);
            cout << id << " " << name << " " << total << endl;
        }
    }
    file.close();
}`;
