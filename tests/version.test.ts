import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { fed } from './utils/exec.ts';

describe('version', () => {
  it('should display the version', async () => {
    const { stdout, exitCode } = await fed(['--version']);
    expect(exitCode).toBe(0);
    expect(typeof stdout[0]).toBe('string');
  });
});
