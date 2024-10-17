type unsigned = number;
type tLoadStatus = {};
type tChunkFile = {};
type tEntityStore = {};
type tEntity = {};

class tSimpleChunkHandler { // extends tChunkHandler {
  protected status: tLoadStatus;

  constructor(
    protected id: unsigned,
    protected m_NameOverride: string = '',
  ) { };

  public Load(file: tChunkFile, store: tEntityStore): tLoadStatus { return {}; }
  public CheckChunkID(id: unsigned): boolean { return false; }
  public GetChunkID(): unsigned { return this.id; }
  public SetNameOverride(Name: string) { this.m_NameOverride = Name; return 0; }

  protected HandleCollision(t_entity: tEntity) { return null; }
  protected LoadObject(file: tChunkFile, store: tEntityStore): tEntity { return {}; };

};
