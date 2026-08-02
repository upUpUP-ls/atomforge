import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { randomUUID } from 'node:crypto';

/**
 * 本地 SQLite：走 prisma migrate deploy。
 * Turso（libsql://）：Prisma CLI 不支持，改用 libsql 客户端执行 migration.sql。
 */
async function migrateTurso(databaseUrl) {
  const client = createClient({ url: databaseUrl });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);

  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  const migrationDirs = fs
    .readdirSync(migrationsDir)
    .filter((name) =>
      fs.statSync(path.join(migrationsDir, name)).isDirectory(),
    )
    .sort();

  for (const migrationName of migrationDirs) {
    const applied = await client.execute({
      sql: 'SELECT "id" FROM "_prisma_migrations" WHERE "migration_name" = ? LIMIT 1',
      args: [migrationName],
    });

    if (applied.rows.length > 0) {
      console.log(`[migrate] skip ${migrationName}`);
      continue;
    }

    const sqlPath = path.join(migrationsDir, migrationName, 'migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean);

    console.log(`[migrate] apply ${migrationName}`);
    for (const statement of statements) {
      await client.execute(statement);
    }

    await client.execute({
      sql: `
        INSERT INTO "_prisma_migrations"
          ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
        VALUES (?, ?, datetime('now'), ?, datetime('now'), 1)
      `,
      args: [randomUUID(), 'turso-manual', migrationName],
    });
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? '';

  if (databaseUrl.startsWith('file:')) {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    return;
  }

  if (databaseUrl.startsWith('libsql:')) {
    await migrateTurso(databaseUrl);
    return;
  }

  console.log('[migrate] skip: unsupported DATABASE_URL scheme');
}

main().catch((error) => {
  console.error('[migrate] failed:', error);
  process.exit(1);
});
