import test from 'node:test';
import assert from 'node:assert/strict';
import { branchError, titleError } from '../scripts/check-git-rules';

test('작업과 출시 PR 경로를 구분한다', () => {
  assert.equal(branchError('setting/#34-gitRules', 'develop'), undefined);
  assert.equal(branchError('develop', 'main'), undefined);
  assert.ok(branchError('wsysangyoung2730-debug-official-coverage-expansion', 'develop'));
  assert.ok(branchError('feat/#34-gitRules', 'main'));
  assert.ok(branchError('feat/#34-gitRules', 'other'));
});
test('커밋과 PR 제목 규칙을 검사한다', () => {
  assert.equal(titleError('[setting] Git 규칙 검사를 추가하라'), undefined);
  assert.ok(titleError('[Feat] 규칙 추가'));
  assert.ok(titleError('[feat] Add rules'));
  assert.ok(titleError('[feat] ' + '가'.repeat(44)));
  assert.ok(titleError('규칙 추가'));
});
