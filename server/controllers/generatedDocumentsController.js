const { queryAll, queryOne, execute } = require('../database/init');

function getAll() {
  return queryAll('SELECT * FROM generated_documents ORDER BY created_at DESC').map(parseDoc);
}

function getById(id) {
  const doc = queryOne('SELECT * FROM generated_documents WHERE id = ?', [id]);
  return doc ? parseDoc(doc) : null;
}

function create(data) {
  const { type, title, target_role, target_company, job_description, template, content, metadata } = data;
  const result = execute(
    'INSERT INTO generated_documents (type, title, target_role, target_company, job_description, template, content, metadata) VALUES (?,?,?,?,?,?,?,?)',
    [
      type, title || null, target_role || null, target_company || null,
      job_description || null, template || null,
      typeof content === 'object' ? JSON.stringify(content) : content,
      metadata ? JSON.stringify(metadata) : null
    ]
  );
  return getById(result.lastInsertRowid);
}

function remove(id) {
  execute('DELETE FROM generated_documents WHERE id = ?', [id]);
}

function parseDoc(doc) {
  try { doc.content = JSON.parse(doc.content); } catch (e) { /* leave as string */ }
  try { doc.metadata = doc.metadata ? JSON.parse(doc.metadata) : null; } catch (e) { doc.metadata = null; }
  return doc;
}

module.exports = { getAll, getById, create, remove };
