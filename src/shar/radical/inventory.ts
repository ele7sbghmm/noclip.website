import { char_p, } from '../type_aliases.js';
import { tUID } from './util.js';
import { tEntity } from './entity.js';

class radLoadHashedStore { }
class tEntityStore extends radLoadHashedStore {
  public Store(entity: tEntity) { }
  public Store(id: radKey, obj: IRefCount) { }
  public StoreHandlingCollisions(entity: tEntity) { }
  public StoreHandlingCollisions(id: radKey, obj: IRefCount) { }
};

const P3D_MAX_INVENTORY_SECTIONS: int = 256;
const P3D_MAX_SECTION_PATH_SECTIONS: int = 8;
const P3D_MAX_CURRENT_SECTIONS: int = 16;
const P3D_DEFAULT_INV_SECTION: char_p = "default";

export class tInventory extends tEntityStore {
  public Find(c: radLoadInventory.SafeCastBase, uid: tUID): IRefCount { }

  public TestCollision(obj: tEntity): boolean { }
  public Remove(obj: IRefCount) { }

  public Store(obj: tEntity) { }
  public StoreHandlingCollisions(obj: tEntity) { }
  public Store(id: radKey, obj: IRefCount) { }
  public StoreHandlingCollisions(id: radKey, obj: IRefCount) { }


  public AddSection(name: char_p) { }
  public DeleteSection(name: char_p) { DeleteSection(tEntity.MakeUID(name)); }
  public DeleteSection(uid: tUID) { }

  public SelectSection(name: tName) { }
  public GetSelectedSection(): tName { return this.section[this.currentSection].GetName(); }
  public GetCurrentSection(): tEntityTable { return this.section[this.currentSection]; }
  public GetSection(name: char_p): tEntityTable { return this.GetSection(tEntity.MakeUID(name)); }
  public GetSection(uid: tUID): tEntityTable { }

  public PushSection() { }
  public PopSection() { }

  public DeleteAllSections() { }
  public RemoveSectionElements(name: char_p) { this.RemoveSectionElements(tEntity.MakeUID(name)); }
  public RemoveSectionElements(uid: tUID) { }

  public GetCurrentSectionOnly(): boolean { return this.currentSectionOnly; }
  public SetCurrentSectionOnly(b: boolean) { this.currentSectionOnly = b; }

  public EnableSectionPath(enable: boolean) { this.sectionPathEnabled = enable; }
  public GetectionPathEnabled(): boolean { return this.sectionPathEnabled; }
  public SetSectionPath(
    p0: char_p,
    p1: char_p = '',
    p2: char_p = '',
    p3: char_p = '',
    p4: char_p = '',
    p5: char_p = '',
    p6: char_p = '',
    p7: char_p = ''
  ) { }

  public RemoveAllElements() { }

  public RePack() { }
  public SetAutoRepack(enable: boolean) { }
  public GetAutoRepack(): boolean { return false; }

  // #ifndef RAD_RELEASE
  //     void Dump (bool detail);
  // #endif

  protected autoRepack: boolean;

  protected nSection: unsigned;
  protected currentSection: unsigned;
  protected currentSectionOnly: boolean;

  protected sectionPathEnabled: boolean;
  protected nSectionPath: int;
  protected sectionPath: tUID[]; //? [P3D_MAX_SECTION_PATH_SECTIONS];

  // tStack< tName > sectionStack;

  protected section: tEntityTable; //? [P3D_MAX_INVENTORY_SECTIONS];

  protected FindSection(name: tName): int { };
  protected SearchSection(section: unsigned, caster: radLoadInventory:: SafeCastBase, name: tName): tEntity { };
};


