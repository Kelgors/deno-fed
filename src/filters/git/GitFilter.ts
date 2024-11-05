import { exists } from '@std/fs';
import { join } from '@std/path';
import { ProgramOptions } from '../../cli.ts';
import type { IFilter } from '../IFilter.ts';

export type GitContext = {
  isRepository: boolean;
};

export class GitFilter implements IFilter<GitContext> {
  async initContext(path: string): Promise<GitContext> {
    return {
      isRepository: await exists(join(path, '.git'), { isDirectory: true }),
    };
  }

  isOk(options: Readonly<ProgramOptions>, { isRepository }: Readonly<GitContext>) {
    if (options.git && !isRepository) {
      return false;
    }
    if (!options.git && isRepository) {
      return false;
    }
    return true;
  }
}
