import { const_char_p } from '../../../../type_aliases.js';
import { tRefCounted } from './refcounted.js';

export class tName { }
export class tEntity extends tRefCounted {
  public name: tName;

  public SetName(n: const_char_p) { this.name = n } // name.SetText(n)
}

