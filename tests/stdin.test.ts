import { expect } from '@std/expect';
import { ensureDir, EOL } from '@std/fs';
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { fed } from './utils/exec.ts';

beforeAll(async () => {
  await ensureDir('tmp/stdin/d1');
  await ensureDir('tmp/stdin/d2');
  await ensureDir('tmp/stdin/d3');
});

afterAll(async () => {
  await Deno.remove('tmp/stdin', { recursive: true });
});

describe('stdin', () => {
  it('should list only what is provided in stdin', async () => {
    const { exitCode, stdout } = await fed([], {
      cwd: 'tmp/stdin',
      stdin: ['d1', 'd3'].join(EOL),
    });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d1', 'd3']);
  });
});
