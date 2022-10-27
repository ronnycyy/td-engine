import { TD_Object } from "../objects/object";

export class EventPayload {
  public e: Event;
  public target: TD_Object;

  constructor(e: Event, target: TD_Object) {
    this.e = e;
    this.target = target;
  }
}
