import { getDb, saveDb, closeDb } from './connection.js';
import { initializeSchema } from './schema.js';

const SEED_USERS = [
  { username: 'alice', display_name: 'Alice Johnson' },
  { username: 'bob', display_name: 'Bob Smith' },
  { username: 'carol', display_name: 'Carol Williams' },
  { username: 'dave', display_name: 'Dave Brown' },
  { username: 'eve', display_name: 'Eve Davis' },
];

async function migrate() {
  console.log('Initializing database...');
  const db = await getDb();

  initializeSchema(db);
  console.log('Schema created.');

  const existing = db.exec('SELECT COUNT(*) as count FROM users');
  const count = existing[0]?.values[0]?.[0] as number;

  if (count === 0) {
    const stmt = db.prepare('INSERT INTO users (username, display_name) VALUES (?, ?)');
    for (const user of SEED_USERS) {
      stmt.run([user.username, user.display_name]);
    }
    stmt.free();
    console.log(`Seeded ${SEED_USERS.length} users.`);
  } else {
    console.log(`Users already exist (${count}). Skipping seed.`);
  }

  saveDb();
  closeDb();
  console.log('Database ready.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
