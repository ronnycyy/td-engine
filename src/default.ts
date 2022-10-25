export type TOriginX = 'left' | 'center' | 'right';
export type TOriginY = 'top' | 'center' | 'bottom';

export const kRect = 1 - 0.5522847498;
export const iMatrix = Object.freeze([1, 0, 0, 1, 0, 0]);
export const halfPI = Math.PI / 2;
export const PiBy180 = Math.PI / 180;
export const degreesToRadians = (degrees: number) => (degrees * PiBy180);

export const cos = (angle: number) => {
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

export const sin = (angle: number) => {
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

export function addListener(el: HTMLElement, eventName: keyof HTMLElementEventMap, handler: EventListener, useCapture: boolean) {
  if (el) {
    el.addEventListener(eventName, handler, useCapture);
  }
}