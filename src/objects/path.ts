import { IObjectOptions, TD_Object } from "./object";

/**
 * tdEngine 的 Path 类交互式图形，根据 svg 的 path 元素的 d 属性来绘制。
 * 
 * 
 * 举个例子:
 * 
 * <svg width="4cm" height="4cm" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" version="1.1">
 *   <path d="M 100 100 L 300 100 L 200 300 z" fill="red" />
 * </svg>
 * 
 * 这里的 path 元素的 d 属性为 'M 100 100 L 300 100 L 200 300 z'。
 * 
 * 各字母含义如下:
 *  M: moveTo
 *  L: lineTo
 *  C: bezierCurveTo
 *  Q: quadraticCurveTo
 *  Z: closePath
 * 
 * 所以这条 path 的绘制用 canvas 来表示就是:
 *  ctx.beginPath();
 *  ctx.moveTo(100,100);
 *  ctx.lineTo(300,100);
 *  ctx.lineTo(200,300);
 *  ctx.closePath();
 * 
*/

export enum ENUM_SVG_FLAG {
  M = 'M',
  L = 'L',
  C = 'C',
  Q = 'Q',
  Z = 'Z',
}

export interface IPathOptions extends IObjectOptions {
  svg: string;
}

class SinglePath {
  public flag: ENUM_SVG_FLAG;
  public values: Array<number>;

  constructor(f: ENUM_SVG_FLAG, v: Array<number>) {
    this.flag = f;
    this.values = v;
  }

  public setValue(v: number) {
    this.values.push(v);
  }
}


export class Path extends TD_Object {

  /**
   * 举个例子:
   * 
   * [
   *   { flag: 'M', values: [100,100] },
   *   { flag: 'L', values: [200,100] },
   *   { flag: 'L', values: [300,200] },
   *   { flag: 'C', values: [c1x, c1y, c2x, c2y, dx, dy] },
   *   { flag: 'Q', values: [c1x, c1y, dx, dy] },
   *   { flag: 'Z', values: [] },
   * ]
   */
  public paths: Array<SinglePath>;

  constructor(options: IPathOptions) {
    super();
    this.type = 'path';
    this.scalable = false;
    this.paths = this._parseSVG(options.svg);
    this.left = options.left || 0;
    this.top = options.top || 0;
    this.fill = 'black';
  }

  public render(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) {
    this._render(ctx, false);
    this._render(hiddenCtx, true);
  }

  private _render(ctx: CanvasRenderingContext2D, isHidden: boolean) {
    this._draw(ctx);
    this._renderFill(ctx, isHidden ? this.hiddenFill : this.fill);
  }

  private _draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.left, this.top);  // 坐标系移动到 left,top, 画完再移动回来
    ctx.beginPath();
    for (let i = 0, len = this.paths.length; i < len; i++) {
      const p = this.paths[i];
      const v = p.values;
      switch (p.flag) {
        case ENUM_SVG_FLAG.M: {
          ctx.moveTo(v[0], v[1]);
          break;
        }
        case ENUM_SVG_FLAG.L: {
          ctx.lineTo(v[0], v[1]);
          break;
        }
        case ENUM_SVG_FLAG.C: {
          ctx.bezierCurveTo(v[0], v[1], v[2], v[3], v[4], v[5]);
          break;
        }
        case ENUM_SVG_FLAG.Q: {
          ctx.quadraticCurveTo(v[0], v[1], v[2], v[3]);
          break;
        }
        case ENUM_SVG_FLAG.Z: {
          ctx.closePath();
          break;
        }
      }
    }
    ctx.restore();
  }

  private _parseSVG(svg: string) {
    const paths = [] as Array<SinglePath>;
    const data = svg.split(' ');
    let cur = null as SinglePath;

    for (let i = 0, len = data.length; i < len; i++) {
      const c = data[i];
      switch (c.toUpperCase()) {
        case ENUM_SVG_FLAG.M: {
          cur && paths.push(cur);
          cur = new SinglePath(ENUM_SVG_FLAG.M, []);
          break;
        }
        case ENUM_SVG_FLAG.L: {
          cur && paths.push(cur);
          cur = new SinglePath(ENUM_SVG_FLAG.L, []);
          break;
        }
        case ENUM_SVG_FLAG.C: {
          cur && paths.push(cur);
          cur = new SinglePath(ENUM_SVG_FLAG.C, []);
          break;
        }
        case ENUM_SVG_FLAG.Q: {
          cur && paths.push(cur);
          cur = new SinglePath(ENUM_SVG_FLAG.Q, []);
          break;
        }
        case ENUM_SVG_FLAG.Z: {
          cur && paths.push(cur);
          paths.push(new SinglePath(ENUM_SVG_FLAG.Z, []));
          break;
        }
        default: {
          cur && cur.setValue(+c);
        }
      }
    }

    return paths;
  }
}