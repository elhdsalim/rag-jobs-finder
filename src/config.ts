export const config = {
  dataforseo: {
    username: process.env.DATAFORSEO_USERNAME!,
    password: process.env.DATAFORSEO_PASSWORD!,
    keywords: process.env.DATASEO_KEYWORDS ? process.env.DATASEO_KEYWORDS.split(",").map(k => k.trim()) : []
  }
};