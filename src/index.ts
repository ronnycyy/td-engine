import { Canvas as C } from './canvas';
import { Rect as R } from './objects/rect';
import { Circle as Ci } from './objects/circle';

namespace tdEngine {
  export class Canvas extends C { }
  export class Rect extends R { }
  export class Circle extends Ci { }
}

export default tdEngine;