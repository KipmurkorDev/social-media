export async function retry(fn, retries = 6, delay = 2000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      // Check if error is retryable
      if (err.statusCode === 503 || err.isRetryable) {
        attempt++;
        console.warn(`⚠ Attempt ${attempt} failed: ${err.message}`);
        if (attempt === retries) throw err;
        // Exponential backoff
        await new Promise((res) => setTimeout(res, delay * attempt));
      } else {
        // Non-retryable error, throw immediately
        throw err;
      }
    }
  }
}
