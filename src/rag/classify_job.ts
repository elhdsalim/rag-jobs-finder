import OpenAI from "openai";
import { ROLES, LEVELS, STACK } from "./classification_constants";
import type { Job, ClassifiedJob } from "../types/types";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function classifyJob(job: Job): Promise<ClassifiedJob> {
    const response = await client.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
            {
                role: "system",
                content: `
You are a strict job classifier.

You MUST:
- Reply ONLY with valid JSON
- Use ONLY the allowed values
- NEVER invent technologies
- NEVER add explanations
- If unsure, use "unknown"
        `.trim()
            },
            {
                role: "user",
                content: `
Allowed values (closed lists):

ROLES = ${JSON.stringify(ROLES)}
LEVELS = ${JSON.stringify(LEVELS)}
STACK = ${JSON.stringify(STACK)}

Field rules:

- role:
  frontend → UI / SPA / web front
  backend → API / server / backend logic
  fullstack → explicit fullstack or clear front + back
  data → data engineer / data scientist
  devops → infra / cloud / CI / Docker / Kubernetes
  qa → testing
  unknown → unclear

- level:
  intern → internship / stage / alternance
  junior → junior / entry-level / low salary
  mid → confirmed but not senior
  senior → senior / expert / high responsibility
  lead → lead / principal / manager
  unknown → not inferable

- stack:
  - MUST be an array
  - MUST contain ONLY values from STACK
  - You MAY infer stack from title or URL
  - Do NOT guess or invent technologies

- is_tech:
  - true ONLY if clearly software / dev / data / devops
  - false otherwise

Additional rules:
- Salary MAY help infer level if obvious
- Prefer "unknown" over guessing

Job to classify:

Title: "${job.title}"
URL: "${job.source_url}"
Company: "${job.employer_name ?? "unknown"}"
Contract: "${job.contract_type ?? "unknown"}"
Salary: "${job.salary ?? "unknown"}"

Return JSON in this EXACT format:

{
  "role": string,
  "level": string,
  "stack": string[],
  "is_tech": boolean
}
        `.trim()
            }
        ]
    });

    const content = response.choices[0].message.content;
    if (!content) {
        throw new Error("Empty OpenAI response");
    }

    return JSON.parse(content);
}
