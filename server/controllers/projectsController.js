const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM projects ORDER BY id DESC');
}

function getById(id) {
  return queryOne('SELECT * FROM projects WHERE id = ?', [id]);
}

function create(data) {
  const { name, description, technologies, project_url, github_url, contributions, start_date, end_date } = data;
  const result = execute(
    'INSERT INTO projects (name, description, technologies, project_url, github_url, contributions, start_date, end_date) VALUES (?,?,?,?,?,?,?,?)',
    [name, description || null, technologies || null, project_url || null, github_url || null, contributions || null, start_date || null, end_date || null]
  );
  return getById(result.lastInsertRowid);
}

function update(id, data) {
  const { name, description, technologies, project_url, github_url, contributions, start_date, end_date } = data;
  execute(
    `UPDATE projects SET name=?, description=?, technologies=?, project_url=?, github_url=?, contributions=?, start_date=?, end_date=?, updated_at=datetime('now') WHERE id=?`,
    [name, description || null, technologies || null, project_url || null, github_url || null, contributions || null, start_date || null, end_date || null, id]
  );
  return getById(id);
}

function remove(id) {
  execute('DELETE FROM projects WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
