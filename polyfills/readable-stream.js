globalThis.ReadableStream = class ReadableStream {
  constructor(source = {}) {
    this._source = source;
    this._chunks = [];
    this._done = false;
    this._error = null;
    this._controller = {
      enqueue: (chunk) => this._chunks.push(chunk),
      close: () => {
        this._done = true;
      },
      error: (e) => {
        this._error = e;
      },
    };
    if (source.start) {
      source.start(this._controller);
    }
  }

  getReader() {
    let index = 0;
    const stream = this;

    return {
      read: async () => {
        if (stream._error) {
          throw stream._error;
        }

        if (index < stream._chunks.length) {
          return { value: stream._chunks[index++], done: false };
        }

        if (stream._done) {
          return { value: undefined, done: true };
        }

        // pull-based
        if (stream._source.pull) {
          await stream._source.pull(stream._controller);
          if (index < stream._chunks.length) {
            return { value: stream._chunks[index++], done: false };
          }
        }

        return { value: undefined, done: true };
      },
      releaseLock: () => {},
      cancel: async () => {},
    };
  }

  async *[Symbol.asyncIterator]() {
    const reader = this.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  cancel() {
    this._done = true;
  }
};
