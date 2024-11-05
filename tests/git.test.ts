import { expect } from '@std/expect';
import { copy, ensureDir } from '@std/fs';
import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import fs from 'node:fs/promises';
import { runCommand } from '../src/lib.ts';
import { fed } from './utils/exec.ts';

beforeAll(async () => {
  await ensureDir('tmp/git');
  await ensureDir('tmp/git/not-repo-dir');
  await Deno.writeFile('tmp/git/not-repo-file', new Uint8Array());

  await runCommand('git', ['clone', 'https://github.com/Kelgors/gemweb', 'repo-diff'], {
    cwd: 'tmp/git',
    rejects: true,
  });
  await copy('tmp/git/repo-diff', 'tmp/git/repo-unpushed');
  await copy('tmp/git/repo-diff', 'tmp/git/repo-stashes');
  await copy('tmp/git/repo-diff', 'tmp/git/repo-detached');
  await copy('tmp/git/repo-diff', 'tmp/git/repo-feature');

  await Deno.writeFile('tmp/git/repo-diff/README.md', new Uint8Array([1]));

  await Deno.writeFile('tmp/git/repo-unpushed/README.md', new Uint8Array([1]));
  await runCommand('git', ['add', 'README.md'], { cwd: 'tmp/git/repo-unpushed', rejects: true });
  await runCommand('git', ['commit', '-m', 'update readme'], { cwd: 'tmp/git/repo-unpushed', rejects: true });

  await fs.writeFile('tmp/git/repo-stashes/README.md', '1');
  await runCommand('git', ['stash', 'push', '-m', 'encours'], { cwd: 'tmp/git/repo-stashes', rejects: true });

  await runCommand('git', ['checkout', '1.0.0'], { cwd: 'tmp/git/repo-detached', rejects: true });

  await runCommand('git', ['switch', '-c', 'new_branch'], { cwd: 'tmp/git/repo-feature', rejects: true });
});

afterAll(async () => {
  await Deno.remove('tmp/git', { recursive: true });
});

describe('--git', () => {
  it('should only list git repositories', async () => {
    const { stdout, exitCode } = await fed(['--git'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-detached',
      'repo-diff',
      'repo-feature',
      'repo-stashes',
      'repo-unpushed',
    ]);
  });

  it('should not list any git repositories', async () => {
    const { stdout, exitCode } = await fed(['--no-git'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['not-repo-dir']);
  });
});

describe('--diff', () => {
  it('should only list git repositories with diff', async () => {
    const { stdout, exitCode } = await fed(['--diff'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-diff',
    ]);
  });

  it('should not list git repositories with diff', async () => {
    const { stdout, exitCode } = await fed(['--no-diff'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-detached',
      'repo-feature',
      'repo-stashes',
      'repo-unpushed',
    ]);
  });
});

describe('--unpushed', () => {
  it('should only list git repositories with unpushed commits', async () => {
    const { stdout, exitCode } = await fed(['--unpushed'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-unpushed',
    ]);
  });

  it('should not list git repositories with unpushed commits', async () => {
    const { stdout, exitCode } = await fed(['--no-unpushed'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-detached',
      'repo-diff',
      'repo-feature',
      'repo-stashes',
    ]);
  });
});

describe('--stashes', () => {
  it('should only list git repositories with stashes', async () => {
    const { stdout, exitCode } = await fed(['--stashes'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-stashes',
    ]);
  });

  it('should not list git repositories with stashes', async () => {
    const { stdout, exitCode } = await fed(['--no-stashes'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-detached',
      'repo-diff',
      'repo-feature',
      'repo-unpushed',
    ]);
  });
});

describe('--detached', () => {
  it('should only list git repositories with detached branch', async () => {
    const { stdout, exitCode } = await fed(['--detached'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-detached',
    ]);
  });

  it('should not list git repositories with detached branch', async () => {
    const { stdout, exitCode } = await fed(['--no-detached'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-diff',
      'repo-feature',
      'repo-stashes',
      'repo-unpushed',
    ]);
  });
});

describe('--include-branch', () => {
  it('should list repositories matching branches', async () => {
    const { stdout, exitCode } = await fed(['--include-branch', 'new_branch'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-feature',
    ]);
  });

  it('should list repositories not matching branches', async () => {
    const { stdout, exitCode } = await fed(['--exclude-branch', 'new_branch'], { cwd: 'tmp/git' });
    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      'repo-detached',
      'repo-diff',
      'repo-stashes',
      'repo-unpushed',
    ]);
  });
});
