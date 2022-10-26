import { Transform } from './transform';
import { addListener } from "./default";
import { TD_Object } from "./objects/object";
import { ICorner, Point, TCorner } from "./point";
import Utils from "./utils";

export interface ICanvasOptions {
  width: number;
  height: number;
}

export class Canvas {
  public lowerCanvasEl: HTMLCanvasElement;  // 底层, 可见层, 负责: 渲染可见图形
  public upperCanvasEl: HTMLCanvasElement;  // 顶层, 隐藏层, 负责: 渲染隐藏图形, 事件交互
  public lowerContext: CanvasRenderingContext2D;
  public upperContext: CanvasRenderingContext2D;
  public width: number;
  public height: number;
  public wrapperEl: HTMLDivElement;
  public viewportTransform: Array<number>;

  private _scaleRatio: number;
  private _graph: Map<string, TD_Object>;  // 随机颜色->图形对象
  private _utils: Utils;
  private _target: TD_Object;
  private _eventListeners: { [key: string]: Array<Function> };
  private _offsetTop: number;   // canvas 离顶部的距离
  private _offsetLeft: number;  // canvas 离左边的距离
  private _currentTransform: Transform;

  // private: 只能给本类定义访问，子类不能访问，本类实例也无法访问。
  // protected: 只能在本类和子类中访问，本类实例也不能访问
  // public: 到处都能访问
  // 本类的实例，比如: const c = new Canvas();  c._utils.xxxx。

  constructor(el: string, options?: ICanvasOptions) {
    this._utils = new Utils();
    this._graph = new Map();
    this._target = null;
    this._eventListeners = {};
    this._initStatic(el, options);
    this._initInteractive();
    this.viewportTransform = [1, 0, 0, 1, 0, 0];
  }

  public add(object: TD_Object) {
    this.saveObjectInMap(object);
    this.requestRenderAll();
  }

  public requestRenderAll() {
    this._utils.requestAnimFrame(this.renderCanvas.bind(this, this.lowerContext));
  }

  public renderCanvas(ctx: CanvasRenderingContext2D) {
    // 清空画布
    this._clearContext(this.lowerContext);
    this._clearContext(this.upperContext);
    // 存储状态
    ctx.save();
    // 重新绘制所有图形
    this._graph.forEach((object, randomColor) => {
      object.render(this.lowerContext, this.upperContext, randomColor);
      object.setCanvas(this);
    });
    // 如果有选中的图形，绘制选中状态
    if (this._target) {
      this._drawTargetControls();
    }
    // 恢复状态
    ctx.restore();
  }

  private _clearContext(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
  }

  public on(eventName: string, handler: Function) {
    if (!this._eventListeners[eventName]) {
      this._eventListeners[eventName] = [];
    }
    this._eventListeners[eventName].push(handler);
  }

  private _initRetinaScaling() {
    this._scaleRatio = window.devicePixelRatio || 2;
    this.__initRetinaScaling(this._scaleRatio, this.lowerCanvasEl, this.lowerContext);
    if (this.upperCanvasEl) {
      this.__initRetinaScaling(this._scaleRatio, this.upperCanvasEl, this.upperContext);
    }
  }

  private __initRetinaScaling(scaleRatio: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    canvas.setAttribute('width', String(this.width * scaleRatio));
    canvas.setAttribute('height', String(this.height * scaleRatio));
    context.scale(scaleRatio, scaleRatio);
  }

  private calcOffsetTopAndLeft(el: HTMLElement) {
    let offsetTop = 0;
    let offsetLeft = 0;

    while (el) {
      offsetTop += el.offsetTop;  // 离 offsetParent 的顶部内边距的距离
      offsetLeft += el.offsetLeft;  // 离 offsetParent 的左侧内边距的距离
      el = el.offsetParent as HTMLElement;  // 最近的定位父级
    }

    this._offsetLeft = offsetLeft;
    this._offsetTop = offsetTop;
  }

