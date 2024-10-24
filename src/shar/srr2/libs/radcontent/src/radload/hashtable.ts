import { unsigned_int } from '../../../../../type_aliases.js';

// type tUidUnaligned = unsigned_int;
// type radKey = tUidUnaligned;
type radKey = number | string;

export class PtrHashTable { // extends radLoadObject {
  // public m_hashTable: PtrHashTable;
  // public m_elements: any[];
  // public m_keys: radKey[];
  public _hash_table: Record<radKey, any>;

  public Store(key: radKey, obj: any) { }
}
export class HashTable<V> extends PtrHashTable {
  public Find(key: radKey): V { return this._hash_table[key]; }
  public override Store(key: radKey, obj: V) { this._hash_table[key] = obj; }
}
export class RefHashTable<V> extends HashTable<V> { }

