import { expect } from '@std/expect';
import { copy, ensureDir } from '@std/fs';
import { join } from '@std/path';
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { runCommand } from '../src/lib.ts';
import { fed } from './utils/exec.ts';

beforeAll(async () => {
  await ensureDir(`tmp/template`);

  await runCommand('git', ['clone', 'https://github.com/Kelgors/gemweb', 'repo'], {
    cwd: 'tmp/template',
  });
  await copy('tmp/template/repo', 'tmp/template/repo-branch');
  await copy('tmp/template/repo', 'tmp/template/repo-tag');

  await runCommand('git', ['checkout', 'fix/missing-title-id'], { cwd: 'tmp/template/repo-branch' });
  await runCommand('git', ['checkout', '1.0.0'], { cwd: 'tmp/template/repo-tag' });

  await Deno.writeFile('tmp/template/repo-branch/README.md', new Uint8Array([1]));
});

afterAll(async () => {
  await Deno.remove('tmp/template', { recursive: true });
});

describe('echo {}', () => {
  it('should display the list of directory name', async () => {
    const { exitCode, stdout } = await fed(['--exec', 'echo {}'], { cwd: 'tmp/template' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['repo', 'repo-branch', 'repo-tag']);
  });
});

describe('echo {path}', () => {
  it('should display the list of paths', async () => {
    const { exitCode, stdout } = await fed(['--exec', 'echo {path}'], { cwd: 'tmp/template' });
    expect(exitCode).toBe(0);
    const cwd = Deno.cwd();
    expect(stdout).toEqual(['repo', 'repo-branch', 'repo-tag'].map((d) => join(cwd, `tmp/template/${d}`)));
  });
});

describe('echo {branch}', () => {
  it('should display the list of paths', async () => {
    const { exitCode, stdout } = await fed(['--git', '--exec', 'echo {branch}'], { cwd: 'tmp/template' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['main', 'fix/missing-title-id', 'HEAD']);
  });
});

describe('echo {branch}', () => {
  it('should display the list of paths', async () => {
    const { exitCode, stdout } = await fed(['--git', '--exec', 'echo {branch}'], { cwd: 'tmp/template' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['main', 'fix/missing-title-id', 'HEAD']);
  });
});

describe('echo {diff}', () => {
  it('should display the list of changed files', async () => {
    const { exitCode, stdout } = await fed(['--diff', '--exec', 'echo {diff}'], { cwd: 'tmp/template' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['README.md']);
  });
});
