const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM skills ORDER BY category, name');
}

function getById(id) {
  return queryOne('SELECT * FROM skills WHERE id = ?', [id]);
}

function create(data) {
  const { name, category, proficiency } = data;
  const result = execute(
    'INSERT INTO skills (name, category, proficiency) VALUES (?,?,?)',
    [name, category || 'technical', proficiency || 'intermediate']
  );
  return getById(result.lastInsertRowid);
}

function update(id, data) {
  const { name, category, proficiency } = data;
  execute(
    'UPDATE skills SET name=?, category=?, proficiency=? WHERE id=?',
    [name, category || 'technical', proficiency || 'intermediate', id]
  );
  return getById(id);
}

function remove(id) {
  execute('DELETE FROM skills WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
