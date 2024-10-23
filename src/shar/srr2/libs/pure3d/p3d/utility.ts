import { tPlatform } from './platform/win32/platform.js';
import { tContext } from './context.js';
import { tLoadManager } from './loadmanager.js';

export namespace p3d_ {
  export let platform: tPlatform;
  export let context: tContext;
  // export let inventory: tInventory;
  // export let stack: tMatrixStack;
  export let loadManager: tLoadManager;
  // export let pddi: pddiRenderContext;
  // export let device: pddiDevice;
  // export let display: pddiDisplay;
}

