import { execSync } from 'child_process';
import path from 'path';

export default function globalSetup() {
  const root = path.resolve(import.meta.dirname, '..', '..');
  // Reset DB to clean state with only seed users
  execSync('npx tsx src/backend/db/migrate.ts', { cwd: root, stdio: 'inherit' });
}
