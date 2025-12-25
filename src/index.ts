import * as fs from 'fs';
import { enrichJobs, fetchJobs } from "./pipeline/fetchJobs";


async function main() {
    const { minimalJobs, tasks } = await fetchJobs();

    const enrichedJobs = enrichJobs(minimalJobs, tasks);

    await fs.promises.writeFile("./data.json",JSON.stringify(enrichedJobs, null, 2),"utf-8");
}

main()