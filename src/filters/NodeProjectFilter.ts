import { exists } from '@std/fs';
import { join } from '@std/path';
import { ProgramOptions } from '../cli.ts';
import type { IFilter } from './IFilter.ts';

export type NopeProjectContext = {
  isNodeProject: boolean;
};

export class NodeProjectFilter implements IFilter<NopeProjectContext> {
  async initContext(path: string): Promise<NopeProjectContext> {
    const isNodeProject = await Promise.any([
      exists(join(path, 'package.json'), { isFile: true })
        .then(() => true)
        .catch(() => false),
      exists(join(path, 'node_modules'), { isDirectory: true })
        .then(() => true)
        .catch(() => false),
    ]);
    return { isNodeProject };
  }

  isOk(options: Readonly<ProgramOptions>, { isNodeProject }: Readonly<NopeProjectContext>) {
    if (options.node && !isNodeProject) {
      return false;
    }
    if (!options.node && isNodeProject) {
      return false;
    }
    return true;
  }
}
