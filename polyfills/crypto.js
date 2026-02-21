// crypto polyfill using pure JS
import { Sha256 } from '@aws-crypto/sha256-js';

// Minimal crypto.subtle shim for AWS SigV4
globalThis.crypto = {
  getRandomValues(buf) {
    for (let i = 0; i < buf.length; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
    return buf;
  },
  subtle: {
    digest: async (alg, data) => {
      const hash = new Sha256();
      hash.update(new Uint8Array(data));
      return hash.digestSync().buffer;
    },
  },
};
