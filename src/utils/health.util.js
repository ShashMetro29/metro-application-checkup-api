import net from 'node:net';

const DEFAULT_TIMEOUT_MS = 5000;

const nowIso = () => new Date().toISOString();

export async function checkUrlHealth(urlString, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (!urlString) {
    return {
      status: 'UNKNOWN',
      message: 'No URL configured',
      checkedAt: nowIso()
    };
  }

  const startedAt = Date.now();

  try {
    const url = new URL(urlString);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'automatic-health-check-node-api/1.0'
      }
    });

    clearTimeout(timer);

    return {
      status: response.ok ? 'UP' : 'DOWN',
      code: response.status,
      latencyMs: Date.now() - startedAt,
      checkedAt: nowIso(),
      message: response.ok ? 'Request succeeded' : `Request failed with ${response.status}`
    };
  } catch (error) {
    return {
      status: 'DOWN',
      code: null,
      latencyMs: Date.now() - startedAt,
      checkedAt: nowIso(),
      message: error?.name === 'AbortError' ? 'Request timed out' : error?.message || 'Request failed'
    };
  }
}

export async function checkComponentHealth(component, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (component?.endpoint) {
    return checkUrlHealth(component.endpoint, timeoutMs);
  }

  if (component?.host_name && component?.port) {
    const startedAt = Date.now();

    return await new Promise(resolve => {
      const socket = new net.Socket();
      const done = payload => resolve({
        ...payload,
        latencyMs: Date.now() - startedAt,
        checkedAt: nowIso(),
        host: component.host_name,
        port: component.port
      });

      socket.setTimeout(timeoutMs);
      socket.once('connect', () => {
        socket.destroy();
        done({ status: 'UP', message: 'TCP connection successful' });
      });
      socket.once('timeout', () => {
        socket.destroy();
        done({ status: 'DOWN', code: null, message: 'TCP connection timed out' });
      });
      socket.once('error', error => {
        socket.destroy();
        done({ status: 'DOWN', code: error?.code || null, message: error?.message || 'TCP connection failed' });
      });

      socket.connect(component.port, component.host_name);
    });
  }

  return {
    status: 'UNKNOWN',
    message: 'No endpoint or host/port configured',
    checkedAt: nowIso()
  };
}
