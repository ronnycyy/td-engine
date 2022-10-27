import { EVENT_NAME } from "./eventName";
import { EventPayload } from "./payload";

// 双向链表
export class Listener {
  public head: Node;
  public tail: Node;

  constructor(head: Node) {
    this.head = head;
    this.tail = head;
  }
}

// 双向链表 结点
export class Node {
  public last: Node | null;
  public next: Node | null;

  private _eventName: EVENT_NAME;
  private _callback: Function;
  private _map: Map<string, Listener>;

  constructor(callback: Function, map: Map<string, Listener>, eventName: EVENT_NAME) {
    this._callback = callback;
    this._map = map;
    this._eventName = eventName;
    this.last = null;
    this.next = null;
  }

  // 退订
  public off() {
    if (this.last) {
      // 删除双向链表的某个结点
      const last = this.last;
      const next = this.next;
      this.last = null;
      this.next = null;
      last.next = next;
      if (next !== null) {
        next.last = last;
      }
    }
    else {
      // 删除头结点
      this._map.set(this._eventName, null);
    }
  }

  // 触发回调
  public trigger(payload: EventPayload) {
    if (!this._callback || Object.prototype.toString.call(this._callback) !== '[object Function]') {
      return;
    }
    // apply 接收一个数组
    // call 接收一个一个的参数
    this._callback.call(null, payload);
  }
}