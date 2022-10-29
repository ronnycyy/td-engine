import { Control } from "../control";
import { IObjectOptions, TD_Object } from "./object";


export interface ITriangleOptions extends IObjectOptions {
}

export class Triangle extends TD_Object {

  constructor(options: ITriangleOptions) {
    super();
    this.type = 'triangle';
    this.fill = options.fill || 'black';
    this.width = options.width;
    this.height = options.height;
    this.fillRule = options.fillRule || 'evenodd';
    this.left = options.left || 0;
    this.top = options.top || 0;
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
    const l = this.left || 0;
    const t = this.top || 0;
    const w = this.width;
    const h = this.height;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(l, t + h);
    ctx.lineTo(l + w, t + h);
    ctx.lineTo(l + w / 2, t);
    ctx.closePath();
    ctx.restore();
  }

}