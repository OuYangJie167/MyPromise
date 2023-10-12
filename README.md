# MyPromise

> 简单实现一个**Promise**，增加对 Promise 的理解。

## 方法

1. then

   > Promise 的后续处理

2. resolve

   > 标记当前任务完成

3. reject

   > 标记当前任务失败

4. catch

   > 仅处理任务失败场景

5. finally

### 静态方法

1. Promise.resolve(data)

   > 返回一个完成状态的任务

2. Promise.reject(reason)

   > 返回一个拒绝状态的任务

3. Promise.all(任务数组)

   > 返回一个任务，任务数组全成功则成功；任何一个失败则失败。

4. Promise.allSettled(任务数组)

   > 返回一个任务，任务数组全部已决则成功；该任务不会失败。

5. Promise.race(任务数组)

   > 返回一个任务任务数组任一已决则已决，状态和其一致
