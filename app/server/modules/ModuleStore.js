const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'modules.json');

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readAll() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function save(module) {
  const modules = readAll();
  const idx = modules.findIndex(m => m.id === module.id);
  if (idx >= 0) modules[idx] = module;
  else modules.push(module);
  fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2), 'utf-8');
  return module;
}

function getById(id) {
  return readAll().find(m => m.id === id) || null;
}

function remove(id) {
  const modules = readAll().filter(m => m.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2), 'utf-8');
}

module.exports = { readAll, save, getById, remove };
