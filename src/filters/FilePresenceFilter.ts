import { exists } from '@std/fs';
import { join } from '@std/path';
import { ProgramOptions } from '../cli.ts';
import type { IFilter } from './IFilter.ts';

export type FilePresenceContext = {
  path: string;
};

export class FilePresenceFilter implements IFilter<FilePresenceContext> {
  initContext(path: string): FilePresenceContext {
    return { path };
  }

  async isOk(options: Readonly<ProgramOptions>, { path }: Readonly<FilePresenceContext>) {
    for (const file of options.withFile) {
      const isAbsent = await exists(join(path, file)).then((r) => !r);
      if (isAbsent) return false;
    }
    for (const file of options.withoutFile) {
      const isPresent = await exists(join(path, file));
      if (isPresent) return false;
    }
    return true;
  }
}
