import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { EnrichedJobData } from "../types/types";

export async function openDb(): Promise<Database> {
  return open({
    filename: "./jobs.db",
    driver: sqlite3.Database
  });
}

export async function initDb(): Promise<Database> {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      job_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      source_url TEXT NOT NULL,

      employer_name TEXT,
      source_name TEXT,
      contract_type TEXT,
      salary TEXT,
      timestamp TEXT,
      employer_url TEXT,

      -- NULL at the beginning, we will ask to an IA to fill these fields
      role TEXT, -- dev developer ? software engineer ?
      level TEXT, -- senior ? we don't care ?
      stack TEXT, -- react?node?vue?js?python?etc...
      is_tech INTEGER, -- to avoid jobs that are not dev related (for example business analyst or whatever)
      classified_at TEXT, -- date of classification

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

export async function saveJobs(db: Database, jobs: EnrichedJobData[]) {
  const now = new Date().toISOString();

  const stmt = await db.prepare(`
      INSERT INTO jobs (
        job_id,
        title,
        location,
        source_url,
        employer_name,
        source_name,
        contract_type,
        salary,
        timestamp,
        employer_url,
        role,
        level,
        stack,
        is_tech,
        classified_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) -- index of each attributes
      ON CONFLICT(job_id) DO UPDATE SET
        title = excluded.title,
        location = excluded.location,
        source_url = excluded.source_url,
        employer_name = excluded.employer_name,
        source_name = excluded.source_name,
        contract_type = excluded.contract_type,
        salary = excluded.salary,
        timestamp = excluded.timestamp,
        employer_url = excluded.employer_url,
        updated_at = excluded.updated_at
    `);

  for (const job of jobs) {
    await stmt.run(
      job.job_id,
      job.title,
      job.location,
      job.source_url,
      job.employer_name ?? null,
      job.source_name ?? null,
      job.contract_type ?? null,
      job.salary ?? null,
      job.timestamp ?? null,
      job.employer_url ?? null,

      null, // role
      null, // level
      null, // stack
      null, // is_tech
      null, // classified_at

      now,
      now
    );
  }

  await stmt.finalize();
}
