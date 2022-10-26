import { Transform } from './transform';
import { iMatrix, degreesToRadians, cos, sin } from './default';
import { Point } from './point';

class Utils {
  constructor() { }

  // 缩放
  // offsetLeft: canvas 到 html 左边界的距离
  public scaleHandler(eventData: Event, transform: Transform, point: Point, offsetLeft: number, offsetTop: number) {
    const target = transform.target;
    const px = point.x - offsetLeft;  // 点到 canvas 左边界的距离
    const py = point.y - offsetTop;   // 点到 canvas 顶边界的距离

    const oldLeft = target.left;
    const oldTop = target.top;

    switch (transform.action) {
      case 'bl': {
        target.left = px;
        target.top = target.top;
        target.width = Math.abs(oldLeft + target.width - px);
        target.height = Math.abs(py - oldTop);
        break;
      }
      case 'mb': {
        target.left = target.left;
        target.top = target.top;
        target.width = target.width;
        target.height = Math.abs(py - oldTop);
        break;
      }
      case 'br': {
        target.left = target.left;
        target.top = target.top;
        target.width = Math.abs(px - target.left);
        target.height = Math.abs(py - target.top);
        break;
      }
      case 'ml': {
        target.left = px;
        target.top = target.top;
        target.width = Math.abs(oldLeft + target.width - px);
        target.height = target.height;
        break;
      }
      case 'mr': {
        target.left = target.left;
        target.top = target.top;
        target.width = Math.abs(px - target.left);
        target.height = target.height;
        break;
      }
      case 'tl': {
        target.left = px;
        target.top = py;
        target.width = Math.abs(oldLeft + target.width - px);
        target.height = Math.abs(oldTop + target.height - py);
        break;
      }
      case 'mt': {
        target.left = target.left;
        target.top = py;
        target.width = target.width;
        target.height = Math.abs(oldTop + target.height - py);
        break;
      }
      case 'tr': {
        target.left = target.left;
        target.top = py;
        target.width = Math.abs(px - target.left);
        target.height = Math.abs(oldTop + target.height - py);
        break;
      }
    }
  }

  // 平移
  public translateHandler(eventData: Event, transform: Transform, point: Point): boolean {
    const target = transform.target;
    const newLeft = point.x - (transform.offsetX || 0);
    const newTop = point.y - (transform.offsetY || 0);
    const isExactlyMoveX = !target.get('lockMovementX') && target.left !== newLeft;
    const isExactlyMoveY = !target.get('lockMovementY') && target.top !== newTop;

    isExactlyMoveX && target.set('left', newLeft);
    isExactlyMoveY && target.set('top', newTop);

    if (isExactlyMoveX || isExactlyMoveY) {
      // 这里可以加 target 上的 move 事件发布
    }

    return isExactlyMoveX || isExactlyMoveY;   // 图形是否移动了
  }

  public requestAnimFrame(cb: Function) {
    window.requestAnimationFrame(() => cb.call(null));
  }

  public multiplyMatrices(a: Array<number>, b: Array<number>, is2x2?: boolean) {
    return [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4],
      is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5]
    ];
  }

  public calcRotateMatrix({ angle }) {
    if (!angle) {
      return iMatrix;
    }
    const theta = degreesToRadians(angle), cosin = cos(theta), sinus = sin(theta);
    return [cosin, sinus, -sinus, cosin, 0, 0];
  }

  public wrapElement(son: HTMLElement, parent: HTMLDivElement) {
    if (son.parentNode) {
      son.parentNode.replaceChild(parent, son);
    }
    parent.appendChild(son);
    return parent;
  }

  public setStyle(element: HTMLElement, styles: Object) {
    const elementStyle = element.style;
    if (!elementStyle) {
      return;
    }
    else if (typeof styles === 'string') {
      element.style.cssText += ';' + styles;
    }
    else {
      Object.entries(styles).forEach(([property, value]) => elementStyle.setProperty(property, value));
    }
  }

  public makeElementUnselectable(element: HTMLElement) {
    if (typeof element.onselectstart !== 'undefined') {
      element.onselectstart = () => false;
    }
    element.style.userSelect = 'none';
    return element;
  }

  public getRandomHexColor() {
    // rgba 十六进制的颜色值，如 #0000ff, 
    // 该表示法一共有 6 位值，每位 15 种可能性
    const proc = (color: string) => {
      if (color.length === 6) {
        return color;
      }
      const HEX = '0123456789abcdef';
      color += HEX[Math.floor(Math.random() * 16)];  // index: [0,1) => [0,16) => [0,15]
      return proc(color);
    }
    return '#' + proc('');
  }

  // r,g,b 都是 0~255 的数值
  public rgbToHex(r: number, g: number, b: number) {
    const componentToHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
}

export default Utils;
