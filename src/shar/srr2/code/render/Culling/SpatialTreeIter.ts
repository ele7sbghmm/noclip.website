import { int } from '../../../../type_aliases.js';
import { SpatialNode } from './SpacialNode.js';

type ContiguousBinNode<T> = Array<T>;

export class SpatialTreeIter {
  public mpRootNode: ContiguousBinNode<SpatialNode>;
  public rIthNode(iIth: int): SpatialNode {
    return (this.mpRootNode + iIth).mData;
  }
}

