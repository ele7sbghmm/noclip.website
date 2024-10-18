import { const_char_p } from '../type_aliases.js';

export type tName = string;

export class tEntity {
  private name: tName;

  constructor() { }
  public SetName(n: const_char_p) {
    this.name = n;
  }
}

