#!/usr/bin/env node

const args = process.argv.slice(2);

// Parse options
let numResults = 5;
let searchType = "auto";
let includeHighlights = true;
let includeText = false;
let includeSummary = false;
let category = null;
let includeDomains = null;
let excludeDomains = null;
let startDate = null;
let endDate = null;
let country = null;
let maxAgeHours = undefined;
let outputSchema = null;
let systemPrompt = null;

const booleanFlags = {
  "--text": () => { includeText = true; includeHighlights = false; return true; },
  "--highlights": () => { includeHighlights = true; return true; },
  "--summary": () => { includeSummary = true; return true; },
};

const valuedFlags = {
  "-n": (v) => { numResults = parseInt(v, 10); return true; },
  "--type": (v) => { searchType = v; return true; },
  "--category": (v) => { category = v; return true; },
  "--include-domains": (v) => { includeDomains = v.split(",").map(s => s.trim()).filter(Boolean); return true; },
  "--exclude-domains": (v) => { excludeDomains = v.split(",").map(s => s.trim()).filter(Boolean); return true; },
  "--start-date": (v) => { startDate = v; return true; },
  "--end-date": (v) => { endDate = v; return true; },
  "--country": (v) => { country = v.toUpperCase(); return true; },
  "--max-age": (v) => { maxAgeHours = parseInt(v, 10); return true; },
  "--output-schema": (v) => { try { outputSchema = JSON.parse(v); } catch { console.error("Invalid JSON for --output-schema"); process.exit(1); } return true; },
  "--system-prompt": (v) => { systemPrompt = v; return true; },
};

const queryParts = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (booleanFlags[arg]) {
    booleanFlags[arg]();
  } else if (valuedFlags[arg]) {
    if (i + 1 < args.length) {
      valuedFlags[arg](args[++i]);
    }
  } else if (arg.startsWith("--")) {
    const eqIdx = arg.indexOf("=");
    if (eqIdx !== -1) {
      const flag = arg.slice(0, eqIdx);
      const val = arg.slice(eqIdx + 1);
      if (valuedFlags[flag]) valuedFlags[flag](val);
    }
  } else {
    queryParts.push(arg);
  }
}

const query = queryParts.join(" ").trim();

if (!query) {
  console.log("Usage: search.js <query> [options]");
  console.log("");
  console.log("Options:");
  console.log("  -n <num>                 Number of results (default: 5, max: 100)");
  console.log("  --type <type>            Search type: auto, fast, instant, deep-lite, deep, deep-reasoning");
  console.log("  --text                   Return full page text as markdown");
  console.log("  --highlights             Return key excerpts (default)");
  console.log("  --summary                Return LLM-generated summary");
  console.log("  --category <cat>         Filter: company, people, research paper, news, personal site, financial report");
  console.log("  --include-domains <d1,d2> Only results from these domains");
  console.log("  --exclude-domains <d1,d2> Exclude these domains");
  console.log("  --start-date <ISO>       Only results published after this date");
  console.log("  --end-date <ISO>         Only results published before this date");
  console.log("  --country <code>         Two-letter country code (e.g. US, DE)");
  console.log("  --max-age <hours>        Max age of cached content (0 = always livecrawl)");
  console.log("  --output-schema <json>   JSON schema for structured output");
  console.log("  --system-prompt <text>   Instructions for synthesized output");
  console.log("");
  console.log("Environment:");
  console.log("  EXA_API_KEY              Required. Your Exa API key.");
  console.log("");
  console.log("Examples:");
  console.log('  search.js "latest AI research"');
  console.log('  search.js "quantum computing breakthroughs" -n 10 --text');
  console.log('  search.js "agtech startups" --category company');
  console.log('  search.js "AI regulation" --category news --include-domains reuters.com,bbc.com');
  console.log('  search.js "React 19 features" --type deep --output-schema \'{"type":"object","properties":{"features":{"type":"array","items":{"type":"string"}}}}\'');
  process.exit(1);
}

const apiKey = process.env.EXA_API_KEY;
if (!apiKey) {
  console.error("Error: EXA_API_KEY environment variable is required.");
  console.error("Get your API key at: https://dashboard.exa.ai/api-keys");
  process.exit(1);
}

const VALID_TYPES = ["auto", "fast", "instant", "deep-lite", "deep", "deep-reasoning"];
if (!VALID_TYPES.includes(searchType)) {
  console.error(`Error: Invalid search type "${searchType}". Must be one of: ${VALID_TYPES.join(", ")}`);
  process.exit(1);
}

function buildContents() {
  const contents = {};
  if (includeText) {
    contents.text = { maxCharacters: 10000 };
  }
  if (includeHighlights) {
    contents.highlights = true;
  }
  if (includeSummary) {
    contents.summary = true;
  }
  if (maxAgeHours !== undefined) {
    contents.maxAgeHours = maxAgeHours;
  }
  return Object.keys(contents).length > 0 ? contents : { highlights: true };
}

async function search() {
  const body = {
    query,
    type: searchType,
    numResults: Math.min(numResults, 100),
    contents: buildContents(),
  };

  if (category) body.category = category;
  if (includeDomains) body.includeDomains = includeDomains;
  if (excludeDomains) body.excludeDomains = excludeDomains;
  if (startDate) body.startPublishedDate = startDate;
  if (endDate) body.endPublishedDate = endDate;
  if (country) body.userLocation = country;
  if (outputSchema) body.outputSchema = outputSchema;
  if (systemPrompt) body.systemPrompt = systemPrompt;

  const response = await fetch("https://api.exa.ai/search", {
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

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Main
try {
  const data = await search();

  // Print synthesized output if present (deep search)
  if (data.output?.content) {
    console.log("=== Synthesized Output ===");
    if (typeof data.output.content === "string") {
      console.log(data.output.content);
    } else {
      console.log(JSON.stringify(data.output.content, null, 2));
    }
    if (data.output.grounding) {
      console.log("\n--- Sources ---");
      for (const g of data.output.grounding) {
        if (g.citations) {
          for (const c of g.citations) {
            console.log(`  [${g.confidence || "unknown"} confidence] ${c.title}: ${c.url}`);
          }
        }
      }
    }
    console.log("");
  }

  // Print individual results
  if (data.results && data.results.length > 0) {
    for (let i = 0; i < data.results.length; i++) {
      const r = data.results[i];
      console.log(`--- Result ${i + 1} ---`);
      console.log(`Title: ${r.title || "(untitled)"}`);
      console.log(`Link: ${r.url}`);
      if (r.publishedDate) {
        console.log(`Published: ${formatDate(r.publishedDate)}`);
      }
      if (r.author) {
        console.log(`Author: ${r.author}`);
      }

      if (r.highlights && r.highlights.length > 0) {
        console.log(`Highlights:`);
        for (const h of r.highlights) {
          console.log(`  • ${h}`);
        }
      }

      if (r.summary) {
        console.log(`Summary: ${r.summary}`);
      }

      if (r.text) {
        console.log(`Text:\n${r.text.substring(0, 5000)}`);
        if (r.text.length > 5000) {
          console.log(`  ... (truncated, ${r.text.length} total chars)`);
        }
      }

      console.log("");
    }
  } else if (!data.output?.content) {
    console.log("No results found.");
  }

  // Print cost if available
  if (data.costDollars?.total) {
    console.error(`Cost: $${data.costDollars.total.toFixed(5)}`);
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}
