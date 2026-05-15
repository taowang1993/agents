#!/usr/bin/env node

const url = process.argv[2];

if (!url) {
  console.log("Usage: content.js <url>");
  console.log("\nExtracts readable text content from a webpage via Exa's contents endpoint.");
  console.log("\nExamples:");
  console.log("  content.js https://example.com/article");
  console.log("  content.js https://docs.exa.ai/reference/search-api-guide-for-coding-agents");
  process.exit(1);
}

const apiKey = process.env.EXA_API_KEY;
if (!apiKey) {
  console.error("Error: EXA_API_KEY environment variable is required.");
  console.error("Get your API key at: https://dashboard.exa.ai/api-keys");
  process.exit(1);
}

async function fetchContent(url) {
  const body = {
    ids: [url],
    text: { maxCharacters: 15000 },
    highlights: { numSentences: 5, query: "What is this page about?" },
  };

  const response = await fetch("https://api.exa.ai/contents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

try {
  const data = await fetchContent(url);

  if (data.results && data.results.length > 0) {
    const r = data.results[0];

    if (r.title) {
      console.log(`# ${r.title}\n`);
    }
    if (r.publishedDate) {
      console.log(`*Published: ${r.publishedDate}*`);
    }
    if (r.author) {
      console.log(`*Author: ${r.author}*\n`);
    }

    if (r.text) {
      console.log(r.text);
    } else if (r.highlights && r.highlights.length > 0) {
      console.log("## Highlights\n");
      for (const h of r.highlights) {
        console.log(`- ${h}`);
      }
    } else {
      console.log("(No content extracted)");
    }

    if (data.costDollars?.total) {
      console.error(`\nCost: $${data.costDollars.total.toFixed(5)}`);
    }
  } else {
    console.error("No content found for this URL.");
    process.exit(1);
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}
