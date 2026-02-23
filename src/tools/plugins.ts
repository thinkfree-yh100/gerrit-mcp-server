import { ToolDefinition } from "../tool-registry.js";
import { GerritClient, encodeGerritId } from "../gerrit-client.js";

const e = encodeGerritId;

export const tools: ToolDefinition[] = [
  {
    name: "gerrit_list_plugins",
    description:
      "List installed plugins. Can filter by prefix, regex, or substring.",
    inputSchema: {
      type: "object",
      properties: {
        all: {
          type: "boolean",
          description: "Include disabled plugins (a=true)",
        },
        n: { type: "number", description: "Limit number of results" },
        S: { type: "number", description: "Skip first N results" },
        p: { type: "string", description: "Filter by prefix" },
        r: { type: "string", description: "Filter by regex" },
        m: { type: "string", description: "Filter by substring match" },
      },
    },
    handler: async (client, params) => {
      const query: Record<string, string | number | boolean> = {};
      if (params.all) query.a = true;
      if (params.n !== undefined) query.n = params.n as number;
      if (params.S !== undefined) query.S = params.S as number;
      if (params.p) query.p = params.p as string;
      if (params.r) query.r = params.r as string;
      if (params.m) query.m = params.m as string;
      return client.get("/plugins/", query);
    },
  },
  {
    name: "gerrit_get_plugin_status",
    description: "Retrieve the status of a plugin.",
    inputSchema: {
      type: "object",
      properties: {
        plugin_id: { type: "string", description: "Plugin ID" },
      },
      required: ["plugin_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/plugins/${e(params.plugin_id as string)}/gerrit~status`
      );
    },
  },
  {
    name: "gerrit_enable_plugin",
    description: "Enable a plugin.",
    inputSchema: {
      type: "object",
      properties: {
        plugin_id: { type: "string", description: "Plugin ID" },
      },
      required: ["plugin_id"],
    },
    handler: async (client, params) => {
      return client.post(
        `/plugins/${e(params.plugin_id as string)}/gerrit~enable`
      );
    },
  },
  {
    name: "gerrit_disable_plugin",
    description: "Disable a plugin.",
    inputSchema: {
      type: "object",
      properties: {
        plugin_id: { type: "string", description: "Plugin ID" },
      },
      required: ["plugin_id"],
    },
    handler: async (client, params) => {
      return client.post(
        `/plugins/${e(params.plugin_id as string)}/gerrit~disable`
      );
    },
  },
  {
    name: "gerrit_reload_plugin",
    description: "Reload a plugin.",
    inputSchema: {
      type: "object",
      properties: {
        plugin_id: { type: "string", description: "Plugin ID" },
      },
      required: ["plugin_id"],
    },
    handler: async (client, params) => {
      return client.post(
        `/plugins/${e(params.plugin_id as string)}/gerrit~reload`
      );
    },
  },
  {
    name: "gerrit_install_plugin",
    description: "Install a plugin from a URL.",
    inputSchema: {
      type: "object",
      properties: {
        plugin_id: { type: "string", description: "Plugin ID (filename without .jar)" },
        url: { type: "string", description: "URL to download the plugin JAR from" },
      },
      required: ["plugin_id", "url"],
    },
    handler: async (client, params) => {
      return client.put(`/plugins/${e(params.plugin_id as string)}.jar`, {
        url: params.url,
      });
    },
  },
];
