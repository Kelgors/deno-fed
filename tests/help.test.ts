import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { assertSnapshot } from '@std/testing/snapshot';
import { fed } from './utils/exec.ts';

describe('help', () => {
  it('should display the cli usage', async (t) => {
    const { stdout, exitCode } = await fed(['--help']);
    expect(exitCode).toBe(0);
    assertSnapshot(t, stdout);
  });
});
