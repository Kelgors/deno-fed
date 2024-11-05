import { basename } from '@std/path';
import { ProgramOptions } from '../cli.ts';
import type { IFilter } from './IFilter.ts';

export type MatchRegexContext = {
  dirname: string;
};

export class MatchRegexFilter implements IFilter<MatchRegexContext> {
  initContext(path: string): MatchRegexContext {
    return { dirname: basename(path) };
  }

  isOk(options: Readonly<ProgramOptions>, { dirname }: Readonly<MatchRegexContext>) {
    return new RegExp(options.match || '').test(dirname);
  }
}
