export const lectureDocuments = {
  1: { title: 'C++의 시작', pages: 25 },
  2: { title: 'C++ 프로그래밍의 기본', pages: 40 },
  3: { title: '클래스와 객체', pages: 57 },
  4: { title: '객체 포인터와 객체 배열 · 객체의 동적 생성', pages: 45 },
  5: { title: '함수의 참조 · 복사 생성자', pages: 66 }
};
export const source = (chapter, first, last = first, extra = false) => ({ chapter, first, last, extra });
export function sourceLabel(ref) {
  if (!ref) return '기초 보충 · Chap. 0 강의자료 확인 전';
  return `교수님 강의 · ${ref.chapter}장 ${ref.first}${ref.last === ref.first ? '' : `–${ref.last}`}쪽${ref.extra ? ' · 추가 실습' : ''}`;
}
