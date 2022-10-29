import { Canvas as C } from './canvas';
import { Rect as R } from './objects/rect';
import { Circle as Ci } from './objects/circle';
import { Path as P } from './objects/path';
import { Triangle as Tr } from './objects/triangle';

namespace tdEngine {
  export class Canvas extends C { }
  export class Rect extends R { }
  export class Circle extends Ci { }
  export class Path extends P { }
  export class Triangle extends Tr {}
}

export default tdEngine;