  private saveObjectInMap(object: TD_Object) {
    let randomColor = this._utils.getRandomHexColor();
    while (this._graph.has(randomColor)) {
      randomColor = this._utils.getRandomHexColor();
    }
    this._graph.set(randomColor, object);
    object.setHiddenFill(randomColor);
  }

  private _initStatic(el: string, options?: ICanvasOptions) {
    this._createLowerCanvas(el, options);
    this._initOptions(options);
  }

  private _initInteractive() {
    this._initWrapperElement();
    this._createUpperCanvas();
    this._initEventListeners();
    this._initRetinaScaling();
  }

  private _initEventListeners() {
    addListener(this.lowerCanvasEl, 'mousedown', this._onMouseDown.bind(this), false);
    addListener(this.lowerCanvasEl, 'mousemove', this._onMouseMove.bind(this), false);
    addListener(this.lowerCanvasEl, 'mouseup', this._onMouseUp.bind(this), false);
  }

  private _onMouseDown(e: MouseEvent) {
    this._getTarget(e);
    this._setTargetCorner(e);
    this._setupCurrentTransform(e, this._target, false);
    this._handleEvent(e, 'down');
    this.requestRenderAll();
  }

  private _onMouseUp() {
    this._resetCurrentTransform();
  }

  private _onMouseMove(e: MouseEvent) {
    if (!this._currentTransform || !this._target) {
      return;
    }
    this._transformObject(e);
  }

  private _transformObject(e: MouseEvent) {
    // 获取点击位置
    const pointer = this._getPointer(e);
    // 设置 target 对象的平移/缩放 
    this._performTransformAction(e, this._currentTransform, pointer);
    // 擦除画布重新绘制
    this.requestRenderAll();
  }

  private _setTargetCorner(e: MouseEvent) {
    if (!this._target) {
      return;
    }
    // 检查鼠标的位置，是否在`选中图形`的某个边角控制点范围内
    const p = this._getPointer(e);
    const oCoords = this._target.oCoords;

    // 寻找控制点
    for (const key in oCoords) {
      const c = oCoords[key].corner as ICorner;
      const bl = c.bl;
      const br = c.br;
      const tl = c.tl;
      const tr = c.tr;
      // canvas坐标系
      // x从左往右指，y从上往下指
      if (p.x >= bl.x && p.x <= br.x && p.y >= tl.y && p.y <= bl.y) {
        this._target.corner = key as TCorner;
        return;
      }
    }

    this._target.corner = null;
  }

  private _resetCurrentTransform() {
    this._currentTransform = null;
  }

  private _performTransformAction(e: MouseEvent, transform: Transform, pointer: Point) {
    if (!transform || !pointer) {
      return;
    }
    if (transform.action) {
      // 缩放
      this._utils.scaleHandler(e, transform, pointer, this._offsetLeft, this._offsetTop);
    } else {
      // 平移
      this._utils.translateHandler(e, transform, pointer);
    }
  }

  private _getPointer(e: MouseEvent) {
    return new Point(e.clientX, e.clientY);
  }

  private _setupCurrentTransform(e: MouseEvent, target: TD_Object, alreadySelected: boolean) {
    if (!target) {
      return;
    }
    const point = this._getPointer(e);
    const transform = new Transform(target, point);
    this._currentTransform = transform;
  }

  private _drawTargetControls() {
    if (this._target) {
      this._target.drawControls(this.lowerContext, this.upperContext);
    }
  }

  private _getTarget(e: MouseEvent) {
    const ctx = this.upperContext;
    const x = e.clientX - this._offsetLeft;
    const y = e.clientY - this._offsetTop;
    const rgb = ctx.getImageData(x * this._scaleRatio, y * this._scaleRatio, 1, 1).data;
    const hex = this._utils.rgbToHex(rgb[0], rgb[1], rgb[2]);
    const target = this._graph.get(hex);

    if (target) {
      this._target = target;
    } else {
      this._target = null;
    }
  }

