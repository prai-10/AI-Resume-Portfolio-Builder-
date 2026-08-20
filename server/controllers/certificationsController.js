const { queryAll, queryOne, execute } = require('../database/init');

async function getAll() {
  return await queryAll('SELECT * FROM certifications ORDER BY date DESC');
}

async function getById(id) {
  return await queryOne('SELECT * FROM certifications WHERE id = ?', [id]);
}

async function create(data) {
  const { name, organization, date, credential_url, credential_id } = data;
  const result = await await execute(
    'INSERT INTO certifications (name, organization, date, credential_url, credential_id) VALUES (?,?,?,?,?)',
    [name, organization, date || null, credential_url || null, credential_id || null]
  );
  return await getById(result.lastInsertRowid);
}

async function update(id, data) {
  const { name, organization, date, credential_url, credential_id } = data;
  await execute(
    'UPDATE certifications SET name=?, organization=?, date=?, credential_url=?, credential_id=? WHERE id=?',
    [name, organization, date || null, credential_url || null, credential_id || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  await execute('DELETE FROM certifications WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
