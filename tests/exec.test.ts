import { expect } from '@std/expect';
import { ensureDir, exists } from '@std/fs';
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { fed } from './utils/exec.ts';

beforeAll(async () => {
  await ensureDir('tmp/exec/d1');
  await ensureDir('tmp/exec/d2');
});

afterAll(async () => {
  await Deno.remove('tmp/exec', { recursive: true });
});

describe('--exec', () => {
  it('should list directories name by default', async () => {
    const { exitCode, stdout } = await fed([], { cwd: 'tmp/exec' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d1', 'd2']);
  });

  it('should create a file in each directory', async () => {
    const { exitCode } = await fed(['--exec', 'touch f0'], { cwd: 'tmp/exec' });
    expect(exitCode).toBe(0);
    await expect(exists('tmp/exec/d1/f0', { isFile: true })).resolves.toBe(true);
    await expect(exists('tmp/exec/d2/f0', { isFile: true })).resolves.toBe(true);
  });

  it('should exit when a command failed', async () => {
    const { exitCode } = await fed(['--exec', 'exit 1'], { cwd: 'tmp/exec' });
    expect(exitCode).toBe(1);
  });
});

describe('--ignore-failures', () => {
  it('should continue even if a command failed', async () => {
    const { exitCode } = await fed(['--ignore-failures', '--exec', 'exit 1'], { cwd: 'tmp/exec' });
    expect(exitCode).toBe(0);
  });
});
