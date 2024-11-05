import { expect } from '@std/expect';
import { ensureDir } from '@std/fs';
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { fed } from './utils/exec.ts';

beforeAll(async () => {
  await ensureDir(`tmp/verbose/d1`);
  await ensureDir(`tmp/verbose/d2`);
  await ensureDir(`tmp/verbose/d3`);
});

afterAll(async () => {
  await Deno.remove('tmp/verbose', { recursive: true });
});

describe('verbose', () => {
  it('should log the name of the directory between each execution', async () => {
    const { exitCode, stdout } = await fed(['--exec', 'exit 0', '--verbose'], {
      cwd: 'tmp/verbose',
    });
    expect(stdout).toEqual(['[DIR] d1', '[DIR] d2', '[DIR] d3']);
    expect(exitCode).toBe(0);
  });
});
