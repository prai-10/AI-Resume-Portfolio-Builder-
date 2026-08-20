const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM certifications ORDER BY date DESC');
}

function getById(id) {
  return queryOne('SELECT * FROM certifications WHERE id = ?', [id]);
}

function create(data) {
  const { name, organization, date, credential_url, credential_id } = data;
  const result = execute(
    'INSERT INTO certifications (name, organization, date, credential_url, credential_id) VALUES (?,?,?,?,?)',
    [name, organization, date || null, credential_url || null, credential_id || null]
  );
  return getById(result.lastInsertRowid);
}

function update(id, data) {
  const { name, organization, date, credential_url, credential_id } = data;
  execute(
    'UPDATE certifications SET name=?, organization=?, date=?, credential_url=?, credential_id=? WHERE id=?',
    [name, organization, date || null, credential_url || null, credential_id || null, id]
  );
  return getById(id);
}

function remove(id) {
  execute('DELETE FROM certifications WHERE id = ?', [id]);
}

module.exports = { getAll, getById, create, update, remove };
