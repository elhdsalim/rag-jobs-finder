import axios from 'axios';
import { config } from '../config';
import { Task } from '../types/types';
import { sleep } from '../utils';


/**
 * Submits job search tasks for the given keywords.
 * @returns An array of task IDs that can be used to retrieve the results once processing is complete.
 */
export async function getJobsOffers() {
    const tasksData = config.dataforseo.keywords.map(kw => ({
        language_code: "fr",
        location_code: 2250,
        keyword: kw,
        device: "desktop",
        depth: 100
    }));

    const postRes = await axios({
        method: 'post',
        url: 'https://api.dataforseo.com/v3/serp/google/jobs/task_post',
        auth: {
            username: process.env.DATAFORSEO_USERNAME!,
            password: process.env.DATAFORSEO_PASSWORD!
        },
        data: tasksData // dataforseo will answer us for each specific task with its specific id
    });

    const pendingTasksIds = postRes.data.tasks.map((task: Task) => task.id);

    return pendingTasksIds;
}


/**
 * Fetches the current status and result of a DataForSEO task.
 * @param taskId The ID of the task to check.
 * @returns The task object returned by the API.
 */
export async function checkTask(taskId: string) {
    const { data } = await axios.get(
        `https://api.dataforseo.com/v3/serp/google/jobs/task_get/advanced/${taskId}`,
        {
            auth: {
                username: process.env.DATAFORSEO_USERNAME!,
                password: process.env.DATAFORSEO_PASSWORD!
            }
        }
    );

    return data.tasks[0];
}

function isTaskDone(task: Task): boolean {
    return task.status_code === 20000;
}

/**
 * Polls all tasks until they are completed or a timeout is reached.
 * @param taskIds List of task IDs to monitor.
 * @returns All completed tasks.
 * @throws Error if not all tasks complete within the allowed attempts.
 */
async function checkAllTasks(taskIds: string[]) {
    return Promise.all(taskIds.map(checkTask));
}

export async function waitForAllTasks(taskIds: string[]) {
    const ATTEMPTS = 50;

    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
        const tasks = await checkAllTasks(taskIds);

        const allDone = tasks.every(isTaskDone);

        if (allDone) {
            return tasks;
        }

        await sleep(10000);
    }

    throw new Error("Timeout: some tasks never completed");

}