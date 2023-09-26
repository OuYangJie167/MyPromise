const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
  /**
   * 创建一个Promise
   * @param {Function} executor 任务执行器 立即执行
   */
  constructor(executor) {
    this._state = PENDING; // 任务状态
    this._value = undefined; // 数据
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
    }
  }

  /**
   * 更改任务状态
   * @param {String} newState 更改状态
   * @param {any} value 相关数据
   * @returns
   */
  _changeState(newState, value) {
    if (this._state !== PENDING) {
      return;
    }
    this._state = newState;
    this._value = value;
  }

  /**
   * 标记当前任务完成
   * @param {any} data 任务完成时相关数据
   */
  _resolve(data) {
    this._changeState(FULFILLED, data);
  }
  /**
   * 标记当前任务失败
   * @param {any} reason 任务失败时的相关数据
   */
  _reject(reason) {
    this._changeState(REJECTED, reason);
  }
}

const pro = new MyPromise((resolve, reject) => {
  resolve(123);
});




console.log('ouyangjie 666 ');
console.log('杰哥不要🙅、达咩');
