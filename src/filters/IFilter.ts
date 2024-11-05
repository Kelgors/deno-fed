import { ProgramOptions } from '../cli.ts';
import { FilterContext } from './FilterContext.ts';

export interface IFilter<T> {
  initContext(path: string, context: Readonly<Partial<FilterContext>>): Promise<T> | T;
  isOk(options: Readonly<ProgramOptions>, context: Readonly<Partial<FilterContext>>): Promise<boolean> | boolean;
}
