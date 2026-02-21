globalThis.fetch = (input, init = {}) => {
  const url = input instanceof Request ? input.url : String(input);
  const method = (
    init.method || (input instanceof Request ? input.method : 'GET')
  ).toUpperCase();

  // collect headers
  const headersObj = {};
  const h = init.headers || (input instanceof Request ? input.headers : null);
  if (h instanceof Headers) {
    h.forEach((v, k) => (headersObj[k] = v));
  } else if (h) {
    Object.assign(headersObj, h);
  }

  // collect body
  let body = init.body || (input instanceof Request ? input.body : undefined);
  if (body instanceof Uint8Array) {
    body = new TextDecoder().decode(body);
  } else if (body instanceof ArrayBuffer) {
    body = new TextDecoder().decode(new Uint8Array(body));
  } else if (body) {
    body = String(body);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    // set headers after open
    Object.entries(headersObj).forEach(([k, v]) => {
      try {
        xhr.setRequestHeader(k, v);
      } catch {}
    });

    try {
      xhr.onload = () => {
        const responseText = xhr.responseText;
        const status = xhr.status;
        const responseHeaders = new Headers();
        const raw = xhr.getAllResponseHeaders();
        if (raw) {
          raw
            .trim()
            .split('\r\n')
            .forEach((line) => {
              const idx = line.indexOf(': ');
              if (idx > 0) {
                const key = line.substring(0, idx);
                const val = line.substring(idx + 2);
                responseHeaders.set(key, val);
              }
            });
        }
        resolve({
          ok: status >= 200 && status < 300,
          status,
          headers: responseHeaders,
          text: async () => responseText,
          json: async () => JSON.parse(responseText),
          arrayBuffer: async () =>
            new TextEncoder().encode(responseText).buffer,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode(responseText));
              controller.close();
            },
          }),
        });
      };
      xhr.onerror = () => reject(new Error('Network request failed'));
      xhr.ontimeout = () => reject(new Error('Network request timed out'));
      xhr.send(body);
    } catch (e) {
      reject(e);
    }
  });
};
