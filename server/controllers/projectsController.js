const { queryAll, queryOne, execute } = require('../database/init');

async function getAll() {
  return await queryAll('SELECT * FROM projects ORDER BY id DESC');
}

async function getById(id) {
  return await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
}

async function create(data) {
  const { name, description, technologies, project_url, github_url, contributions, start_date, end_date } = data;
  const result = await await execute(
    'INSERT INTO projects (name, description, technologies, project_url, github_url, contributions, start_date, end_date) VALUES (?,?,?,?,?,?,?,?)',
    [name, description || null, technologies || null, project_url || null, github_url || null, contributions || null, start_date || null, end_date || null]
  );
  return await getById(result.lastInsertRowid);
}

async function update(id, data) {
  const { name, description, technologies, project_url, github_url, contributions, start_date, end_date } = data;
  await execute(
    `UPDATE projects SET name=?, description=?, technologies=?, project_url=?, github_url=?, contributions=?, start_date=?, end_date=?, updated_at=datetime('now') WHERE id=?`,
    [name, description || null, technologies || null, project_url || null, github_url || null, contributions || null, start_date || null, end_date || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  await execute('DELETE FROM projects WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
