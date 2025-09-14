import { runTwitterAgent } from "./platforms/twitter.js";
import { runRedditAgent } from "./platforms/reddit.js";
(async () => {
  try {
    await runRedditAgent();
    await runTwitterAgent();
    console.log("✅ Tweet posted successfully. Exiting...");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running Twitter agent:", error);
    process.exit(1);
  }
})();
