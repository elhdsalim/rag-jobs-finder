import OpenAI from "openai";
import type { Job } from "../types/types";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function embedJob(job: Job): Promise<number[]> {
    const text = `
Title: ${job.title}
Location: ${job.location}
Company: ${job.employer_name ?? "unknown"}
Contract: ${job.contract_type ?? "unknown"}
Salary: ${job.salary ?? "unknown"}
URL: ${job.source_url}
    `.trim();

    const res = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: text
    });

    return res.data[0].embedding;
}
