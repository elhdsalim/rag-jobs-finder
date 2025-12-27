export type Task = {
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    cost: number;
    result_count: number;
    path: (string | number)[];
    data: Record<string, any>[];
    result: any[] | null;
};

export type MinimalJobData = {
    job_id: string;
    title: string;
    location: string;
    source_url: string;
};

export type EnrichedJobData = MinimalJobData & {
    employer_name?: string;
    source_name?: string;
    contract_type?: string;
    salary?: string | null;
    timestamp?: string | null;
    employer_url: string | null;
};

export type ClassifiedJob = {
    role: string;
    level: string;
    stack: string[];
    is_tech: boolean;
};

export type Job = {
    job_id: string;
    title: string;
    location: string;
    source_url: string;
    employer_name?: string;
    source_name?: string;
    contract_type?: string;
    salary?: string | null;
    timestamp?: string | null;
    employer_url: string | null;
};
