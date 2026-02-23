/**
 * Tool Registry - Defines the ToolDefinition interface and registration helpers.
 */

import { GerritClient } from "./gerrit-client.js";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (client: GerritClient, params: Record<string, unknown>) => Promise<unknown>;
}

export type ToolModule = {
  tools: ToolDefinition[];
};
