import { Controls, Control } from "../control";
import { iMatrix } from "../default";
import { IObjectOptions, TD_Object } from "./object";
import { Point, IoCoords } from "../point";
import Utils from "../utils";

export interface IRectOptions extends IObjectOptions {
}

export class Rect extends TD_Object {
  public rx: number;
  public ry: number;
  public fill: string;
  public fillRule: 'nonzero' | 'evenodd';
  public controls: Controls;

  private _utils: Utils;

  constructor(options: IRectOptions) {
    super();
    this.type = 'rect';
    this.fill = options.fill || 'black';
    this.width = options.width;
    this.height = options.height;
    this.fillRule = options.fillRule || 'evenodd';
    this._utils = new Utils();
    this.controls = new Controls();
    this.left = options.left || 0;
    this.top = options.top || 0;
  }

  public render(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D, hiddenFill: string) {
    this._renderVisible(ctx);
    this._renderHidden(hiddenCtx, hiddenFill);
  }

  public drawControls(ctx: CanvasRenderingContext2D) {
    ctx.save();
    var retinaScaling = 0;
    var p: Point;
    ctx.setTransform(retinaScaling, 0, 0, retinaScaling, 0, 0);
    ctx.strokeStyle = ctx.fillStyle = this.cornerColor;
    if (!this.transparentCorners) {
      ctx.strokeStyle = this.cornerStrokeColor;
    }
    this._setLineDash(ctx, this.cornerDashArray);
    // 获取控制点, 比如 rect 有 9 个: tl,mt,rt, ml,mr, bl,mb,br, mtr
    this.setCoords();
    // 遍历 this.controls, 调用每个 control 对象的 render 方法，使用 oCoords 的 (x,y) 来绘制控制点
    this.forEachControl(function (control: Control, key: keyof IoCoords, fabricObject: TD_Object) {
      p = fabricObject.oCoords[key];
      control.render(ctx, p.x, p.y, fabricObject);
    });
    ctx.restore();
    return this;
  }

  public setCoords() {
    // 计算所有控制点坐标 bl,br,mb,ml,mr,mt,mtr,tl,tr
    this.oCoords = this.calcOCoords();
    // 填充 this.controls 
    // 每个控制点，都有自己四个角的点: tl,tr,bl,br，这一步填充上
    this._setCornerCoords();
    return this;
  }

  private _setCornerCoords() {
    var coords = this.oCoords;
    for (var control in coords) {
      var controlObject = this.controls[control] as Control;
      coords[control].corner = controlObject.calcCornerCoords(this.angle, this.cornerSize, coords[control].x, coords[control].y, false);
      coords[control].touchCorner = controlObject.calcCornerCoords(this.angle, this.touchCornerSize, coords[control].x, coords[control].y, true);
    }
  }

  public calcOCoords() {
    var vpt = this.getViewportTransform();
    var center = this.getCenterPoint();
    var tMatrix = [1, 0, 0, 1, center.x, center.y];
    var rMatrix = this._utils.calcRotateMatrix({ angle: this.getTotalAngle() }) as Array<number>;
    var positionMatrix = this._utils.multiplyMatrices(tMatrix, rMatrix);
    var startMatrix = this._utils.multiplyMatrices(vpt, positionMatrix);
    var finalMatrix = this._utils.multiplyMatrices(startMatrix, [1 / vpt[0], 0, 0, 1 / vpt[3], 0, 0]);
    var dim = this._calculateCurrentDimensions();
    var coords = {} as IoCoords;
    this.forEachControl(function (control: Control, key: keyof IoCoords, fabricObject: TD_Object) {
      coords[key] = control.positionHandler(dim, finalMatrix, fabricObject);
    });
    return coords;
  }

  public forEachControl(fn: Function) {
    for (var i in this.controls) {
      fn(this.controls[i], i, this);
    }
  }

  private _calculateCurrentDimensions() {
    return new Point(this.width, this.height);
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

  private _setLineDash(ctx: CanvasRenderingContext2D, dashArray: Array<number>) {
    if (!dashArray || dashArray.length === 0) {
      return;
    }
    if (1 & dashArray.length) {
      dashArray.push.apply(dashArray, dashArray);
    }
    // 画直线的时候，定义这条直线为虚线，然后按照 dashArray 的`实部分`和`虚部分`来画。
    // 比如 [5, 10, 15, 30], 表示 `实5虚10实15虚30` 按此规则分割直线。
    ctx.setLineDash(dashArray);
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