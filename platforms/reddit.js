import "dotenv/config";
import snoowrap from "snoowrap";
import { Agent } from "@voltagent/core";
import { google } from "@ai-sdk/google";
import { discussionTool } from "../tools/discussionTool.js";
import { themes } from "../tools/themes.js";
import { retry } from "../utils/retry.js";
function pickRandomTheme() {
  return themes[Math.floor(Math.random() * themes.length)];
}

// Initialize the AI Reddit Agent
const redditAgent = new Agent({
  name: "Reddit Story Rewriter",
  model: google("gemini-2.5-pro", {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }),
  instructions: `
You are a skilled Reddit storyteller and rewriter.
Steps:
1. Use the discussionSearch tool to fetch a REAL Quora/Reddit post for the given theme.
2. Read the original story carefully. Preserve the **core experience and authenticity**, but make it more engaging:
   - Expand with **vivid details** and **sensory descriptions**.
   - Add **emotional depth**: highlight fear, joy, confusion, or wonder.
   - Maintain a **Reddit-style casual tone**, as if telling it to a friend.
   - Break into **short, easy-to-read paragraphs**.
   - End with a **thought-provoking or funny discussion question** that invites comments.
4. Return only JSON in this format:
   {
     "title": "catchy and curiosity-driven",
     "body": "engaging, 3–6 paragraphs, conversational style",
   }
`,
  tools: [discussionTool],
});

export async function runRedditAgent() {
  const { topic } = pickRandomTheme();

  let result;
  try {
    result = await retry(() =>
      redditAgent.generateText(
        `Fetch a ${topic} story from Quora/Reddit and rewrite it as a Reddit post.`
      )
    );
  } catch (err) {
    console.error("❌ AI generation failed:", err);
    return;
  }

  const res = result.text;
  console.log("📝 AI raw output:", res);

  const cleanRes = res
    .replace(/```json\s*/g, "")
    .replace(/```/g, "")
    .trim();

  let post;
  try {
    post = JSON.parse(cleanRes);
  } catch (err) {
    console.error("❌ Failed to parse AI response:", err);
    return;
  }

  const { title, body } = post;

  if (!title || !body) {
    console.error("❌ Missing title or body, aborting post.");
    return;
  }

  // Initialize Reddit client
  const reddit = new snoowrap({
    userAgent: "weird-stories-bot",
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });

  try {
    const me = await reddit.getMe();
    const profileSubreddit = `u_${me.name}`;

    const submission = await reddit
      .getSubreddit(profileSubreddit)
      .submitSelfpost({
        title,
        text: body,
      });
    console.log(
      "✅ Posted to Reddit:",
      `https://reddit.com${submission.permalink}`
    );
  } catch (err) {
    console.error("❌ Reddit post failed:", err);
    return;
  }
}
