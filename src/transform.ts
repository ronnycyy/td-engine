import { TD_Object } from './objects/object';
import { Point, TCorner } from './point';

export class Transform {
  public offsetX: number;  // 鼠标位置到 left 的距离
  public offsetY: number;  // 鼠标位置到 top  的距离
  public target: TD_Object;
  public ex: number;
  public ey: number;
  public action: TCorner;

  constructor(target: TD_Object, pointer: Point) {
    this.target = target;
    this.offsetX = pointer.x - target.left;
    this.offsetY = pointer.y - target.top;
    this.ex = pointer.x;
    this.ey = pointer.y;
    this.action = target.corner || null;
  }
}
