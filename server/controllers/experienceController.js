const { queryAll, queryOne, execute } = require('../database/init');

async function getAll() {
  return await queryAll('SELECT * FROM experience ORDER BY is_current DESC, start_date DESC');
}

async function getById(id) {
  return await queryOne('SELECT * FROM experience WHERE id = ?', [id]);
}

async function create(data) {
  const { company, role, start_date, end_date, is_current, responsibilities, achievements, location } = data;
  const result = await await execute(
    'INSERT INTO experience (company, role, start_date, end_date, is_current, responsibilities, achievements, location) VALUES (?,?,?,?,?,?,?,?)',
    [company, role, start_date || null, end_date || null, is_current ? 1 : 0, responsibilities || null, achievements || null, location || null]
  );
  return await getById(result.lastInsertRowid);
}

async function update(id, data) {
  const { company, role, start_date, end_date, is_current, responsibilities, achievements, location } = data;
  await execute(
    `UPDATE experience SET company=?, role=?, start_date=?, end_date=?, is_current=?, responsibilities=?, achievements=?, location=?, updated_at=datetime('now') WHERE id=?`,
    [company, role, start_date || null, end_date || null, is_current ? 1 : 0, responsibilities || null, achievements || null, location || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  await execute('DELETE FROM experience WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
