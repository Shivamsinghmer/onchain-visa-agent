/**
 * simple FIFO queue to serialize MCP requests
 */
class Queue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  /**
   * Add a generic task to the queue
   * @param {Function} task - async function returning a promise
   */
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      await task();
    }

    this.processing = false;
  }
}

export default new Queue();
