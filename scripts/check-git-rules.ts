import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const tags = 'init|feat|fix|docs|setting|add|refactor|chore';
export function titleError(title: string): string | undefined {
  if (!new RegExp(`^\\[(${tags})\\] .+`).test(title)) return '허용된 소문자 태그가 필요합니다.';
  if ([...title].length > 50) return '제목은 50자 이하여야 합니다.';
  if (!/[가-힣]/.test(title)) return '작업 내용은 한글로 작성해야 합니다.';
}
export function branchError(head: string, base: string): string | undefined {
  if (base === 'main') return head === 'develop' ? undefined : '출시는 develop → main PR로 진행합니다.';
  if (base !== 'develop') return '작업 PR 대상은 develop이어야 합니다.';
  if (!new RegExp(`^(${tags})/#[1-9][0-9]*-[A-Za-z0-9][A-Za-z0-9_-]*$`).test(head))
    return '작업 브랜치는 태그/#이슈번호-작업범위 형식이어야 합니다.';
}
function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error('GitHub pull_request 이벤트가 필요합니다.');
  const { pull_request: pr } = JSON.parse(readFileSync(eventPath, 'utf8'));
  if (!pr) throw new Error('pull_request 이벤트가 필요합니다.');
  const errors = [branchError(pr.head.ref, pr.base.ref), titleError(pr.title)].filter(Boolean);
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', pr.base.sha, pr.head.sha]);
  } catch {
    errors.push('PR 전에 최신 대상 브랜치를 작업 브랜치에 병합해야 합니다.');
  }
  const subjects = execFileSync('git', ['log', '--no-merges', '--format=%s', `${pr.base.sha}..${pr.head.sha}`], { encoding: 'utf8' }).trim();
  for (const title of subjects ? subjects.split('\n') : []) {
    const error = titleError(title);
    if (error) errors.push(`${title}: ${error}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('브랜치·PR 대상·제목·커밋·최신 기준 브랜치 검사 통과');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
