import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function embedProfile(profile: string): Promise<number[]> {
    const res = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: profile
    });

    return res.data[0].embedding;
}