/*===========================================================================
    inventory.hpp
    18-Oct-95 Created by Neall
    23-Dec-99 Completely revamped for v12
    04-Apr-02 Damn, this class is old

    Copyright (c)1995-2002 Radical Entertainment Ltd.
    All rights reserved.
===========================================================================

#ifndef _INVENTORY_HPP
#define _INVENTORY_HPP

#include <p3d/p3dtypes.hpp>
#include <p3d/stack.hpp>
#include <p3d/entity.hpp>
#include <p3d/safecast.hpp>
#include <p3d/entitytable.hpp>
#include <p3d/platform.hpp>
#include <radload/utility/inventory.hpp>

//-------------------------------------------------------------------
class tEntityStore : public radLoadHashedStore
{
public:
    virtual void Store(tEntity* entity);
    virtual void Store(radKey id, IRefCount* obj);
    virtual void StoreHandlingCollisions(tEntity* entity);
    virtual void StoreHandlingCollisions( radKey id, IRefCount* obj );
};

//-------------------------------------------------------------------
const int P3D_MAX_INVENTORY_SECTIONS = 256;
const int P3D_MAX_SECTION_PATH_SECTIONS = 8;
const int P3D_MAX_CURRENT_SECTIONS = 16;
const char P3D_DEFAULT_INV_SECTION[] = "default";

class tInventory : public tEntityStore
{
public:
    tInventory();   

    #include "p3d/inventoryiterator.inl"

    virtual IRefCount* Find(radLoadInventory::SafeCastBase& c, const tUID uid);

    bool TestCollision(tEntity* obj);
    virtual void Remove(IRefCount* obj);

    virtual void Store(tEntity* obj);
    virtual void StoreHandlingCollisions( tEntity* obj );
    virtual void Store(radKey id, IRefCount* obj);
    virtual void StoreHandlingCollisions( radKey id, IRefCount* obj );


    void AddSection(const char* name);
    void DeleteSection(const char* name) {  DeleteSection(tEntity::MakeUID(name)); }
    void DeleteSection(tUID uid);

    void SelectSection( const tName& name );
    tName GetSelectedSection(void)              { return section[currentSection]->GetName(); }
    tEntityTable* GetCurrentSection()          { return section[currentSection]; }
    tEntityTable* GetSection(const char* name) { return GetSection(tEntity::MakeUID(name)); }
    tEntityTable* GetSection(tUID uid);

    void PushSection(void);
    void PopSection(void);

    void DeleteAllSections();
    void RemoveSectionElements(const char* name) { RemoveSectionElements(tEntity::MakeUID(name)); }
    void RemoveSectionElements(tUID uid);

    bool GetCurrentSectionOnly(void)   { return currentSectionOnly; }
    void SetCurrentSectionOnly(bool b) { currentSectionOnly = b; }

    // set which sections can be used for reference resolution
    // note that CurrentSectionOnly mode must be disabled for this to work
    void EnableSectionPath(bool enable) { sectionPathEnabled = enable; }
    bool GetectionPathEnabled()         { return sectionPathEnabled; }
    void SetSectionPath(const char* p0,     const char* p1 = 0, const char* p2 = 0, const char* p3 = 0,
                        const char* p4 = 0, const char* p5 = 0, const char* p6 = 0, const char* p7 = 0 );

    void RemoveAllElements();

    void RePack();
    void SetAutoRepack(bool enable);
    bool GetAutoRepack();

#ifndef RAD_RELEASE
    void Dump (bool detail);
#endif

protected:
    virtual ~tInventory();

    bool autoRepack;

    unsigned nSection;
    unsigned currentSection;
    bool currentSectionOnly;

    bool sectionPathEnabled;
    int nSectionPath;
    tUID sectionPath[P3D_MAX_SECTION_PATH_SECTIONS];

    tStack< tName > sectionStack;

    tEntityTable* section[P3D_MAX_INVENTORY_SECTIONS];

    int FindSection( const tName& name );
    tEntity* SearchSection(unsigned section, radLoadInventory::SafeCastBase& caster, const tName& name );
};

#endif /* _INVENTORY_HPP */

