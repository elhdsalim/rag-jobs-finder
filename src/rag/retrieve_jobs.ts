import "../env";
import OpenAI from "openai";
import { openDb } from "../db/db";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function similarity(a: number[], b: number[]) {
    let score = 0;
    for (let i = 0; i < a.length; i++) {
        score += a[i] * b[i];
    }
    return score;
}

async function main() {
    const db = await openDb();

    const profile = `
Étudiant L3 informatique.
Développeur web.
JavaScript, TypeScript, React, Node.js.
Recherche stage ou premier emploi.
Basé à Lille.
    `.trim();

    const profileEmbeddingRes = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: profile
    });

    const profileEmbedding = profileEmbeddingRes.data[0].embedding;

    const jobs = await db.all(`
        SELECT job_id, title, location, employer_name, source_url, embedding
        FROM jobs
        WHERE embedding IS NOT NULL
    `);

    const scored = jobs.map(job => {
        const jobEmbedding = JSON.parse(job.embedding);
        return {
            job,
            score: similarity(profileEmbedding, jobEmbedding)
        };
    });

    const top = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    console.log("\n🎯 Jobs les plus proches du profil :\n");
    for (const { job, score } of top) {
        console.log(`- ${job.title} (${job.location})`);
        console.log(`  ${job.employer_name ?? "unknown"}`);
        console.log(`  score: ${score.toFixed(2)}`);
        console.log(`  ${job.source_url}\n`);
    }
}

main();
