import { getDb, saveDb, closeDb } from './connection.js';
import { initializeSchema } from './schema.js';

const SEVERITIES = ['P1', 'P2', 'P3', 'P4'];
const STATUSES = ['Open', 'Investigating', 'Resolved', 'Closed'];
const SERVICES = [
  'api-gateway', 'auth-service', 'payment-service', 'notification-service',
  'search-engine', 'cdn', 'database-cluster', 'cache-layer',
  'user-service', 'analytics-pipeline',
];
const TITLES = [
  'Connection pool exhausted on {service}',
  'High latency detected in {service}',
  'Memory leak causing OOM on {service}',
  '{service} returning 503 errors',
  'SSL certificate expiring on {service}',
  'Disk space critical on {service}',
  'Failed health checks on {service}',
  'Rate limiting misconfigured on {service}',
  'DNS resolution failures for {service}',
  'Deployment rollback needed on {service}',
  '{service} pod crash loop detected',
  'Data replication lag on {service}',
  'Queue backlog growing on {service}',
  'Timeout errors spiking on {service}',
  '{service} CPU usage at 95%',
  'Unexpected null responses from {service}',
  'Configuration drift detected on {service}',
  'Monitoring gap identified for {service}',
  'Dependency failure affecting {service}',
  'Autoscaling not triggering for {service}',
];
const NOTES = [
  'Investigating root cause.',
  'Restarted affected pods.',
  'Rolled back to previous version.',
  'Applied hotfix, monitoring.',
  'Scaled up replicas as mitigation.',
  'Root cause: misconfigured environment variable.',
  'Engaged on-call DBA for assistance.',
  'Customer-facing impact confirmed.',
  'Runbook followed, waiting for propagation.',
  'Post-fix verification in progress.',
];

const SEED_USERS = [
  { username: 'alice', display_name: 'Alice Johnson' },
  { username: 'bob', display_name: 'Bob Smith' },
  { username: 'carol', display_name: 'Carol Williams' },
  { username: 'dave', display_name: 'Dave Brown' },
  { username: 'eve', display_name: 'Eve Davis' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function minutesAgo(minutes: number): string {
  const d = new Date(Date.now() - minutes * 60_000);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

async function demoSeed() {
  console.log('Creating demo database with 100 incidents...');
  const db = await getDb();
  initializeSchema(db);

  // Seed users if needed
  const existing = db.exec('SELECT COUNT(*) FROM users');
  const count = existing[0]?.values[0]?.[0] as number;
  if (count === 0) {
    const stmt = db.prepare('INSERT INTO users (username, display_name) VALUES (?, ?)');
    for (const u of SEED_USERS) {
      stmt.run([u.username, u.display_name]);
    }
    stmt.free();
  }

  // Clear existing incidents + timeline
  db.run('DELETE FROM timeline_entries');
  db.run('DELETE FROM incidents');

  const userIds = [1, 2, 3, 4, 5];

  for (let i = 1; i <= 100; i++) {
    const service = pick(SERVICES);
    const title = pick(TITLES).replace('{service}', service);
    const severity = pick(SEVERITIES);
    const creatorId = pick(userIds);
    const createdMinutesAgo = randomInt(10, 10080); // 10 min to 7 days ago
    const createdAt = minutesAgo(createdMinutesAgo);

    // Decide final status with realistic distribution
    const statusRoll = Math.random();
    let finalStatus: string;
    if (statusRoll < 0.25) finalStatus = 'Open';
    else if (statusRoll < 0.50) finalStatus = 'Investigating';
    else if (statusRoll < 0.80) finalStatus = 'Resolved';
    else finalStatus = 'Closed';

    const ownerId = finalStatus === 'Open' && Math.random() < 0.4
      ? null
      : pick(userIds);

    const updatedAt = finalStatus === 'Open'
      ? createdAt
      : minutesAgo(randomInt(1, createdMinutesAgo));

    db.run(
      `INSERT INTO incidents (id, title, description, severity, status, owner_id, affected_service, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [i, title, `Auto-generated incident #${i} for demo purposes.`, severity, finalStatus, ownerId, service, creatorId, createdAt, updatedAt]
    );

    // Timeline: created entry
    db.run(
      `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content, created_at)
       VALUES (?, ?, 'created', ?, ?)`,
      [i, creatorId, `Incident created with severity ${severity}`, createdAt]
    );

    // If not Open, add status change + optional note
    if (finalStatus !== 'Open') {
      const changeTime = minutesAgo(randomInt(1, createdMinutesAgo - 1) || 1);
      db.run(
        `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content, created_at)
         VALUES (?, ?, 'status_change', ?, ?)`,
        [i, pick(userIds), `Status changed from Open to ${finalStatus}`, changeTime]
      );

      if (Math.random() < 0.6) {
        db.run(
          `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content, created_at)
           VALUES (?, ?, 'note', ?, ?)`,
          [i, pick(userIds), pick(NOTES), minutesAgo(randomInt(1, createdMinutesAgo - 2) || 1)]
        );
      }
    }

    // If assigned, add assignment entry
    if (ownerId) {
      const assignTime = minutesAgo(randomInt(1, createdMinutesAgo - 1) || 1);
      const ownerResult = db.exec('SELECT display_name FROM users WHERE id = ?', [ownerId]);
      const ownerName = ownerResult[0]?.values[0]?.[0] as string;
      db.run(
        `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content, created_at)
         VALUES (?, ?, 'assignment', ?, ?)`,
        [i, pick(userIds), `Assigned to ${ownerName}`, assignTime]
      );
    }
  }

  saveDb();
  closeDb();

  console.log('Demo seed complete: 100 incidents with varied statuses, severities, and timeline entries.');
}

demoSeed().catch((err) => {
  console.error('Demo seed failed:', err);
  process.exit(1);
});
