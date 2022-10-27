import { Point } from "./point";
import { TD_Object } from "./objects/object";

export type TCorner = 'bl' | 'mb' | 'br' | 'ml' | 'mr' | 'tl' | 'mt' | 'tr' | null;

export interface ICoordinate {
  x: number;
  y: number;
}

export interface IoCoords {
  bl: Point;  // 底左
  mb: Point;  // 底中
  br: Point;  // 底右
  ml: Point;  // 中左
  mr: Point;  // 中右
  tl: Point;  // 顶左
  mt: Point;  // 顶中
  tr: Point;  // 顶右
}

export interface ICorner {
  bl: ICoordinate;
  br: ICoordinate;
  tl: ICoordinate;
  tr: ICoordinate;
}

export class Controls {
  public ml: Control;
  public mr: Control;
  public mb: Control;
  public mt: Control;
  public tl: Control;
  public tr: Control;
  public bl: Control;
  public br: Control;

  constructor() { }
}

export class Control {
  public x: number;  // 中心点横坐标
  public y: number;  // 中心点纵坐标
  public corner: ICorner;  // 以点为中心，画一个 storeRect, 会得到 4 个边角点

  private _size: number;  // 控制点的半径

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this._size = 8;
    this._calcCorner(x, y);
  }

  private _calcCorner(x: number, y: number) {
    const size = this._size;
    // x轴: 左->右变大
    // y轴: 顶->底变大
    const corner = {
      tl: { x: x - size, y: y - size },
      tr: { x: x + size, y: y - size },
      bl: { x: x - size, y: y + size },
      br: { x: x + size, y: y + size },
    }
    this.corner = corner;
  }

  public render(ctx: CanvasRenderingContext2D, target: TD_Object) {
    this._renderSquareControl(ctx, target);
  }

  public renderHidden(ctx: CanvasRenderingContext2D, target: TD_Object, hiddenFill: string) {
    this._renderSquareControl(ctx, target, hiddenFill);
  }

  private _renderSquareControl(ctx: CanvasRenderingContext2D, target: TD_Object, hiddenFill?: string) {

    requestAnimationFrame(() => {
      if (hiddenFill) {
        ctx.save();
        ctx.fillStyle = hiddenFill;
        ctx.strokeStyle = hiddenFill;
        ctx.lineWidth = 1;
        const tl = this.corner.tl;
        const tr = this.corner.tr;
        const bl = this.corner.bl;
        ctx.fillRect(tl.x, tl.y, tr.x - tl.x, bl.y - tl.y);
        ctx.restore();
      }
      else {
        ctx.save();
        ctx.fillStyle = target.cornerColor;
        ctx.strokeStyle = target.cornerStrokeColor || ctx.fillStyle;
        ctx.lineWidth = 1;
        const tl = this.corner.tl;
        const tr = this.corner.tr;
        const bl = this.corner.bl;
        ctx.strokeRect(tl.x, tl.y, tr.x - tl.x, bl.y - tl.y);
        ctx.restore();
      }
    })

  }
}