import "../env"; // ✅ CORRECT
import { openDb } from "../db/db";
import { classifyJob } from "./classify_job";

async function main() {
    const db = await openDb();

    const jobs = await db.all(`
        SELECT *
        FROM jobs
        WHERE classified_at IS NULL
        LIMIT 1
    `);

    for (const job of jobs) {
        const classified = await classifyJob(job);

        await db.run(`
            UPDATE jobs
            SET
                role = ?,
                level = ?,
                stack = ?,
                is_tech = ?,
                classified_at = ?
            WHERE job_id = ?
        `, [
            classified.role,
            classified.level,
            JSON.stringify(classified.stack),
            classified.is_tech ? 1 : 0,
            new Date().toISOString(),
            job.job_id
        ]);

        console.log("classified:", job);
    }
}

main();
