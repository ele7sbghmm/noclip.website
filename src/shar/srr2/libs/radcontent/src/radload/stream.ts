import { unsigned_int } from '../../../../../type_aliases.js';

export abstract class radLoadDataStream {
  public m_endianSwap: boolean;

  public abstract Read(data: any, count: unsigned_int, dataSize: radLoadDataStream.Enum): boolean;
  public abstract GetSize(): unsigned_int;
  public abstract GetPosition(): unsigned_int;
  public GetEndianSwap(): boolean { return this.m_endianSwap; }
  public SetEndianSwap(swap: boolean): boolean {
    let orig: boolean = this.m_endianSwap;
    this.m_endianSwap = swap;
    return orig;
  }
}
export namespace radLoadDataStream {
  export enum Enum { BYTE = 1, WORD = 2, DWORD = 4, QWORD = 8 };
}

