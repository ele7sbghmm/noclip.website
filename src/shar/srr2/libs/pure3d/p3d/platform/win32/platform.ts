import { assert } from '../../../../../../../util.js';
import { int } from '../../../../../../type_aliases.js';

import { p3d_ } from '../../utility.js';
import { tContext } from '../../context.js';

export class tPlatform {
  public static currentPlatform: tPlatform;
  public instance: any;
  public currentContext: tContext;
  public nContexts: int;

  constructor(inst: any) {
    this.instance = inst;
    // this.currentContext = null;
    this.nContexts = 0;
  }

  public static Create(instance: any): tPlatform {
    if (!tPlatform.currentPlatform) {
      tPlatform.currentPlatform = new tPlatform(instance);
      p3d_.platform = tPlatform.currentPlatform;
    }
    return tPlatform.currentPlatform;
  }
  public SetActiveContext(context: tContext) {
    // assert(context); // P3DASSERT( context );

    this.currentContext = context;

    p3d_.context = context;
    // p3d_.inventory = context.GetInventory();
    // p3d_.stack = context.GetMatrixStack();
    p3d_.loadManager = context.GetLoadManager();
    // p3d_.pddi = context.GetContext();
    // p3d_.device = context.GetDevice();
    // p3d_.display = context.GetDisplay();
  }
}

