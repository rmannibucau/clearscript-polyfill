globalThis.Headers = class Headers {
  constructor(init = {}) {
    this._headers = {};
    if (init instanceof Headers) {
      init.forEach((v, k) => this.set(k, v));
    } else if (Array.isArray(init)) {
      init.forEach(([k, v]) => this.set(k, v));
    } else {
      Object.entries(init).forEach(([k, v]) => this.set(k, v));
    }
  }
  _key(k) {
    return k.toLowerCase();
  }
  set(k, v) {
    this._headers[this._key(k)] = String(v);
  }
  get(k) {
    return this._headers[this._key(k)] ?? null;
  }
  has(k) {
    return this._key(k) in this._headers;
  }
  append(k, v) {
    const key = this._key(k);
    this._headers[key] = this._headers[key]
      ? this._headers[key] + ', ' + v
      : String(v);
  }
  delete(k) {
    delete this._headers[this._key(k)];
  }
  forEach(cb) {
    Object.entries(this._headers).forEach(([k, v]) => cb(v, k, this));
  }
  entries() {
    return Object.entries(this._headers)[Symbol.iterator]();
  }
  keys() {
    return Object.keys(this._headers)[Symbol.iterator]();
  }
  values() {
    return Object.values(this._headers)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
};
globalThis.Request = class Request {
  constructor(input, init = {}) {
    if (input instanceof Request) {
      this.url = input.url;
      this.method = input.method;
      this.headers = new Headers(input.headers);
      this.body = input.body;
      this.signal = input.signal;
    } else {
      this.url = String(input);
      this.method = (init.method || 'GET').toUpperCase();
      this.headers = new Headers(init.headers || {});
      this.body = init.body ?? null;
      this.signal = init.signal ?? null;
    }
    this.mode = init.mode || 'cors';
    this.credentials = init.credentials || 'same-origin';
    this.cache = init.cache || 'default';
    this.redirect = init.redirect || 'follow';
    this.referrer = init.referrer || '';
    this.integrity = init.integrity || '';
  }

  async text() {
    if (!this.body) {
      return '';
    }
    if (typeof this.body === 'string') {
      return this.body;
    }
    const decoder = new TextDecoder();
    if (this.body instanceof Uint8Array) {
      return decoder.decode(this.body);
    }
    return String(this.body);
  }

  async json() {
    return JSON.parse(await this.text());
  }

  async arrayBuffer() {
    if (!this.body) {
      return new ArrayBuffer(0);
    }
    if (this.body instanceof ArrayBuffer) {
      return this.body;
    }
    const encoder = new TextEncoder();
    const bytes =
      typeof this.body === 'string' ? encoder.encode(this.body) : this.body;
    return bytes.buffer;
  }

  clone() {
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
      signal: this.signal,
      mode: this.mode,
      credentials: this.credentials,
    });
  }
};