  private _handleEvent(e: MouseEvent, eventType: string) {
    const payload = { e: e, target: this._target };
    this._fire('mouse:' + eventType, payload);
  }

  private _fire(eventName: string, payload: Object) {
    const listeners = this._eventListeners[eventName];
    if (!listeners) {
      return;
    }
    for (let i = 0, len = listeners.length; i < len; i++) {
      const cb = listeners[i];
      if (cb) {
        cb.call(this, payload);
      }
    }
  }

  private _createCanvasElement() {
    var element = document.createElement('canvas');
    if (!element) {
      throw new Error('Could not initialize `canvas` element');
    }
    if (typeof element.getContext === 'undefined') {
      throw new Error('Could not initialize `canvas` element');
    }
    return element;
  }

  private _createUpperCanvas() {
    var lowerCanvasEl = this.lowerCanvasEl, upperCanvasEl = this.upperCanvasEl;
    if (!upperCanvasEl) {
      upperCanvasEl = this._createCanvasElement();
      this.upperCanvasEl = upperCanvasEl;
    }
    upperCanvasEl.className = lowerCanvasEl.className;
    upperCanvasEl.setAttribute('id', 'hidden');
    upperCanvasEl.setAttribute('class', 'upper-canvas');
    upperCanvasEl.setAttribute('data-fabric', 'top');
    this.wrapperEl.appendChild(upperCanvasEl);
    this._copyCanvasStyle(lowerCanvasEl, upperCanvasEl);
    this._applyCanvasStyle(upperCanvasEl);
    upperCanvasEl.setAttribute('draggable', 'true');
    this.upperContext = upperCanvasEl.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    this.calcOffsetTopAndLeft(upperCanvasEl);
  }

  private _copyCanvasStyle(fromEl: HTMLElement, toEl: HTMLElement) {
    toEl.style.cssText = fromEl.style.cssText;
  }

  private _applyCanvasStyle(element: HTMLCanvasElement) {
    var width = this.width || element.width, height = this.height || element.height;
    this._utils.setStyle(element, {
      visibility: 'hidden',
      position: 'absolute',
      width: width + 'px',
      height: height + 'px',
      left: 0,
      top: 0,
    });
    element.width = width;
    element.height = height;
    this._utils.makeElementUnselectable(element);
  }

  private _initWrapperElement() {
    if (this.wrapperEl) {
      return;
    }
    const container = document.createElement('div');
    container.classList.add('canvas-container');
    this.wrapperEl = this._utils.wrapElement(this.lowerCanvasEl, container);
    this.wrapperEl.setAttribute('data-fabric', 'wrapper');
    this._utils.setStyle(this.wrapperEl, {
      width: this.width + 'px',
      height: this.height + 'px',
      position: 'relative'
    });
    this._utils.makeElementUnselectable(this.wrapperEl);
  }

  private _createLowerCanvas(el: string, option?: ICanvasOptions) {
    this.lowerCanvasEl = document.getElementById(el) as HTMLCanvasElement;
    this.lowerCanvasEl.classList.add('lower-canvas');
    this.lowerCanvasEl.setAttribute('data-fabric', 'main');
    this.lowerContext = this.lowerCanvasEl.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  }

  private _initOptions(options: ICanvasOptions) {
    var lowerCanvasEl = this.lowerCanvasEl;
    this.width = this.width || parseInt(lowerCanvasEl.width.toString(), 10) || 0;
    this.height = this.height || parseInt(lowerCanvasEl.height.toString(), 10) || 0;
    if (!this.lowerCanvasEl.style) {
      return;
    }
    lowerCanvasEl.width = this.width;
    lowerCanvasEl.height = this.height;
    lowerCanvasEl.style.width = this.width + 'px';
    lowerCanvasEl.style.height = this.height + 'px';
  }
}
