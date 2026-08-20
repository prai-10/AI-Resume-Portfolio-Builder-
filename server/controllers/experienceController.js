const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM experience ORDER BY is_current DESC, start_date DESC');
}

function getById(id) {
  return queryOne('SELECT * FROM experience WHERE id = ?', [id]);
}

function create(data) {
  const { company, role, start_date, end_date, is_current, responsibilities, achievements, location } = data;
  const result = execute(
    'INSERT INTO experience (company, role, start_date, end_date, is_current, responsibilities, achievements, location) VALUES (?,?,?,?,?,?,?,?)',
    [company, role, start_date || null, end_date || null, is_current ? 1 : 0, responsibilities || null, achievements || null, location || null]
  );
  return getById(result.lastInsertRowid);
}

function update(id, data) {
  const { company, role, start_date, end_date, is_current, responsibilities, achievements, location } = data;
  execute(
    `UPDATE experience SET company=?, role=?, start_date=?, end_date=?, is_current=?, responsibilities=?, achievements=?, location=?, updated_at=datetime('now') WHERE id=?`,
    [company, role, start_date || null, end_date || null, is_current ? 1 : 0, responsibilities || null, achievements || null, location || null, id]
  );
  return getById(id);
}

function remove(id) {
  execute('DELETE FROM experience WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
