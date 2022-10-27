import { Point } from "../point";
import { iMatrix } from "../default";
import { Controls, Control } from "../control";
import { EVENT_NAME } from "../events/eventName";
import { EventSystem } from './../events/event';
import { EventPayload } from './../events/payload';
import { IObjectOptions, TD_Object } from "./object";

export interface IRectOptions extends IObjectOptions {
}

export class Rect extends TD_Object {
  public rx: number;
  public ry: number;
  public fill: string;
  public fillRule: 'nonzero' | 'evenodd';
  public controls: Controls;

  private _eventSystem: EventSystem;

  constructor(options: IRectOptions) {
    super();
    this.type = 'rect';
    this.fill = options.fill || 'black';
    this.width = options.width;
    this.height = options.height;
    this.fillRule = options.fillRule || 'evenodd';
    this.controls = new Controls();
    this.left = options.left || 0;
    this.top = options.top || 0;
    this._setCenterPoint();
    this._setControls();
    this._eventSystem = new EventSystem();
  }

  public render(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) {
    this._renderVisible(ctx);
    this._renderHidden(hiddenCtx, this.hiddenFill);
  }

  public drawControls(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) {
    this._drawControlsVisible(ctx);
    this._drawControlsHidden(hiddenCtx);
  }

  public on(eventName: EVENT_NAME, callback: Function) {
    return this._eventSystem.on(eventName, callback);
  }

  public emitEvent(eventName: EVENT_NAME, payload: EventPayload) {
    this._eventSystem.emit(eventName, payload);
  }

  private _setCenterPoint() {
    const cx = this.left + this.width / 2;
    const cy = this.top + this.height / 2;
    this.centerPoint = new Point(cx, cy);
  }

  private _drawControlsVisible(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = this.cornerColor;
    if (!this.transparentCorners) {
      ctx.strokeStyle = this.cornerStrokeColor;
    }
    // 每个控制点渲染自己
    for (const key in this.controls) {
      const c = this.controls[key] as Control;
      c.render(ctx, this);
    }
    ctx.restore();
    return this;
  }

  private _drawControlsHidden(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = this.cornerColor;
    if (!this.transparentCorners) {
      ctx.strokeStyle = this.cornerStrokeColor;
    }
    for (const key in this.controls) {
      const c = this.controls[key] as Control;
      c.renderHidden(ctx, this, this.hiddenFill);
    }
    ctx.restore();
    return this;
  }

  public updateControls() {
    this.controls = this.generateControls();
  }

  // 计算所有控制点坐标 bl,br,mb,ml,mr,mt,tl,tr
  private _setControls() {
    this.controls = this.generateControls();
    return this;
  }

  public generateControls(): Controls {
    const l = this.left;
    const t = this.top;
    const w = this.width;
    const h = this.height;

    return {
      tl: new Control(l, t),
      mt: new Control(l + w / 2, t),
      tr: new Control(l + w, t),
      ml: new Control(l, t + h / 2),
      mr: new Control(l + w, t + h / 2),
      bl: new Control(l, t + h),
      mb: new Control(l + w / 2, t + h),
      br: new Control(l + w, t + h)
    };
  }

  public forEachControl(fn: Function) {
    for (var i in this.controls) {
      fn(this.controls[i], i, this);
    }
  }

  public getCenterPoint() {
    const x = this.left + this.width / 2;
    const y = this.top + this.height / 2;
    return new Point(x, y);
  }

  public getViewportTransform() {
    if (this.canvas && this.canvas.viewportTransform) {
      return this.canvas.viewportTransform;
    }
    return iMatrix.concat();
  }

  private _renderVisible(ctx: CanvasRenderingContext2D) {
    this._draw(ctx);
    this._renderFill(ctx, this.fill);
  }

  private _renderHidden(hiddenCtx: CanvasRenderingContext2D, hiddenFill: string) {
    this._draw(hiddenCtx);
    this._renderFill(hiddenCtx, hiddenFill);
  }

  private _draw(ctx: CanvasRenderingContext2D) {
    const l = this.left || 0;
    const t = this.top || 0;
    const w = this.width;
    const h = this.height;
    ctx.beginPath();
    ctx.moveTo(l, t);
    ctx.lineTo(l + w, t);
    ctx.lineTo(l + w, t + h);
    ctx.lineTo(l, t + h);
    ctx.closePath();
  }

  private _renderFill(ctx: CanvasRenderingContext2D, fill: string) {
    if (!fill) {
      return;
    }
    ctx.save();
    this._setFillStyles(ctx, fill);
    if (this.fillRule === 'evenodd') {
      ctx.fill('evenodd');
    }
    else {
      ctx.fill();
    }
    ctx.restore();
  }

  private _setFillStyles(ctx: CanvasRenderingContext2D, fill: string) {
    ctx.fillStyle = fill;
  }
}