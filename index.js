import { runTwitterAgent } from "./platforms/twitter";

(async () => {
  try {
    await runTwitterAgent();
    console.log("✅ Tweet posted successfully. Exiting...");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running Twitter agent:", error);
    process.exit(1);
  }
})();
