const { queryOne, execute } = require('../database/init');

async function getProfile() {
  return await queryOne('SELECT * FROM profile WHERE id = 1') || {};
}

async function updateProfile(data) {
  const { full_name, email, phone, location, headline, about } = data;
  await execute(
    `UPDATE profile SET full_name=?, email=?, phone=?, location=?, headline=?, about=?, updated_at=datetime('now') WHERE id=1`,
    [full_name || null, email || null, phone || null, location || null, headline || null, about || null]
  );
  return await getProfile();
}

module.exports = { getProfile, updateProfile };
