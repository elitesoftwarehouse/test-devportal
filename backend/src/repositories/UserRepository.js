import { pool } from '../server/db.js';

export class UserRepository {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async findByActivationToken(token) {
    const result = await pool.query('SELECT * FROM users WHERE activation_token = $1', [token]);
    return result.rows[0] || null;
  }

  async create(user) {
    const query = `
      INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        role,
        status,
        activation_token,
        activation_token_expiration
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;
    const params = [
      user.email,
      user.passwordHash,
      user.firstName,
      user.lastName,
      user.role,
      user.status,
      user.activationToken,
      user.activationTokenExpiration
    ];
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  async activateUserByToken(token) {
    const now = new Date();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'SELECT * FROM users WHERE activation_token = $1 FOR UPDATE',
        [token]
      );
      const user = rows[0];
      if (!user) {
        await client.query('ROLLBACK');
        return { error: 'TOKEN_NOT_FOUND' };
      }
      if (!user.activation_token) {
        await client.query('ROLLBACK');
        return { error: 'TOKEN_ALREADY_USED' };
      }
      if (user.activation_token_expiration && user.activation_token_expiration < now) {
        await client.query('ROLLBACK');
        return { error: 'TOKEN_EXPIRED' };
      }

      const updateResult = await client.query(
        `UPDATE users SET status = $1, activation_token = NULL, activation_token_expiration = NULL
         WHERE id = $2 RETURNING *`,
        ['ACTIVE', user.id]
      );

      await client.query('COMMIT');
      return { user: updateResult.rows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
