import "dotenv/config";
import { Agent } from "@voltagent/core";
import { google } from "@ai-sdk/google";
import { TwitterApi } from "twitter-api-v2";
import { cryptoNewsTool } from "../tools/cryptoNews.js";

const twitterAgent = new Agent({
  name: "Twitter Agent",
  model: google("gemini-2.5-flash"),
  instructions: `
You are a witty social media assistant for the crypto/Web3 space.
Steps:
1. Use the cryptoNewsSearch tool to fetch the most relevant latest crypto, Web3, or DeFi news.
2. Pick the single most trending or impactful headline.
3. create a tweet that align to the headline provide data if needed.
4. Write a tweet (max 280 chars) that:
   - Mentions the highlight clearly
   - Uses exactly 1 emoji
   - Adds exactly 1 relevant hashtag
   - Is witty and engaging, but still professional
5. Output only the final tweet text, nothing else.
`,
  tools: [cryptoNewsTool],
});

export async function runTwitterAgent() {
  const result = await twitterAgent.generateText(`
As AI, fetch the latest trending crypto/Web3/DeFi news and generate a witty tweet.
Always include 1 emoji, 1 hashtag, and make it under 280 characters.
Return only the tweet text.
  `);

  let tweet = result.text.trim();
  if (tweet.length > 280) {
    tweet = tweet.slice(0, 277) + "…";
  }

  console.log("Generated Tweet:", tweet);

  // 🔓 Uncomment when ready to post
  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  const { data } = await twitterClient.v2.tweet(tweet);
  console.log("✅ Posted to Twitter:", data);
}
