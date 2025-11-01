const pool = require('../config/db');

const createUser = async (name, email, phone, password) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, phone, password]
  );
  return result.rows[0];
};

module.exports = { createUser };
