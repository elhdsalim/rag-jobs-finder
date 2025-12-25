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

function findEnrichedJob(jobId: string, tasks: Task[]) {
    for (const task of tasks) {
        if (!task.result || task.result.length === 0) continue;

        for (const item of task.result[0].items) {
            if (item.job_id === jobId) {
                return item;
            }
        }
    }

    return null;
}

export function enrichJobs(minimalJobs: MinimalJobData[], tasks: Task[]): EnrichedJobData[] {
    const enrichedJobs: EnrichedJobData[] = [];

    for (const job of minimalJobs) {
        const enrichedJob = findEnrichedJob(job.job_id, tasks);

        enrichedJobs.push({
            ...job,
            employer_name: enrichedJob?.employer_name,
            source_name: enrichedJob?.source_name,
            contract_type: enrichedJob?.contract_type,
            salary: enrichedJob?.salary ?? null,
            timestamp: enrichedJob?.timestamp ?? null,
            employer_url: enrichedJob?.employer_url ?? null,
        });
    }

    return enrichedJobs;
}
