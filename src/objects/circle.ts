import { Control } from '../control';
import { IObjectOptions, TD_Object } from './object';

// 注意:
// 必须给图形设置 width/height, 控制点等许多地方都要用到。

export interface ICircleOptions extends IObjectOptions {
  radius: number;
}

export class Circle extends TD_Object {

  public static DEFAULT_RADIUS = 10;
  public static DEFAULT_LINE_WIDTH = 2;

  public radius: number;

  constructor(options: ICircleOptions) {
    super();
    this.type = 'circle';
    this.left = options.left || 0;
    this.top = options.top || 0;
    this.radius = options.radius || Circle.DEFAULT_RADIUS;
    this.width = this.width || this.radius * 2;
    this.height = this.height || this.radius * 2;
    this.strokeColor = options.strokeColor;
    this.lineWidth = options.lineWidth || Circle.DEFAULT_LINE_WIDTH;
    this.fill = options.fill || 'black';
    this.fillRule = options.fillRule || 'evenodd';
    this._setControls();
    this._setCenterPoint();
  }

  public render(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) {
    this._render(ctx, false);
    this._render(hiddenCtx, true);
  }

  public drawControls(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) {
    this._drawControls(ctx, false);
    this._drawControls(hiddenCtx, true);
  }

  private _render(ctx: CanvasRenderingContext2D, isHidden: boolean) {
    this._draw(ctx);
    this._renderFill(ctx, isHidden ? this.hiddenFill : this.fill);
  }

  private _drawControls(ctx: CanvasRenderingContext2D, isHidden: boolean) {
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = this.cornerColor;
    if (!this.transparentCorners) {
      ctx.strokeStyle = this.cornerStrokeColor;
    }
    for (const key in this.controls) {
      const c = this.controls[key] as Control;
      isHidden ? c.renderHidden(ctx, this, this.hiddenFill) : c.render(ctx, this);
    }
    ctx.restore();
    return this;
  }

  private _draw(ctx: CanvasRenderingContext2D) {
    // 椭圆圆心
    const cx = this.left + this.width / 2;
    const cy = this.top + this.height / 2;
    // 贝塞尔控制点系数
    const k = (this.width / 0.75) / 2;
    // 高度的一半
    const hh = this.height / 2;

    ctx.save();
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.bezierCurveTo(cx + k, cy - hh, cx + k, cy + hh, cx, cy + hh);
    ctx.bezierCurveTo(cx - k, cy + hh, cx - k, cy - hh, cx, cy - hh);
    ctx.closePath();
    ctx.restore();
  }

}