const { queryAll, queryOne, execute } = require('../database/init');

async function getAll() {
  return await queryAll('SELECT * FROM skills ORDER BY category, name');
}

async function getById(id) {
  return await queryOne('SELECT * FROM skills WHERE id = ?', [id]);
}

async function create(data) {
  const { name, category, proficiency } = data;
  const result = await await execute(
    'INSERT INTO skills (name, category, proficiency) VALUES (?,?,?)',
    [name, category || 'technical', proficiency || 'intermediate']
  );
  return await getById(result.lastInsertRowid);
}

async function update(id, data) {
  const { name, category, proficiency } = data;
  await execute(
    'UPDATE skills SET name=?, category=?, proficiency=? WHERE id=?',
    [name, category || 'technical', proficiency || 'intermediate', id]
  );
  return await getById(id);
}

async function remove(id) {
  await execute('DELETE FROM skills WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
