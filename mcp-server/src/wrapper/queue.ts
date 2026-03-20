/**
 * Simple FIFO queue to serialize MCP requests
 */
class Queue {
  private queue: (() => Promise<void>)[] = [];
  private processing: boolean = false;

  /**
   * Add a generic task to the queue
   * @param task - async function returning a promise
   */
  async add<T>(task: () => Promise<T>): Promise<T> {
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

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
    }

    this.processing = false;
  }
}

export default new Queue();
