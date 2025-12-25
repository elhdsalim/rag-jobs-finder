import "./env";

import { promises as fs } from "fs";

import { enrichJobs, fetchJobs } from "./pipeline/fetchJobs";
import { initDb, saveJobs } from "./db/db";

async function main() {
    const db = await initDb();
    const { minimalJobs, tasks } = await fetchJobs();
    const enrichedJobs = enrichJobs(minimalJobs, tasks);

    await fs.writeFile("./data.json",JSON.stringify(enrichedJobs, null, 2),"utf-8");
    await saveJobs(db, enrichedJobs);

    console.log(`${enrichedJobs.length} jobs saved to database`);

}

main()