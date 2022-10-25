  const iMatrix = Object.freeze([1, 0, 0, 1, 0, 0]);
  const halfPI = Math.PI / 2;
  const PiBy180 = Math.PI / 180;
  const degreesToRadians = (degrees: number) => (degrees * PiBy180);

  const cos = (angle: number) => {
    if (angle === 0) {
      return 1;
    }
    const angleSlice = Math.abs(angle) / halfPI;
    switch (angleSlice) {
      case 1:
      case 3: return 0;
      case 2: return -1;
    }
    return Math.cos(angle);
  };

  const sin = (angle: number) => {
    if (angle === 0) {
      return 0;
    }
    const angleSlice = angle / halfPI;
    const value = Math.sign(angle);
    switch (angleSlice) {
      case 1: return value;
      case 2: return 0;
      case 3: return -value;
    }
    return Math.sin(angle);
  };

  function addListener(el: HTMLElement, eventName: keyof HTMLElementEventMap, handler: EventListener, useCapture: boolean) {
    if (el) {
      el.addEventListener(eventName, handler, useCapture);
    }
  }

class Utils {
  constructor() { }

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
