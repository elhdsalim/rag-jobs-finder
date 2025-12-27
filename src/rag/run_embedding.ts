import "../env";
import OpenAI from "openai";
import { openDb } from "../db/db";
import type { Job } from "../types/types";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function jobToText(job: Job): string {
    return `
Title: ${job.title}
Location: ${job.location}
Company: ${job.employer_name ?? "unknown"}
Contract: ${job.contract_type ?? "unknown"}
Salary: ${job.salary ?? "unknown"}
URL: ${job.source_url}
    `.trim();
}

async function main() {
    const db = await openDb();
    const jobs: Job[] = await db.all(`
        SELECT *
        FROM jobs
        WHERE embedding IS NULL
        LIMIT 100
    `);

    if (jobs.length === 0) {
        console.log("Aucun job à embed");
        return;
    }

    const inputs = jobs.map(jobToText);

    const response = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: inputs
    });

    for (let i = 0; i < jobs.length; i++) {
        const embedding = response.data[i].embedding;

        await db.run(
            `
            UPDATE jobs
            SET embedding = ?
            WHERE job_id = ?
            `,
            [JSON.stringify(embedding), jobs[i].job_id]
        );

        console.log("embedded:", jobs[i].job_id);
    }

    console.log(`${jobs.length} jobs embedded`);
}

main();
