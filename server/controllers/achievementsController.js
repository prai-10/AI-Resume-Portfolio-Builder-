const { queryAll, queryOne, execute } = require('../database/init');

async function getAll() {
  return await queryAll('SELECT * FROM achievements ORDER BY id DESC');
}

async function getById(id) {
  return await queryOne('SELECT * FROM achievements WHERE id = ?', [id]);
}

async function create(data) {
  const { title, description, date } = data;
  const result = await await execute(
    'INSERT INTO achievements (title, description, date) VALUES (?,?,?)',
    [title, description || null, date || null]
  );
  return await getById(result.lastInsertRowid);
}

async function update(id, data) {
  const { title, description, date } = data;
  await execute(
    'UPDATE achievements SET title=?, description=?, date=? WHERE id=?',
    [title, description || null, date || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  await execute('DELETE FROM achievements WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
