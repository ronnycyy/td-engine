import { EventPayload } from './../events/payload';
import { EVENT_NAME } from './../events/eventName';
import { Controls, IoCoords, TCorner } from './../control';
import { Canvas } from "../canvas";
import { TOriginX, TOriginY } from "../default";
import { Point } from "../point";

export class TD_Object {
  public left: number;
  public top: number;
  public originX: TOriginX;
  public originY: TOriginY;
  public width: number;
  public height: number;
  public type: string;
  public cornerSize: number;
  public transparentCorners: boolean;
  public cornerStrokeColor: string;
  public cornerColor: string;
  public cornerDashArray: Array<number>;
  public angle: number;
  public canvas: Canvas;
  public oCoords: IoCoords;  // 每个图形对象，都有 9 个控制点
  public touchCornerSize: number;
  public currentCorner: TCorner;  // 当前拖拽的控制点位置
  public hiddenFill: string;  // 隐藏层的颜色
  public centerPoint: Point;  // 图形的中心点
  public controls: Controls;  // 9 个控制点

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
  }

  public setHiddenFill(hiddenFill: string) {
    this.hiddenFill = hiddenFill;
  }

  // 渲染自己
  public render(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D, hiddenFill: string) { }

  // 绘制控制点
  public drawControls(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) { }

  // 更新控制点坐标
  public updateControls() { }

  // 订阅事件
  public on(eventName: EVENT_NAME, callback: Function) { }

  // 发布事件
  public emitEvent(eventName: EVENT_NAME, payload: EventPayload) {}

  public getTotalAngle() {
    return this.angle;
  }

  public setCanvas(canvas: Canvas) {
    this.canvas = canvas;
  }

  public set(key: string, value: any) {
    this[key] = value;
  }

  public get(key: string) {
    return this[key];
  }

  public fire(eventName: string, options: any) {
    // object 上的事件注册与发布
  }
}

export interface IObjectOptions {
  left: number;
  top: number;
  type: string;
  width: number;
  height: number;
  fill: string;
  fillRule: 'nonzero' | 'evenodd';
}