import "../env";
import OpenAI from "openai";
import { openDb } from "../db/db";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function main() {
    const db = await openDb();

    const HOURS = 168; // 1 week
    const since = new Date(
        Date.now() - HOURS * 60 * 60 * 1000
    ).toISOString();

    const jobs = await db.all(
        `
        SELECT
            title,
            location,
            employer_name,
            salary,
            timestamp,
            source_url
        FROM jobs
        WHERE created_at >= ?
        ORDER BY created_at DESC
        LIMIT 50
        `,
        [since]
    );

    if (jobs.length === 0) {
        console.log("Aucune offre récente trouvée.");
        return;
    }

    const jobsContext = jobs
        .map(
            (job, i) =>
                `
    [JOB ${i + 1}]
    Title: ${job.title}
    Company: ${job.employer_name ?? "unknown"}
    Location: ${job.location}
    Salary: ${job.salary ?? "unknown"}
    Date: ${job.timestamp}
    URL: ${job.source_url}
    `.trim()
        )
        .join("\n\n");

    const userProfile = `
    Je suis étudiant de L3 Informatique.
    J’aime surtout :
    - JavaScript / TypeScript
    - Node.js
    - React
    - Vue.js

    Je cherche des offres d'emploi pertinentes et adaptées à ce que j'aime.
  `.trim();

    const response = await client.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
            {
                role: "system",
                content: `
    Tu es un assistant de recherche d’emploi intelligent.

    Ta mission :
    - Lire les offres fournies
    - Les comparer au profil utilisateur
    - Sélectionner les offres les PLUS pertinentes
    - Expliquer brièvement POURQUOI

    Ne parle QUE des offres pertinentes.
        `.trim()
            },
            {
                role: "user",
                content: `
            PROFIL UTILISATEUR :
            ${userProfile}

            OFFRES RÉCENTES :
            ${jobsContext}

            Question :
            Y a-t-il des offres intéressantes pour ce profil ?
            Si oui, lesquelles et pourquoi ?
        `.trim()
            }
        ]
    });

    console.log("\n=== ANSWER ===\n");
    console.log(response.choices[0].message.content);
}

main();
