import { createTool } from "@voltagent/core";
import fetch from "node-fetch";
import { z } from "zod";

export const discussionTool = createTool({
  name: "discussionSearch",
  description:
    "Main theme to search (examples: ai, coding, psychology, sociology, relationships, digital marketing, kenya, etc.)",
  parameters: z.object({
    topic: z
      .string()
      .describe(
        "Main theme to search (examples: ai, coding, psychology, sociology, relationships, digital marketing, kenya, etc.)"
      ),
    maxResults: z
      .number()
      .min(1)
      .max(5)
      .default(3)
      .describe("Number of results to return"),
  }),
  execute: async ({ topic, maxResults }) => {
    const trustedSources = [
      "quora.com",
      "reddit.com",
      "quora.com/q/Artificial-Intelligence",
      "quora.com/q/Machine-Learning",
      "quora.com/q/Human-Psychology",
      "quora.com/q/Love-Relationships",
      "quora.com/q/Social-Sciences",
      "reddit.com/r/artificial",
      "reddit.com/r/MachineLearning",
      "reddit.com/r/learnprogramming",
      "reddit.com/r/relationships",
      "reddit.com/r/psychology",
      "reddit.com/r/sociology",
      "reddit.com/r/AmItheAsshole",
      "reddit.com/r/Kenya",
    ];

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: topic,
        max_results: maxResults,
        include_domains: trustedSources,
      }),
    });

    if (!res.ok) {
      throw new Error(`Tavily API error: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return `No results found for ${topic} on Quora/Reddit.`;
    }

    return data.results.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.snippet || "",
    }));
  },
});
