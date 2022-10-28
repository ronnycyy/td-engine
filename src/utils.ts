import { EVENT_NAME } from './events/eventName';
import { EventPayload } from './events/payload';
import { Point } from './point';
import { Transform } from './transform';

class Utils {

  constructor() { }

  // 缩放
  // offsetLeft: canvas 到 html 左边界的距离
  // point: 点击位置在 canvas 画布中的坐标 (已经去除外部偏移)
  public scaleHandler(e: Event, transform: Transform, point: Point) {
    const target = transform.target;
    const px = point.x;
    const py = point.y;
    const oldLeft = target.left;
    const oldTop = target.top;
    const oldWidth = target.width;
    const oldHeight = target.height;

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

    target.updateControls();

    if (target.left !== oldLeft || target.top !== oldTop || target.height !== oldHeight || target.width !== oldWidth) {
      target.emitEvent(EVENT_NAME.OBJECT_SCALING, new EventPayload(e, target));
    }
  }

  // 平移
  public translateHandler(e: Event, transform: Transform, point: Point) {
    const target = transform.target;
    const oldLeft = target.left;
    const oldTop = target.top;
    const newLeft = point.x - (transform.offsetX || 0);
    const newTop = point.y - (transform.offsetY || 0);
    
    target.left = newLeft;
    target.top = newTop;
    target.updateControls();

    if (target.left !== oldLeft || target.top !== oldTop) {
      target.emitEvent(EVENT_NAME.OBJECT_MOVING, new EventPayload(e, target));
    }
  }

  public requestAnimFrame(cb: Function) {
    window.requestAnimationFrame(() => cb.call(null));
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
