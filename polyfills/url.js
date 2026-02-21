globalThis.URL = class URL {
  constructor(url, base) {
    if (base) {
      // naive base+relative join
      url = base.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
    }
    const m = url.match(
      /^(([a-z][a-z0-9+\-.]*):\/\/([^/:?#]*)(?::(\d+))?)?([^?#]*)(\?[^#]*)?(#.*)?$/i,
    );
    this.href = url;
    this.protocol = (m[2] || 'https') + ':';
    this.host = m[3] || '';
    this.port = m[4] || '';
    this.pathname = m[5] || '/';
    this.search = m[6] || '';
    this.hash = m[7] || '';
    this.hostname = this.host;
    this.origin =
      this.protocol + '//' + this.host + (this.port ? ':' + this.port : '');
    this.username = '';
    this.password = '';
    this.searchParams = new URLSearchParams(this.search.slice(1));
  }
  toString() {
    return this.href;
  }
};
globalThis.URLSearchParams = class URLSearchParams {
  constructor(init = '') {
    this._params = {};
    if (typeof init === 'string') {
      init
        .split('&')
        .filter(Boolean)
        .forEach((p) => {
          const [k, v] = p.split('=');
          this._params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
    }
  }
  get(k) {
    return this._params[k] ?? null;
  }
  set(k, v) {
    this._params[k] = v;
  }
  has(k) {
    return k in this._params;
  }
  append(k, v) {
    this._params[k] = v;
  }
  toString() {
    return Object.entries(this._params)
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
      .join('&');
  }
  [Symbol.iterator]() {
    return Object.entries(this._params)[Symbol.iterator]();
  }
};
