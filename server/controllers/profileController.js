const { queryOne, execute } = require('../database/init');

function getProfile() {
  return queryOne('SELECT * FROM profile WHERE id = 1') || {};
}

function updateProfile(data) {
  const { full_name, email, phone, location, headline, about } = data;
  execute(
    `UPDATE profile SET full_name=?, email=?, phone=?, location=?, headline=?, about=?, updated_at=datetime('now') WHERE id=1`,
    [full_name || null, email || null, phone || null, location || null, headline || null, about || null]
  );
  return getProfile();
}

module.exports = { getProfile, updateProfile };
