const bcrypt = require('bcrypt');

/**
 * Modello User in-memory (placeholder per DB reale)
 * In un'implementazione reale questo file userebbe un ORM (es. Sequelize/Prisma).
 */

const USERS = [];

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

async function hashPassword(plainPassword) {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

async function createUser({ id, email, password, status = USER_STATUS.ACTIVE, roles = [] }) {
  const passwordHash = await hashPassword(password);
  const user = { id, email: email.toLowerCase(), passwordHash, status, roles };
  USERS.push(user);
  return user;
}

function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.toLowerCase();
  return USERS.find((u) => u.email === normalized) || null;
}

function findUserById(id) {
  return USERS.find((u) => u.id === id) || null;
}

async function verifyPassword(user, plainPassword) {
  if (!user || !plainPassword) return false;
  return bcrypt.compare(plainPassword, user.passwordHash);
}

function getPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    roles: user.roles || [],
    status: user.status
  };
}

// Seed utente demo solo per ambiente di sviluppo / test
async function seedDemoUsers() {
  if (USERS.length > 0) return;

  await createUser({
    id: '1',
    email: 'admin@example.com',
    password: 'Admin1234!',
    roles: ['ADMIN'],
    status: USER_STATUS.ACTIVE
  });

  await createUser({
    id: '2',
    email: 'user@example.com',
    password: 'User1234!',
    roles: ['USER'],
    status: USER_STATUS.ACTIVE
  });
}

module.exports = {
  USER_STATUS,
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  getPublicUser,
  seedDemoUsers
};
