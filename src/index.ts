#!/usr/bin/env node

/**
 * Gerrit MCP Server
 *
 * A comprehensive Model Context Protocol server that exposes all Gerrit
 * Code Review REST API endpoints as MCP tools.
 *
 * Configuration via environment variables:
 *   GERRIT_BASE_URL  - Gerrit server URL (e.g. https://gerrit.example.com)
 *   GERRIT_USERNAME  - Username for HTTP Basic Auth
 *   GERRIT_PASSWORD  - Password or HTTP token for authentication
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { GerritClient } from "./gerrit-client.js";
import { ToolDefinition } from "./tool-registry.js";

// Import all tool modules
import { tools as accessTools } from "./tools/access.js";
import { tools as accountTools } from "./tools/accounts.js";
import { tools as changeTools } from "./tools/changes.js";
import { tools as configTools } from "./tools/config.js";
import { tools as groupTools } from "./tools/groups.js";
import { tools as pluginTools } from "./tools/plugins.js";
import { tools as projectTools } from "./tools/projects.js";

// ── Collect all tools ───────────────────────────────────────
const ALL_TOOLS: ToolDefinition[] = [
  ...accessTools,
  ...accountTools,
  ...changeTools,
  ...configTools,
  ...groupTools,
  ...pluginTools,
  ...projectTools,
];

// Build a lookup map for fast tool dispatch
const TOOL_MAP = new Map<string, ToolDefinition>();
for (const tool of ALL_TOOLS) {
  TOOL_MAP.set(tool.name, tool);
}

// ── Create Gerrit client ────────────────────────────────────
function createClient(): GerritClient {
  const baseUrl = process.env.GERRIT_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "GERRIT_BASE_URL environment variable is required. " +
        "Set it to your Gerrit server URL (e.g. https://gerrit.example.com)"
    );
  }

  return new GerritClient({
    baseUrl,
    username: process.env.GERRIT_USERNAME,
    password: process.env.GERRIT_PASSWORD,
  });
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const client = createClient();

  const server = new Server(
    { name: "gerrit-mcp-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // ── tools/list handler ──────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: ALL_TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // ── tools/call handler ──────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = TOOL_MAP.get(name);

    if (!tool) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2),
          },
        ],
        isError: true,
      };
    }

    const params = (args ?? {}) as Record<string, unknown>;

    // Validate required fields
    const required = tool.inputSchema.required || [];
    for (const field of required) {
      if (params[field] === undefined || params[field] === null) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { error: `Missing required parameter: ${field}` },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }

    try {
      const result = await tool.handler(client, params);

      const text =
        typeof result === "string"
          ? result
          : JSON.stringify(result, null, 2);

      return {
        content: [{ type: "text" as const, text }],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: message }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server on stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `Gerrit MCP Server started — ${ALL_TOOLS.length} tools registered`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
