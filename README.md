
# RAG Job Search Experiment

The idea is simple : standard keyword searches (like "Frontend Developer") miss a lot of context. I wanted to see if I could fetch real job postings, store them locally, and match them against a full user profile using **vector embeddings** instead.

## How it works
1.  **Fetch:** Pulls job listings from Google Jobs via the DataForSEO API.
2.  **Store:** Normalizes the data and stores it into a SQLite database (`jobs.db`).
3.  **Embed:** Generates embeddings for the job descriptions using OpenAI.
4.  **Match:** Takes a user profile (example: "I like React and small teams"), embeds it, and runs a similarity search to find the best offers.

## Stack
* **Runtime:** TypeScript / Node.js
* **DB:** SQLite
* **Data:** DataForSEO API.
* **AI:** OpenAI Embeddings.

---

## Getting Started

### Installation & Configuration

Install dependencies :
```bash
npm install
npm run build
````

Create a `.env` file in the root directory. You'll need credentials for DataForSEO and OpenAI:

```env
DATAFORSEO_USERNAME=your_username
DATAFORSEO_PASSWORD=your_password

DATAFORSEO_KEYWORDS="frontend stage paris, developpeur web paris"
OPENAI_API_KEY=sk-...
```

## Usage

### Step 1: Scrape & Save

Fetches the jobs and creates the SQLite DB.

```bash
node dist/index.js
```

### Step 2: Embedding

Reads the local DB and generates embeddings for the job descriptions.

```bash
node dist/rag/run_embedding.js
```

### Step 3: Search

Compares the defined profile with the database and prints the top matches with similarity scores.

```bash
node dist/rag/retrieve_jobs.js
```

