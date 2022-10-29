import { IObjectOptions, TD_Object } from './object';


export interface ITextOptions extends IObjectOptions {
  text: string;
}

export class Text extends TD_Object {

  public text: string;

  constructor(options: ITextOptions) {
    super();
    this.text = options.text;
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
