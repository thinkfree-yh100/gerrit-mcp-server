import { ToolDefinition } from "../tool-registry.js";
import { GerritClient, encodeGerritId } from "../gerrit-client.js";

const e = encodeGerritId;

export const tools: ToolDefinition[] = [
  // ─── Server Info ─────────────────────────────────────────
  {
    name: "gerrit_get_server_version",
    description: "Retrieve the version of the Gerrit server.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/version");
    },
  },
  {
    name: "gerrit_get_server_info",
    description:
      "Get server configuration details including auth, change, download, gerrit, plugin, sshd, suggest, and user config.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/info");
    },
  },
  {
    name: "gerrit_get_server_summary",
    description: "Fetch a summary of the current server state including task/thread counts.",
    inputSchema: {
      type: "object",
      properties: {
        jvm: { type: "boolean", description: "Include JVM information" },
        gc: { type: "boolean", description: "Include GC information" },
      },
    },
    handler: async (client, params) => {
      const query: Record<string, string> = {};
      if (params.jvm) query.jvm = "true";
      if (params.gc) query.gc = "true";
      return client.get("/config/server/summary", query);
    },
  },
  {
    name: "gerrit_get_server_capabilities",
    description: "List available global capabilities.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/capabilities");
    },
  },
  {
    name: "gerrit_get_top_menus",
    description: "Return additional top menu entries installed by plugins.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/top-menus");
    },
  },
  {
    name: "gerrit_reload_config",
    description: "Reload the gerrit.config settings.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.post("/config/server/reload");
    },
  },
  {
    name: "gerrit_confirm_email",
    description: "Validate email address ownership using a confirmation token.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Email confirmation token" },
      },
      required: ["token"],
    },
    handler: async (client, params) => {
      return client.put("/config/server/email.confirm", {
        token: params.token,
      });
    },
  },

  // ─── Experiments ─────────────────────────────────────────
  {
    name: "gerrit_list_experiments",
    description: "List available experiments on the server.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/experiments");
    },
  },
  {
    name: "gerrit_get_experiment",
    description: "Get details of a specific experiment.",
    inputSchema: {
      type: "object",
      properties: {
        experiment_name: { type: "string", description: "Experiment name" },
      },
      required: ["experiment_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/config/server/experiments/${e(params.experiment_name as string)}`
      );
    },
  },

  // ─── Labels & Submit Requirements ────────────────────────
  {
    name: "gerrit_list_global_labels",
    description: "List globally defined labels.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/labels");
    },
  },
  {
    name: "gerrit_list_global_submit_requirements",
    description: "List global submit requirements.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/submit-requirements");
    },
  },

  // ─── Maintenance ─────────────────────────────────────────
  {
    name: "gerrit_check_consistency",
    description: "Execute consistency checks on the server.",
    inputSchema: {
      type: "object",
      properties: {
        check_accounts: { type: "boolean", description: "Check account consistency" },
        check_account_external_ids: {
          type: "boolean",
          description: "Check account external IDs",
        },
        check_groups: { type: "boolean", description: "Check group consistency" },
      },
    },
    handler: async (client, params) => {
      const input: Record<string, unknown> = {};
      if (params.check_accounts !== undefined)
        input.check_accounts = {};
      if (params.check_account_external_ids !== undefined)
        input.check_account_external_ids = {};
      if (params.check_groups !== undefined) input.check_groups = {};
      return client.post("/config/server/check.consistency", input);
    },
  },
  {
    name: "gerrit_cleanup_changes",
    description: "Abandon stale changes based on server-configured policies.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.post("/config/server/cleanup.changes");
    },
  },
  {
    name: "gerrit_deactivate_stale_accounts",
    description: "Queue an account deactivation task for stale accounts.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.post("/config/server/deactivate.stale.accounts");
    },
  },

  // ─── Caches ──────────────────────────────────────────────
  {
    name: "gerrit_list_caches",
    description: "List all server caches with their statistics.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/caches/");
    },
  },
  {
    name: "gerrit_get_cache",
    description: "Retrieve information about a specific cache.",
    inputSchema: {
      type: "object",
      properties: {
        cache_name: { type: "string", description: "Cache name" },
      },
      required: ["cache_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/config/server/caches/${e(params.cache_name as string)}`
      );
    },
  },
  {
    name: "gerrit_flush_cache",
    description: "Flush a specific cache.",
    inputSchema: {
      type: "object",
      properties: {
        cache_name: { type: "string", description: "Cache name" },
      },
      required: ["cache_name"],
    },
    handler: async (client, params) => {
      return client.post(
        `/config/server/caches/${e(params.cache_name as string)}/flush`
      );
    },
  },
  {
    name: "gerrit_flush_all_caches",
    description: "Flush all caches or all caches of a specific type.",
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["FLUSH_ALL", "FLUSH"],
          description: "FLUSH_ALL to flush everything",
        },
      },
    },
    handler: async (client, params) => {
      return client.post("/config/server/caches/", {
        operation: params.operation || "FLUSH_ALL",
      });
    },
  },

  // ─── Default Preferences ─────────────────────────────────
  {
    name: "gerrit_get_default_preferences",
    description: "Get the default user preferences for the server.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/preferences");
    },
  },
  {
    name: "gerrit_set_default_preferences",
    description: "Set the default user preferences for the server.",
    inputSchema: {
      type: "object",
      properties: {
        changes_per_page: { type: "number" },
        download_scheme: { type: "string" },
        date_format: { type: "string" },
        time_format: { type: "string" },
        expand_inline_diffs: { type: "boolean" },
        relative_date_in_change_table: { type: "boolean" },
        size_bar_in_change_table: { type: "boolean" },
      },
    },
    handler: async (client, params) => {
      return client.put("/config/server/preferences", params);
    },
  },
  {
    name: "gerrit_get_default_diff_preferences",
    description: "Get the default diff preferences for the server.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/preferences.diff");
    },
  },
  {
    name: "gerrit_set_default_diff_preferences",
    description: "Set the default diff preferences for the server.",
    inputSchema: {
      type: "object",
      properties: {
        context: { type: "number" },
        tab_size: { type: "number" },
        font_size: { type: "number" },
        line_length: { type: "number" },
        ignore_whitespace: { type: "string" },
        intraline_difference: { type: "boolean" },
        syntax_highlighting: { type: "boolean" },
      },
    },
    handler: async (client, params) => {
      return client.put("/config/server/preferences.diff", params);
    },
  },
  {
    name: "gerrit_get_default_edit_preferences",
    description: "Get the default edit preferences for the server.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/preferences.edit");
    },
  },
  {
    name: "gerrit_set_default_edit_preferences",
    description: "Set the default edit preferences for the server.",
    inputSchema: {
      type: "object",
      properties: {
        tab_size: { type: "number" },
        line_length: { type: "number" },
        indent_unit: { type: "number" },
        show_tabs: { type: "boolean" },
        syntax_highlighting: { type: "boolean" },
      },
    },
    handler: async (client, params) => {
      return client.put("/config/server/preferences.edit", params);
    },
  },

  // ─── Tasks ───────────────────────────────────────────────
  {
    name: "gerrit_list_tasks",
    description: "List the pending background tasks on the server.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/tasks/");
    },
  },
  {
    name: "gerrit_get_task",
    description: "Get information about a specific server task.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID" },
      },
      required: ["task_id"],
    },
    handler: async (client, params) => {
      return client.get(`/config/server/tasks/${e(params.task_id as string)}`);
    },
  },
  {
    name: "gerrit_delete_task",
    description: "Kill a pending server task.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID" },
      },
      required: ["task_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/config/server/tasks/${e(params.task_id as string)}`);
    },
  },

  // ─── Indexes ─────────────────────────────────────────────
  {
    name: "gerrit_list_indexes",
    description: "List all secondary indexes on the server.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.get("/config/server/indexes");
    },
  },
  {
    name: "gerrit_get_index",
    description: "Get information about a specific index.",
    inputSchema: {
      type: "object",
      properties: {
        index_name: { type: "string", description: "Index name" },
      },
      required: ["index_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/config/server/indexes/${e(params.index_name as string)}`
      );
    },
  },
  {
    name: "gerrit_index_changes_batch",
    description: "Reindex a set of specific changes by ID.",
    inputSchema: {
      type: "object",
      properties: {
        changes: {
          type: "array",
          items: { type: "string" },
          description: "List of change IDs to index",
        },
      },
      required: ["changes"],
    },
    handler: async (client, params) => {
      return client.post("/config/server/index.changes", params.changes);
    },
  },
  {
    name: "gerrit_snapshot_indexes",
    description: "Create snapshots of all indexes.",
    inputSchema: { type: "object", properties: {} },
    handler: async (client) => {
      return client.post("/config/server/snapshot.indexes");
    },
  },
];
