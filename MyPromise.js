const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

/**
 * 运行一个微队列任务
 * 把传递的函数放到微队列中
 * @param {Function} callback
 */
function runMicroTask(callback) {
  // 判断 node 环境
  if (process && process.nextTick) {
    process.nextTick(callback);
  } else if (MutationObserver) {
    // 浏览器环境
    const p = document.createElement("p");
    const observer = new MutationObserver(callback);
    observer.observe(p, {
      childList: true,
    });
    p.innerHTML = "1";
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * 判断一个数据是否为Promise对象
 * @param {any} obj
 * @returns
 */
function isPromise(obj) {
  return !!(obj && typeof obj === "object" && obj.then === "function");
}

class MyPromise {
  /**
   * 创建一个Promise
   * @param {Function} executor 任务执行器 立即执行
   */
  constructor(executor) {
    this._state = PENDING; // 任务状态
    this._value = undefined; // 数据
    this._handlers = []; // 处理函数形式的队列
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
      console.log(error);
    }
  }

  /**
   * 向处理队列中添加一个函数
   * @param {Function} executor 添加函数
   * @param {*} state 该函数什么状态下执行
   * @param {Fucntion} resolve 让then函数返回的Promise成功
   * @param {Function} reject 让then函数返回的Promise失败
   */
  _pushHandler(executor, state, resolve, reject) {
    this._handlers.push({
      executor,
      state,
      resolve,
      reject,
    });
  }

  /**
   *根据实际情况,执行队列
   */
  _runHandlers() {
    if (this._state === PENDING) {
      return;
    }
    // 遍历每个任务
    while (this._handlers[0]) {
      // 执行单个任务
      this._runOneHandler(handler);
      // 执行完成后删除
      this._handlers.shift();
    }
  }

  /**
   * 处理一个handler
   * @param {Object} handler
   */
  _runOneHandler({ executor, state, resolve, reject }) {
    runMicroTask(() => {
      if (this._state !== state) {
        // 状态不一致, 不处理
        return;
      }
      if (typeof handles.executor !== "function") {
        this._state === FULFILLED ? resolve(this._value) : reject(this._value);
      }
      try {
        const result = executor(this._value);
        if (isPromise(result)) {
          result.then(resolve, reject);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }

  /**
   * Promsie A+ 规范 then
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @returns
   */
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._pushHandler(onFulfilled, FULFILLED, resolve, reject);
      this._pushHandler(onRejected, REJECTED, resolve, reject);
      this._runHandlers(); // 执行队列
    });
  }

  /**
   * 仅处理失败的场景
   * @param {Function} onRejected
   * @returns
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * 无论成功或失败, 都会执行回调
   * @param {Function} onSettled
   * @returns
   */
  finally(onSettled) {
    return this.then(
      (data) => {
        onSettled();
        return data;
      },
      (reason) => {
        onSettled();
        throw reason;
      }
    );
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
    this._runHandlers(); // 状态变化, 执行队列
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

  /**
   * 返回一个已完成的Promise
   * 特殊情况
   * 1. 传递的data本身就是ES6的Promise对象
   * 2. 传递的data是PromiseLike(Promise A+),返回新的Promise,状态与其保持一致即可
   * @param {any} data
   * @returns
   */
  static resolve(data) {
    if (data instanceof MyPromise) {
      return data;
    }
    return new MyPromise((resolve, reject) => {
      if (isPromise(data)) {
        resolve(data);
      } else {
        reject(data);
      }
    });
  }

  /**
   * 得到一个被拒绝的Promise
   * @param {any} reason
   */
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }

  /**
   * 得到一个新的Promise
   * 该Promise的状态取决于proms的执行
   * proms是一个迭代器,包含多个Promise
   * 全部Promise成功,则返回的Promise成功,数据为所有的Promise成功的数据,并且顺序是按照传入的数据排列
   * 只要有一个Promise失败,则返回的Promise失败,失败原因为第一个失败的Promise的原因
   * @param {iterator} proms
   */
  static all(proms) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0; // Promise 的总数
      let fulfilledCount = 0; // 已完成的数量
      for (const p of proms) {
        let index = count;
        count++;
        MyPromise.resolve(p).then((data) => {
          fulfilledCount++;
          results[index] = data;
          if (fulfilledCount === count) {
            resolve(results);
          }
        }, reject);
      }
      if (count === 0) {
        resolve(results);
      }
    }).catch((error) => {
      reject(error);
      console.log(error);
    });
  }

  /**
   *  等待所有的Promise有结果之后
   *  该方法返回的Promise完成
   *  并且按照顺序将所有结果汇总
   * @param {iterator} proms
   */
  static allSettled(proms) {
    const ps = [];
    for (const p of proms) {
      ps.push(
        MyPromise.resolve(p).then(
          (value) => ({
            status: FULFILLED,
            value,
          }),
          (reason) => ({
            status: REJECTED,
            reason,
          })
        )
      );
      return MyPromise.all(ps);
    }
  }

  /**
   * 返回的Promise与第一个有结果的一致
   * @param {iterator}  proms
   */
  static race(proms) {
    return new MyPromise((resolve, reject) => {
      for (const p of proms) {
        MyPromise.resolve(p).then(resolve, reject);
      }
    });
  }
}

const pro = new MyPromise((resolve, reject) => {
  resolve(123);
});
pro.then((data) => {
  console.log(data);
});
console.log(pro);
