import { Point } from "../point";
import { Canvas } from "../canvas";
import { EventSystem } from '../events/event';
import { TOriginX, TOriginY } from "../default";
import { EventPayload } from './../events/payload';
import { EVENT_NAME } from './../events/eventName';
import { Control, Controls, TCorner } from './../control';

export interface IObjectOptions {
  left: number;
  top: number;
  type: string;
  width: number;
  height: number;
  fill: string;
  fillRule: 'nonzero' | 'evenodd';
  strokeColor: string;  // 描边颜色
  lineWidth: number;  // 描边线粗细
}

export class TD_Object {
  public type: string;

  public left: number;
  public top: number;
  public originX: TOriginX;
  public originY: TOriginY;
  public width: number;
  public height: number;
  public fill: string;
  public fillRule: 'nonzero' | 'evenodd';

  public cornerSize: number;
  public transparentCorners: boolean;
  public cornerStrokeColor: string;
  public cornerColor: string;
  public cornerDashArray: Array<number>;
  public angle: number;
  public canvas: Canvas;
  public touchCornerSize: number;
  public currentCorner: TCorner;  // 当前拖拽的控制点位置
  public hiddenFill: string;  // 隐藏层的颜色
  public centerPoint: Point;  // 图形的中心点
  public controls: Controls;  // 9 个控制点
  public strokeColor: string;  // 描边颜色
  public lineWidth: number;  // 描边线粗细

  public scalable: boolean;  // 是否可放缩

  private _eventSystem: EventSystem;

  constructor() {
    this.cornerSize = 13;
    this.transparentCorners = true;
    this.cornerStrokeColor = '';
    this.cornerColor = "rgb(178,204,255)";
    this.angle = 0;
    this.left = 0;
    this.top = 0;
    this.originX = 'left';
    this.originY = 'top';
    this.touchCornerSize = 24;
    this.currentCorner = null;
    this.hiddenFill = '';
    this.scalable = true;
    this._eventSystem = new EventSystem();
  }

  // 渲染自己
  public render(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D, hiddenFill: string) { }

  // 绘制控制点
  public drawControls(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) { }

  // 更新控制点坐标
  public updateControls() {
    this.controls = this._generateControls();
  }

  // 获取属性
  public get(key: string) {
    return this[key];
  }

  // 设置属性 -> 重新绘制
  public set(key: string, value: any) {
    if (!this.canvas) {
      return;
    }
    this[key] = value;
    this.updateControls();
    this.canvas.requestRenderAll();
  }

  // 订阅事件
  public on(eventName: EVENT_NAME, callback: Function) {
    return this._eventSystem.on(eventName, callback);
  }

  // 发布事件
  public emitEvent(eventName: EVENT_NAME, payload: EventPayload) {
    this._eventSystem.emit(eventName, payload);
  }

  public setHiddenFill(hiddenFill: string) {
    this.hiddenFill = hiddenFill;
  }

  public getTotalAngle() {
    return this.angle;
  }

  public setCanvas(canvas: Canvas) {
    this.canvas = canvas;
  }

  protected _setControls() {
    this.controls = this._generateControls();
    return this;
  }

  private _generateControls(): Controls {
    const l = this.left || 0;
    const t = this.top || 0;
    const w = this.width || 0;
    const h = this.height || 0;

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

  protected _renderFill(ctx: CanvasRenderingContext2D, fill: string) {
    if (!fill) {
      return;
    }
    ctx.save();
    ctx.fillStyle = fill;
    ctx.fill(this.fillRule === 'evenodd' ? 'evenodd' : 'nonzero');
    ctx.restore();
  }

  protected _setCenterPoint() {
    const cx = this.left + this.width / 2;
    const cy = this.top + this.height / 2;
    this.centerPoint = new Point(cx, cy);
  }
}
