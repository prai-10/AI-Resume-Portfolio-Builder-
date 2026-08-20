const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM achievements ORDER BY id DESC');
}

function getById(id) {
  return queryOne('SELECT * FROM achievements WHERE id = ?', [id]);
}

function create(data) {
  const { title, description, date } = data;
  const result = execute(
    'INSERT INTO achievements (title, description, date) VALUES (?,?,?)',
    [title, description || null, date || null]
  );
  return getById(result.lastInsertRowid);
}

function update(id, data) {
  const { title, description, date } = data;
  execute(
    'UPDATE achievements SET title=?, description=?, date=? WHERE id=?',
    [title, description || null, date || null, id]
  );
  return getById(id);
}

function remove(id) {
  execute('DELETE FROM achievements WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
