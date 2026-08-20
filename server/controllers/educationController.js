const { queryAll, queryOne, execute } = require('../database/init');

async function getAll() {
  return await queryAll('SELECT * FROM education ORDER BY end_year DESC, id DESC');
}

async function getById(id) {
  return await queryOne('SELECT * FROM education WHERE id = ?', [id]);
}

async function create(data) {
  const { degree, institution, start_year, end_year, cgpa, description } = data;
  const result = await await execute(
    'INSERT INTO education (degree, institution, start_year, end_year, cgpa, description) VALUES (?,?,?,?,?,?)',
    [degree, institution, start_year || null, end_year || null, cgpa || null, description || null]
  );
  return await getById(result.lastInsertRowid);
}

async function update(id, data) {
  const { degree, institution, start_year, end_year, cgpa, description } = data;
  await execute(
    `UPDATE education SET degree=?, institution=?, start_year=?, end_year=?, cgpa=?, description=?, updated_at=datetime('now') WHERE id=?`,
    [degree, institution, start_year || null, end_year || null, cgpa || null, description || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  await execute('DELETE FROM education WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
