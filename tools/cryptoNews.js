import { createTool } from "@voltagent/core";
import fetch from "node-fetch";
import { z } from "zod";

export const cryptoNewsTool = createTool({
  name: "cryptoNewsSearch",
  description:
    "Fetch latest Web3, DeFi, and crypto market/company news from trusted sources.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Search query, e.g., 'new crypto project', 'ETH price', 'DeFi startup'."
      ),
  }),
  execute: async ({ query }) => {
    const apiKey = process.env.TAVILY_API_KEY;

    const trustedSources = [
      "crypto.news",
      "coindesk.com",
      "cointelegraph.com",
      "decrypt.co",
      "theblock.co",
      "thedefiant.io",
      "bankless.com",
      "dlnews.com",
      "coinmarketcap.com",
      "coingecko.com",
      "messari.io",
      "cryptoslate.com",
    ];

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        max_results: 5,
        include_domains: trustedSources,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })),
    };
  },
});
