import { getJobsOffers, waitForAllTasks } from "../services/dataforseo";
import { MinimalJobData, Task } from "../types/types";

export async function fetchJobs(): Promise<MinimalJobData[]> {
    const taskIds = await getJobsOffers();
    const tasks = await waitForAllTasks(taskIds);

    const minimalJobData = extractMinimalJobsData(tasks);

    return minimalJobData;
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
