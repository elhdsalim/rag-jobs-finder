import { getJobsOffers, waitForAllTasks } from "../services/dataforseo";
import { EnrichedJobData, MinimalJobData, Task } from "../types/types";

export async function fetchJobs(): Promise<{ minimalJobs: MinimalJobData[]; tasks: Task[]; }> {
    const taskIds = await getJobsOffers();
    const tasks = await waitForAllTasks(taskIds);

    const minimalJobs = extractMinimalJobsData(tasks);

    return {
        minimalJobs,
        tasks
    };
}

function extractMinimalJobsData(tasks: Task[]): MinimalJobData[] {
    const jobs: MinimalJobData[] = [];

    for (const task of tasks) {
        if (!task.result || task.result.length === 0) continue;

        const items = task.result[0].items;

        for (const item of items) {
            if (!item.job_id || !item.title || !item.location || !item.source_url) {
                continue;
            }

            jobs.push({
                job_id: item.job_id,
                title: item.title,
                location: item.location,
                source_url: item.source_url,
            });
        }
    }

    return jobs;
}

function buildJobIndex(tasks: Task[]): Map<string, any> {
    const map = new Map<string, any>();

    for (const task of tasks) {
        if (!task.result?.length) continue;

        for (const item of task.result[0].items) {
            if (item.job_id) {
                map.set(item.job_id, item);
            }
        }
    }

    return map;
}


export function enrichJobs( minimalJobs: MinimalJobData[], tasks: Task[]): EnrichedJobData[] {
    const index = buildJobIndex(tasks);

    return minimalJobs.map(job => {
        const enriched = index.get(job.job_id);

        return {
            ...job,
            employer_name: enriched?.employer_name,
            source_name: enriched?.source_name,
            contract_type: enriched?.contract_type,
            salary: enriched?.salary ?? null,
            timestamp: enriched?.timestamp ? new Date(enriched.timestamp).toISOString() : null,
            employer_url: enriched?.employer_url ?? null,
        };
    });
}
