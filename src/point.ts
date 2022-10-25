export interface ICoordinate {
  x: number;
  y: number;
}

export interface IoCoords {
  bl: Point;
  mb: Point;
  br: Point;
  ml: Point;
  mr: Point;
  tl: Point;
  mt: Point;
  tr: Point;
  mtr: Point;
}

export interface ICorner {
  bl: ICoordinate;
  br: ICoordinate;
  tl: ICoordinate;
  tr: ICoordinate;
}

export class Point {
  corner: ICorner;
  touchCorner: ICorner;
  type: 'point';
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public transform(t: Array<number>, ignoreOffset = false) {
    return new Point(t[0] * this.x + t[2] * this.y + (ignoreOffset ? 0 : t[4]), t[1] * this.x + t[3] * this.y + (ignoreOffset ? 0 : t[5]));
  }
}
