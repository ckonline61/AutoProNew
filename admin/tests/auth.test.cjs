const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the real provider against controlled API responses, without a browser.
function harness(api, initial = {}) {
  const storage = new Map(Object.entries(initial));
  const effects = [];
  const states = [];
  let context;
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useContext: () => context,
    useState: value => {
      const slot = states.length;
      states.push(typeof value === 'function' ? value() : value);
      return [states[slot], next => { states[slot] = next; }];
    },
    useEffect: effect => effects.push(effect),
    createElement: (_type, props) => { context = props.value; return null; },
  };
  const module = { exports: {} };
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/contexts/AuthContext.tsx'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require: name => name === 'react' ? react : name === '../config/api' ? api : {},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key),
    },
  });
  module.exports.AuthProvider({ children: null });
  return { auth: context, storage, effects, states };
}
const admin = { id: 'admin', role: 'ADMIN', name: 'Admin' };

test('uses the backend nested access token and revokes refresh token on logout', async () => {
  let logoutBody;
  const h = harness({ post: async (url, body) => {
    if (url === '/auth/logout') { logoutBody = body; return {}; }
    return { data: { data: { user: admin, tokens: { accessToken: 'real-token', refreshToken: 'refresh-token' } } } };
  } });
  await h.auth.login('admin@example.test', 'test-password');
  assert.equal(h.storage.get('admin_token'), 'real-token');
  await h.auth.logout();
  assert.equal(logoutBody.refreshToken, 'refresh-token');
  assert.equal(h.storage.has('admin_token'), false);
  assert.equal(h.storage.has('admin_refresh_token'), false);
});

test('a failed API login never creates a fake admin session', async () => {
  const h = harness({ post: async () => { throw new Error('Invalid credentials'); } });
  await assert.rejects(h.auth.login('x@example.test', 'wrong'), /Invalid credentials/);
  assert.equal(h.storage.has('admin_token'), false);
});

test('customer credentials cannot enter the admin portal', async () => {
  const h = harness({ post: async () => ({ data: { data: { user: { role: 'CUSTOMER' }, tokens: { accessToken: 'customer-token' } } } }) });
  await assert.rejects(h.auth.login('customer@example.test', 'test'), /administrator account/);
  assert.equal(h.storage.has('admin_token'), false);
});

test('missing tokens cannot become a successful session', async () => {
  const h = harness({ post: async () => ({ data: { data: { user: admin } } }) });
  await assert.rejects(h.auth.login('admin@example.test', 'test'), /invalid login response/);
  assert.equal(h.storage.has('admin_token'), false);
});

test('restoring a rejected token clears the session', async () => {
  const h = harness({ get: async () => { throw new Error('Expired token'); } }, { admin_token: 'expired' });
  h.effects[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.storage.has('admin_token'), false);
  assert.equal(h.states[0], null);
  assert.equal(h.states[1], null);
});
