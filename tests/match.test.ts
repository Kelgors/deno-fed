import { expect } from '@std/expect';
import { ensureDir } from '@std/fs';
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { fed } from './utils/exec.ts';

beforeAll(async () => {
  await ensureDir(`tmp/match/a1`);
  await ensureDir(`tmp/match/b2`);
  await ensureDir(`tmp/match/c3`);
});

afterAll(async () => {
  await Deno.remove('tmp/match', { recursive: true });
});

describe('match', () => {
  it('should list only what match the regex', async () => {
    const { exitCode, stdout } = await fed(['--match', '^a'], { cwd: 'tmp/match' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['a1']);
  });
});
