import { expect } from '@std/expect';
import { ensureDir } from '@std/fs';
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { fed } from './utils/exec.ts';

beforeAll(async () => {
  await ensureDir('tmp/file/d1/d2');
  await ensureDir('tmp/file/d3');

  await Deno.writeFile('tmp/file/d1/f1', new Uint8Array([1]));
  await Deno.writeFile('tmp/file/d3/f2', new Uint8Array([1]));
});

afterAll(async () => {
  await Deno.remove('tmp/file', { recursive: true });
});

describe('--with-file', () => {
  it('should display the folder with the directory d2', async () => {
    const { stdout, exitCode } = await fed(['--with-file', 'd2'], { cwd: 'tmp/file' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d1']);
  });

  it('should display the folder with the file f1', async () => {
    const { stdout, exitCode } = await fed(['--with-file', 'f1'], { cwd: 'tmp/file' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d1']);
  });

  it('should display the folder with the file f2', async () => {
    const { stdout, exitCode } = await fed(['--with-file', 'f2'], { cwd: 'tmp/file' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d3']);
  });
});

describe('--without-file', () => {
  it('should not display the folder with the directory d2', async () => {
    const { stdout, exitCode } = await fed(['--without-file', 'd2'], { cwd: 'tmp/file' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d3']);
  });

  it('should not display the folder with the file f1', async () => {
    const { stdout, exitCode } = await fed(['--without-file', 'f1'], { cwd: 'tmp/file' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d3']);
  });

  it('should not display the folder with the file f2', async () => {
    const { stdout, exitCode } = await fed(['--without-file', 'f2'], { cwd: 'tmp/file' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['d1']);
  });
});
