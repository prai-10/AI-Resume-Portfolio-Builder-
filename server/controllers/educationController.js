const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM education ORDER BY end_year DESC, id DESC');
}

function getById(id) {
  return queryOne('SELECT * FROM education WHERE id = ?', [id]);
}

function create(data) {
  const { degree, institution, start_year, end_year, cgpa, description } = data;
  const result = execute(
    'INSERT INTO education (degree, institution, start_year, end_year, cgpa, description) VALUES (?,?,?,?,?,?)',
    [degree, institution, start_year || null, end_year || null, cgpa || null, description || null]
  );
  return getById(result.lastInsertRowid);
}

function update(id, data) {
  const { degree, institution, start_year, end_year, cgpa, description } = data;
  execute(
    `UPDATE education SET degree=?, institution=?, start_year=?, end_year=?, cgpa=?, description=?, updated_at=datetime('now') WHERE id=?`,
    [degree, institution, start_year || null, end_year || null, cgpa || null, description || null, id]
  );
  return getById(id);
}

function remove(id) {
  execute('DELETE FROM education WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
