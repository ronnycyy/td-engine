import { EVENT_NAME } from './eventName';
import { Node, Listener } from './listener';
import { EventPayload } from './payload';


export class EventSystem {

  // eventName -> Listener双向链表
  private _map: Map<EVENT_NAME, Listener>;

  constructor() {
    this._map = new Map();
  }

  // 订阅
  public on(eventName: EVENT_NAME, callback: Function) {
    const list = this._map.get(eventName);
    let handler = null;

    if (list) {
      const tail = list.tail;
      const node = new Node(callback, this._map, eventName);
      tail.next = node;
      node.last = tail;
      list.tail = node;
      handler = node;
    }
    else {
      const newHead = new Node(callback, this._map, eventName);
      const newList = new Listener(newHead);
      this._map.set(eventName, newList);
      handler = newHead;
    }

    // 返回回去，用户可以退订
    return handler;
  }

  // 发布
  public emit(eventName: EVENT_NAME, payload: EventPayload) {
    const dbList = this._map.get(eventName);
    if (dbList) {
      let cur = dbList.head;
      while (cur) {
        cur.trigger(payload);
        cur = cur.next;
      }
    }
  }

}
