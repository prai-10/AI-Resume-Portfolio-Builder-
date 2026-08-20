const { queryAll, queryOne, execute } = require('../database/init');

async function getAll() {
  return await queryAll('SELECT * FROM links ORDER BY platform');
}

async function getById(id) {
  return await queryOne('SELECT * FROM links WHERE id = ?', [id]);
}

async function create(data) {
  const { platform, url, label } = data;
  const result = await await execute(
    'INSERT INTO links (platform, url, label) VALUES (?,?,?)',
    [platform, url, label || null]
  );
  return await getById(result.lastInsertRowid);
}

async function update(id, data) {
  const { platform, url, label } = data;
  await execute(
    'UPDATE links SET platform=?, url=?, label=? WHERE id=?',
    [platform, url, label || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  await execute('DELETE FROM links WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
