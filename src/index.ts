import * as fs from 'fs';
import { fetchJobs } from "./pipeline/fetchJobs";


async function main() {
    const jobs = await fetchJobs();
    
    await fs.promises.writeFile( "./data.json", JSON.stringify(jobs, null, 2), "utf-8");
}

main()