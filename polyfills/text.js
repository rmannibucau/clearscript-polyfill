globalThis.TextEncoder = class TextEncoder {
  encode(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3f));
      } else if (code < 0xd800 || code >= 0xe000) {
        bytes.push(0xe0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      } else {
        // surrogate pair
        i++;
        code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (code >> 18));
        bytes.push(0x80 | ((code >> 12) & 0x3f));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      }
    }
    return new Uint8Array(bytes);
  }
  get encoding() {
    return 'utf-8';
  }
};

globalThis.TextDecoder = class TextDecoder {
  constructor(encoding = 'utf-8') {
    this.encoding = encoding;
  }
  decode(buf) {
    const bytes = new Uint8Array(
      buf instanceof ArrayBuffer ? buf : (buf.buffer ?? buf),
    );
    let str = '';
    let i = 0;
    while (i < bytes.length) {
      let code;
      const b = bytes[i++];
      if (b < 0x80) {
        code = b;
      } else if (b < 0xe0) {
        code = ((b & 0x1f) << 6) | (bytes[i++] & 0x3f);
      } else if (b < 0xf0) {
        code =
          ((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
      } else {
        code =
          ((b & 0x07) << 18) |
          ((bytes[i++] & 0x3f) << 12) |
          ((bytes[i++] & 0x3f) << 6) |
          (bytes[i++] & 0x3f);
      }
      if (code > 0xffff) {
        code -= 0x10000;
        str += String.fromCharCode(
          0xd800 + (code >> 10),
          0xdc00 + (code & 0x3ff),
        );
      } else {
        str += String.fromCharCode(code);
      }
    }
    return str;
  }
};
