import { degreesToRadians, cos, sin } from "./default";
import { TD_Object } from "./objects/object";
import { Point } from "./point";

export class Controls {
  public ml: Control;
  public mr: Control;
  public mb: Control;
  public mt: Control;
  public tl: Control;
  public tr: Control;
  public bl: Control;
  public br: Control;
  public mtr: Control;

  constructor() {
    this.ml = new Control(-0.5, 0);
    this.mr = new Control(0.5, 0);
    this.mb = new Control(0, 0.5);
    this.mt = new Control(0, -0.5);
    this.tl = new Control(-0.5, -0.5);
    this.tr = new Control(0.5, -0.5);
    this.bl = new Control(-0.5, 0.5);
    this.br = new Control(0.5, 0.5);
    this.mtr = new Control(0, -0.5);
  }
}

export class Control {
  public x: number;
  public y: number;
  public offsetX: number;
  public offsetY: number;
  public touchSizeX: number;
  public touchSizeY: number;
  public sizeX: number;
  public sizeY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.offsetX = 0;
    this.offsetY = 0;
    this.sizeX = 0;
    this.sizeY = 0;
  }

  public calcCornerCoords(objectAngle: number, objectCornerSize: number, centerX: number, centerY: number, isTouch: boolean) {
    var cosHalfOffset: number;
    var sinHalfOffset: number;
    var cosHalfOffsetComp: number;
    var sinHalfOffsetComp: number;
    var xSize = (isTouch) ? this.touchSizeX : this.sizeX;
    var ySize = (isTouch) ? this.touchSizeY : this.sizeY;

    if (xSize && ySize && xSize !== ySize) {
      var controlTriangleAngle = Math.atan2(ySize, xSize);
      var cornerHypotenuse = Math.sqrt(xSize * xSize + ySize * ySize) / 2;
      var newTheta = controlTriangleAngle - degreesToRadians(objectAngle);
      var newThetaComp = Math.PI / 2 - controlTriangleAngle - degreesToRadians(objectAngle);
      cosHalfOffset = cornerHypotenuse * cos(newTheta);
      sinHalfOffset = cornerHypotenuse * sin(newTheta);
      cosHalfOffsetComp = cornerHypotenuse * cos(newThetaComp);
      sinHalfOffsetComp = cornerHypotenuse * sin(newThetaComp);
    }
    else {
      var cornerSize = (xSize && ySize) ? xSize : objectCornerSize;
      cornerHypotenuse = cornerSize * 0.7071067812;
      var newTheta = degreesToRadians(45 - objectAngle);
      cosHalfOffset = cosHalfOffsetComp = cornerHypotenuse * cos(newTheta);
      sinHalfOffset = sinHalfOffsetComp = cornerHypotenuse * sin(newTheta);
    }
    return {
      tl: {
        x: centerX - sinHalfOffsetComp,
        y: centerY - cosHalfOffsetComp,
      },
      tr: {
        x: centerX + cosHalfOffset,
        y: centerY - sinHalfOffset,
      },
      bl: {
        x: centerX - cosHalfOffset,
        y: centerY + sinHalfOffset,
      },
      br: {
        x: centerX + sinHalfOffsetComp,
        y: centerY + cosHalfOffsetComp,
      },
    };
  }

  public render(ctx: CanvasRenderingContext2D, left: number, top: number, fabricObject: TD_Object) {
    this._renderSquareControl(ctx, left, top, fabricObject);
  }

  public positionHandler(dim: Point, finalMatrix: Array<number>, fabricObject?: TD_Object) {
    const tp = (p: Point, t: Array<number>, ignoreOffset?: boolean) => new Point(p.x, p.y).transform(t, ignoreOffset);
    const point = tp(new Point(this.x * dim.x + this.offsetX, this.y * dim.y + this.offsetY), finalMatrix);
    return point;
  }

  private _renderSquareControl(ctx: CanvasRenderingContext2D, left: number, top: number, fabricObject: TD_Object) {
    var xSize = fabricObject.cornerSize;
    var ySize = fabricObject.cornerSize;
    var transparentCorners = fabricObject.transparentCorners;
    var methodName = transparentCorners ? 'stroke' : 'fill';
    var stroke = !transparentCorners && fabricObject.cornerStrokeColor;
    var xSizeBy2 = xSize / 2;
    var ySizeBy2 = ySize / 2;

    requestAnimationFrame(() => {
      ctx.save();
      ctx.fillStyle = fabricObject.cornerColor;
      ctx.strokeStyle = fabricObject.cornerStrokeColor || ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.translate(left, top);
      var angle = fabricObject.getTotalAngle();
      ctx.rotate(degreesToRadians(angle));
      ctx.strokeRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
      ctx.restore();
    })
  }
}