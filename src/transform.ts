import { Point } from './point';
import { TCorner } from './control';
import { TD_Object } from './objects/object';

export class Transform {
  public offsetX: number;  // 鼠标位置到图形 left 的距离
  public offsetY: number;  // 鼠标位置到图形 top  的距离
  public target: TD_Object;  // 被选中的图形
  public action: TCorner;  // 正在操作的控制点

  constructor(target: TD_Object, pointer: Point) {
    this.target = target;
    this.offsetX = pointer.x - target.left;
    this.offsetY = pointer.y - target.top;
    this.action = target.currentCorner || null;
  }
}
