const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const moduleInstance = { exports: {} };
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/config/catalog.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module: moduleInstance, exports: moduleInstance.exports });
const { normalizeCatalogItem: normalize } = moduleInstance.exports;
test('populated service categories and durations match the public UI', () => {
  const item = normalize('/services', { _id: 's1', categoryId: { _id: 'c1', name: 'Care' }, duration: 90, image: '/service.jpg' });
  assert.equal(item.id, 's1');
  assert.equal(item.categoryId, 'c1');
  assert.equal(item.category.id, 'c1');
  assert.equal(item.duration, '90 minutes');
  assert.equal(item.imageUrl, '/service.jpg');
});
test('spare part category and zero-stock availability are preserved', () => {
  const item = normalize('/spare-parts', { _id: 'p1', categoryTag: 'filters', stock: 0, images: ['/part.jpg'] });
  assert.equal(item.category, 'filters');
  assert.equal(item.inStock, false);
  assert.equal(item.imageUrl, '/part.jpg');
});
test('MongoDB car locations render as text and fuel filters match', () => {
  const item = normalize('/used-cars', { _id: 'car1', fuelType: 'PETROL', location: { city: 'Delhi', state: 'Delhi' } });
  assert.equal(item.location, 'Delhi, Delhi');
  assert.equal(item.city, 'Delhi');
  assert.equal(item.fuelType, 'Petrol');
  assert.equal(normalize('/used-cars', { fuelType: 'CNG' }).fuelType, 'CNG');
});
