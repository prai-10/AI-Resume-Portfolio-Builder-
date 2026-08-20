const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM links ORDER BY platform');
}

function getById(id) {
  return queryOne('SELECT * FROM links WHERE id = ?', [id]);
}

function create(data) {
  const { platform, url, label } = data;
  const result = execute(
    'INSERT INTO links (platform, url, label) VALUES (?,?,?)',
    [platform, url, label || null]
  );
  return getById(result.lastInsertRowid);
}

function update(id, data) {
  const { platform, url, label } = data;
  execute(
    'UPDATE links SET platform=?, url=?, label=? WHERE id=?',
    [platform, url, label || null, id]
  );
  return getById(id);
}

function remove(id) {
  execute('DELETE FROM links WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
