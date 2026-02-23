import { ToolDefinition } from "../tool-registry.js";
import { GerritClient, encodeGerritId } from "../gerrit-client.js";

const e = encodeGerritId;

export const tools: ToolDefinition[] = [
  // ═══════════════════════════════════════════════════════════
  //  CHANGE ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_query_changes",
    description:
      "Query changes visible to the caller. Supports Gerrit search operators (e.g. status:open, owner:self, project:myproject).",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "Gerrit change query string (e.g. 'status:open project:myproject')",
        },
        n: { type: "number", description: "Limit number of results" },
        S: { type: "number", description: "Skip first N results (offset)" },
        o: {
          type: "array",
          items: { type: "string" },
          description:
            "Additional fields: LABELS, DETAILED_LABELS, CURRENT_REVISION, ALL_REVISIONS, DETAILED_ACCOUNTS, MESSAGES, CURRENT_COMMIT, ALL_COMMITS, CURRENT_FILES, ALL_FILES, REVIEWED, SUBMITTABLE, CHECK, etc.",
        },
      },
    },
    handler: async (client, params) => {
      return client.get("/changes/", params as Record<string, string | string[]>);
    },
  },
  {
    name: "gerrit_get_change",
    description: "Retrieve information about a specific change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: {
          type: "string",
          description:
            "Change identifier (number, project~number, or project~branch~Change-Id)",
        },
        o: {
          type: "array",
          items: { type: "string" },
          description: "Additional fields to include",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const query: Record<string, string | string[]> = {};
      if (params.o) query.o = params.o as string[];
      return client.get(`/changes/${e(params.change_id as string)}`, query);
    },
  },
  {
    name: "gerrit_get_change_detail",
    description:
      "Retrieve a change with labels, detailed labels, detailed accounts, reviewer updates, and messages.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        o: {
          type: "array",
          items: { type: "string" },
          description: "Additional fields to include",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const query: Record<string, string | string[]> = {};
      if (params.o) query.o = params.o as string[];
      return client.get(`/changes/${e(params.change_id as string)}/detail`, query);
    },
  },
  {
    name: "gerrit_create_change",
    description: "Create a new change.",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project name" },
        branch: { type: "string", description: "Target branch name" },
        subject: { type: "string", description: "Commit message subject" },
        topic: { type: "string", description: "Topic name" },
        status: { type: "string", description: "Initial status (DRAFT, NEW)" },
        is_private: { type: "boolean", description: "Create as private change" },
        work_in_progress: { type: "boolean", description: "Create as WIP" },
        base_change: {
          type: "string",
          description: "Change ID to base this change on",
        },
        base_commit: {
          type: "string",
          description: "Commit SHA to base this change on",
        },
        new_branch: {
          type: "boolean",
          description: "Create target branch if it doesn't exist",
        },
        merge: {
          type: "object",
          description: "Merge input for creating merge commits",
        },
      },
      required: ["project", "branch", "subject"],
    },
    handler: async (client, params) => {
      return client.post("/changes/", params);
    },
  },
  {
    name: "gerrit_delete_change",
    description: "Delete a change. Only allowed for draft changes or if admin.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/changes/${e(params.change_id as string)}`);
    },
  },
  {
    name: "gerrit_get_change_topic",
    description: "Retrieve the topic of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/topic`);
    },
  },
  {
    name: "gerrit_set_change_topic",
    description: "Set the topic of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        topic: { type: "string", description: "Topic name" },
      },
      required: ["change_id", "topic"],
    },
    handler: async (client, params) => {
      return client.put(`/changes/${e(params.change_id as string)}/topic`, {
        topic: params.topic,
      });
    },
  },
  {
    name: "gerrit_delete_change_topic",
    description: "Remove the topic of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/changes/${e(params.change_id as string)}/topic`);
    },
  },
  {
    name: "gerrit_get_change_commit_message",
    description: "Retrieve the commit message of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/message`);
    },
  },
  {
    name: "gerrit_set_change_commit_message",
    description: "Update the commit message of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "New commit message" },
      },
      required: ["change_id", "message"],
    },
    handler: async (client, params) => {
      return client.put(`/changes/${e(params.change_id as string)}/message`, {
        message: params.message,
      });
    },
  },

  // ─── Change Hashtags ─────────────────────────────────────
  {
    name: "gerrit_get_change_hashtags",
    description: "Get the hashtags associated with a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/hashtags`);
    },
  },
  {
    name: "gerrit_set_change_hashtags",
    description: "Add and/or remove hashtags from a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        add: {
          type: "array",
          items: { type: "string" },
          description: "Hashtags to add",
        },
        remove: {
          type: "array",
          items: { type: "string" },
          description: "Hashtags to remove",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(
        `/changes/${e(change_id as string)}/hashtags`,
        body
      );
    },
  },

  // ─── Custom Keyed Values ─────────────────────────────────
  {
    name: "gerrit_get_custom_keyed_values",
    description: "Get the custom keyed values of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/changes/${e(params.change_id as string)}/custom_keyed_values`
      );
    },
  },
  {
    name: "gerrit_set_custom_keyed_values",
    description: "Add and/or remove custom keyed values.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        add: {
          type: "object",
          description: "Key-value pairs to add",
        },
        remove: {
          type: "array",
          items: { type: "string" },
          description: "Keys to remove",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(
        `/changes/${e(change_id as string)}/custom_keyed_values`,
        body
      );
    },
  },

  // ─── Change Actions ──────────────────────────────────────
  {
    name: "gerrit_abandon_change",
    description: "Abandon a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "Reason for abandoning" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const body: Record<string, unknown> = {};
      if (params.message) body.message = params.message;
      return client.post(`/changes/${e(params.change_id as string)}/abandon`, body);
    },
  },
  {
    name: "gerrit_restore_change",
    description: "Restore an abandoned change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "Reason for restoring" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const body: Record<string, unknown> = {};
      if (params.message) body.message = params.message;
      return client.post(`/changes/${e(params.change_id as string)}/restore`, body);
    },
  },
  {
    name: "gerrit_rebase_change",
    description: "Rebase a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        base: {
          type: "string",
          description: "Base revision to rebase onto (SHA-1 or change number)",
        },
        allow_conflicts: {
          type: "boolean",
          description: "Allow rebase with conflicts",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(`/changes/${e(change_id as string)}/rebase`, body);
    },
  },
  {
    name: "gerrit_rebase_chain",
    description: "Rebase an ancestry chain of changes.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier (top of chain)" },
        base: { type: "string", description: "Base revision to rebase onto" },
        allow_conflicts: { type: "boolean" },
        on_behalf_of_uploader: { type: "boolean" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(`/changes/${e(change_id as string)}/rebase:chain`, body);
    },
  },
  {
    name: "gerrit_move_change",
    description: "Move a change to a different destination branch.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        destination_branch: {
          type: "string",
          description: "Destination branch name",
        },
        message: { type: "string", description: "Message for the move" },
      },
      required: ["change_id", "destination_branch"],
    },
    handler: async (client, params) => {
      return client.post(`/changes/${e(params.change_id as string)}/move`, {
        destination_branch: params.destination_branch,
        message: params.message,
      });
    },
  },
  {
    name: "gerrit_revert_change",
    description: "Revert a change. Creates a new change that reverts the specified one.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "Message for the revert commit" },
        topic: { type: "string", description: "Topic for the revert change" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(`/changes/${e(change_id as string)}/revert`, body);
    },
  },
  {
    name: "gerrit_revert_submission",
    description:
      "Revert all changes that were submitted together with the given change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "Message for the revert" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(
        `/changes/${e(change_id as string)}/revert_submission`,
        body
      );
    },
  },
  {
    name: "gerrit_submit_change",
    description: "Submit a change. The change must be approved and ready for submission.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.post(`/changes/${e(params.change_id as string)}/submit`);
    },
  },
  {
    name: "gerrit_get_submitted_together",
    description: "List changes that would be submitted together with this change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        o: {
          type: "array",
          items: { type: "string" },
          description: "Additional fields: NON_VISIBLE_CHANGES",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const query: Record<string, string | string[]> = {};
      if (params.o) query.o = params.o as string[];
      return client.get(
        `/changes/${e(params.change_id as string)}/submitted_together`,
        query
      );
    },
  },
  {
    name: "gerrit_set_work_in_progress",
    description: "Mark a change as Work-In-Progress (WIP).",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "Reason" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const body: Record<string, unknown> = {};
      if (params.message) body.message = params.message;
      return client.post(`/changes/${e(params.change_id as string)}/wip`, body);
    },
  },
  {
    name: "gerrit_set_ready_for_review",
    description: "Mark a change as Ready for Review.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "Reason" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const body: Record<string, unknown> = {};
      if (params.message) body.message = params.message;
      return client.post(`/changes/${e(params.change_id as string)}/ready`, body);
    },
  },
  {
    name: "gerrit_set_private",
    description: "Mark a change as private.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "Reason" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const body: Record<string, unknown> = {};
      if (params.message) body.message = params.message;
      return client.post(`/changes/${e(params.change_id as string)}/private`, body);
    },
  },
  {
    name: "gerrit_unset_private",
    description: "Remove the private flag from a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/changes/${e(params.change_id as string)}/private`);
    },
  },
  {
    name: "gerrit_get_pure_revert",
    description: "Check if a change is a pure revert of another change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/pure_revert`);
    },
  },
  {
    name: "gerrit_get_change_included_in",
    description: "Retrieve the branches and tags in which a change is included.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/in`);
    },
  },
  {
    name: "gerrit_index_change",
    description: "Index a change in the secondary index.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.post(`/changes/${e(params.change_id as string)}/index`);
    },
  },
  {
    name: "gerrit_check_change",
    description: "Perform consistency checks on a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/check`);
    },
  },
  {
    name: "gerrit_fix_change",
    description: "Perform consistency checks on a change and fix any problems.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        delete_patch_set_if_commit_missing: { type: "boolean" },
        expect_merged_as: {
          type: "string",
          description: "Expected merge commit SHA",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(`/changes/${e(change_id as string)}/check`, body);
    },
  },
  {
    name: "gerrit_check_submit_requirement",
    description: "Test a submit requirement expression against a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        sr_name: { type: "string", description: "Submit requirement name" },
        submittability_expression: {
          type: "string",
          description: "Expression to evaluate",
        },
      },
      required: ["change_id", "sr_name", "submittability_expression"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(
        `/changes/${e(change_id as string)}/check.submit_requirement`,
        body
      );
    },
  },

  // ─── Change Messages ─────────────────────────────────────
  {
    name: "gerrit_list_change_messages",
    description: "List all messages of a change (review comments, status updates, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/messages`);
    },
  },
  {
    name: "gerrit_get_change_message",
    description: "Retrieve a specific change message.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message_id: { type: "string", description: "Message ID" },
      },
      required: ["change_id", "message_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/changes/${e(params.change_id as string)}/messages/${e(
          params.message_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_delete_change_message",
    description: "Delete a change message.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message_id: { type: "string", description: "Message ID" },
        reason: { type: "string", description: "Reason for deletion" },
      },
      required: ["change_id", "message_id"],
    },
    handler: async (client, params) => {
      if (params.reason) {
        return client.post(
          `/changes/${e(params.change_id as string)}/messages/${e(
            params.message_id as string
          )}/delete`,
          { reason: params.reason }
        );
      }
      return client.delete(
        `/changes/${e(params.change_id as string)}/messages/${e(
          params.message_id as string
        )}`
      );
    },
  },

  // ─── Change Comments (published) ─────────────────────────
  {
    name: "gerrit_list_change_comments",
    description:
      "List all published comments on all revisions of a change, grouped by file path.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/comments`);
    },
  },
  {
    name: "gerrit_list_change_drafts",
    description: "List all draft comments on all revisions of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/drafts`);
    },
  },

  // ─── Attention Set ───────────────────────────────────────
  {
    name: "gerrit_get_attention_set",
    description: "Get the attention set of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/changes/${e(params.change_id as string)}/attention_set`
      );
    },
  },
  {
    name: "gerrit_add_to_attention_set",
    description: "Add a user to the attention set of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        user: { type: "string", description: "Account to add" },
        reason: { type: "string", description: "Reason for adding" },
      },
      required: ["change_id", "user", "reason"],
    },
    handler: async (client, params) => {
      return client.post(
        `/changes/${e(params.change_id as string)}/attention_set`,
        { user: params.user, reason: params.reason }
      );
    },
  },
  {
    name: "gerrit_remove_from_attention_set",
    description: "Remove a user from the attention set of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        account_id: { type: "string", description: "Account to remove" },
        reason: { type: "string", description: "Reason for removal" },
      },
      required: ["change_id", "account_id"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/changes/${e(params.change_id as string)}/attention_set/${e(
          params.account_id as string
        )}`,
        params.reason ? { reason: params.reason } : undefined
      );
    },
  },

  // ─── Reviewers ───────────────────────────────────────────
  {
    name: "gerrit_list_reviewers",
    description: "List the reviewers of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/reviewers`);
    },
  },
  {
    name: "gerrit_suggest_reviewers",
    description: "Suggest reviewers for a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        q: { type: "string", description: "Search query for reviewer suggestion" },
        n: { type: "number", description: "Maximum number of suggestions" },
      },
      required: ["change_id", "q"],
    },
    handler: async (client, params) => {
      return client.get(
        `/changes/${e(params.change_id as string)}/suggest_reviewers`,
        { q: params.q as string, n: params.n as number }
      );
    },
  },
  {
    name: "gerrit_get_reviewer",
    description: "Retrieve a reviewer of a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        account_id: { type: "string", description: "Reviewer account ID" },
      },
      required: ["change_id", "account_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/changes/${e(params.change_id as string)}/reviewers/${e(
          params.account_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_add_reviewer",
    description: "Add a reviewer to a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        reviewer: {
          type: "string",
          description: "Account ID, email, or group ID to add as reviewer",
        },
        state: {
          type: "string",
          enum: ["REVIEWER", "CC"],
          description: "Reviewer state (REVIEWER or CC)",
        },
        confirmed: {
          type: "boolean",
          description: "Confirm adding a group with many members",
        },
      },
      required: ["change_id", "reviewer"],
    },
    handler: async (client, params) => {
      const { change_id, ...body } = params;
      return client.post(
        `/changes/${e(change_id as string)}/reviewers`,
        body
      );
    },
  },
  {
    name: "gerrit_remove_reviewer",
    description: "Remove a reviewer from a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        account_id: { type: "string", description: "Reviewer account ID" },
        notify: {
          type: "string",
          description: "Notification setting: NONE, OWNER, OWNER_REVIEWERS, ALL",
        },
      },
      required: ["change_id", "account_id"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/changes/${e(params.change_id as string)}/reviewers/${e(
          params.account_id as string
        )}`,
        params.notify ? { notify: params.notify } : undefined
      );
    },
  },
  {
    name: "gerrit_list_reviewer_votes",
    description: "List the votes of a reviewer on a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        account_id: { type: "string", description: "Reviewer account ID" },
      },
      required: ["change_id", "account_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/changes/${e(params.change_id as string)}/reviewers/${e(
          params.account_id as string
        )}/votes`
      );
    },
  },
  {
    name: "gerrit_delete_vote",
    description: "Remove a vote/label from a reviewer on a change.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        account_id: { type: "string", description: "Reviewer account ID" },
        label: { type: "string", description: "Label name (e.g. Code-Review)" },
        notify: { type: "string", description: "Notification setting" },
      },
      required: ["change_id", "account_id", "label"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/changes/${e(params.change_id as string)}/reviewers/${e(
          params.account_id as string
        )}/votes/${e(params.label as string)}`,
        params.notify ? { notify: params.notify } : undefined
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  CHANGE EDIT ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_get_change_edit",
    description:
      "Retrieve change edit details. Returns information about the current in-progress edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        list: { type: "boolean", description: "List files in the edit" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const query: Record<string, string> = {};
      if (params.list) query.list = "true";
      return client.get(`/changes/${e(params.change_id as string)}/edit`, query);
    },
  },
  {
    name: "gerrit_modify_file_in_edit",
    description: "Create or modify a file in a change edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        file_path: { type: "string", description: "File path" },
        content: { type: "string", description: "File content" },
      },
      required: ["change_id", "file_path", "content"],
    },
    handler: async (client, params) => {
      return client.request(
        "PUT",
        `/changes/${e(params.change_id as string)}/edit/${e(
          params.file_path as string
        )}`,
        { body: params.content as string, contentType: "text/plain" }
      );
    },
  },
  {
    name: "gerrit_delete_file_in_edit",
    description: "Delete a file from a change edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        file_path: { type: "string", description: "File path to delete" },
      },
      required: ["change_id", "file_path"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/changes/${e(params.change_id as string)}/edit/${e(
          params.file_path as string
        )}`
      );
    },
  },
  {
    name: "gerrit_get_file_in_edit",
    description: "Retrieve the content of a file from a change edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        file_path: { type: "string", description: "File path" },
      },
      required: ["change_id", "file_path"],
    },
    handler: async (client, params) => {
      return client.request(
        "GET",
        `/changes/${e(params.change_id as string)}/edit/${e(
          params.file_path as string
        )}`,
        { rawResponse: true }
      );
    },
  },
  {
    name: "gerrit_restore_file_in_edit",
    description: "Restore a file in a change edit to the state of the current patch set.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        restore_path: { type: "string", description: "File path to restore" },
      },
      required: ["change_id", "restore_path"],
    },
    handler: async (client, params) => {
      return client.post(`/changes/${e(params.change_id as string)}/edit`, {
        restore_path: params.restore_path,
      });
    },
  },
  {
    name: "gerrit_rename_file_in_edit",
    description: "Rename a file in a change edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        old_path: { type: "string", description: "Current file path" },
        new_path: { type: "string", description: "New file path" },
      },
      required: ["change_id", "old_path", "new_path"],
    },
    handler: async (client, params) => {
      return client.post(`/changes/${e(params.change_id as string)}/edit`, {
        old_path: params.old_path,
        new_path: params.new_path,
      });
    },
  },
  {
    name: "gerrit_delete_change_edit",
    description: "Delete a change edit (discard the in-progress edit).",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/changes/${e(params.change_id as string)}/edit`);
    },
  },
  {
    name: "gerrit_publish_change_edit",
    description: "Publish a change edit (create a new patch set from the edit).",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        notify: { type: "string", description: "Notification setting" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const body: Record<string, unknown> = {};
      if (params.notify) body.notify = params.notify;
      return client.post(
        `/changes/${e(params.change_id as string)}/edit:publish`,
        body
      );
    },
  },
  {
    name: "gerrit_rebase_change_edit",
    description: "Rebase a change edit on top of the latest patch set.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.post(
        `/changes/${e(params.change_id as string)}/edit:rebase`
      );
    },
  },
  {
    name: "gerrit_get_edit_commit_message",
    description: "Retrieve the commit message of a change edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      return client.get(`/changes/${e(params.change_id as string)}/edit/message`);
    },
  },
  {
    name: "gerrit_set_edit_commit_message",
    description: "Change the commit message of a change edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        message: { type: "string", description: "New commit message" },
      },
      required: ["change_id", "message"],
    },
    handler: async (client, params) => {
      return client.put(`/changes/${e(params.change_id as string)}/edit/message`, {
        message: params.message,
      });
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  REVISION ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_get_revision",
    description:
      "Retrieve a revision of a change. Use 'current' for the latest patch set.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: {
          type: "string",
          description: "Revision identifier (SHA-1, patch set number, or 'current')",
          default: "current",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}`
      );
    },
  },
  {
    name: "gerrit_get_revision_commit",
    description: "Retrieve the commit of a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/commit`
      );
    },
  },
  {
    name: "gerrit_get_revision_description",
    description: "Retrieve the description of a revision (patch set description).",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/description`
      );
    },
  },
  {
    name: "gerrit_set_revision_description",
    description: "Set the description of a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        description: { type: "string", description: "New description" },
      },
      required: ["change_id", "description"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.put(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/description`,
        { description: params.description }
      );
    },
  },
  {
    name: "gerrit_get_revision_actions",
    description: "Retrieve the actions available on a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/actions`
      );
    },
  },
  {
    name: "gerrit_set_review",
    description:
      "Post a review on a revision. Set labels, add comments, and/or add a message.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        message: { type: "string", description: "Review message" },
        labels: {
          type: "object",
          description: "Labels to set, e.g. {'Code-Review': 2, 'Verified': 1}",
        },
        comments: {
          type: "object",
          description:
            "Comments per file path. Each key is a file path, value is array of comment objects with {line, message, ...}",
        },
        tag: { type: "string", description: "Tag for the review (e.g. autogenerated:ci)" },
        notify: { type: "string", description: "Notification setting" },
        on_behalf_of: {
          type: "string",
          description: "Post review on behalf of this account",
        },
        drafts: {
          type: "string",
          enum: ["PUBLISH", "PUBLISH_ALL_REVISIONS", "KEEP"],
          description: "What to do with draft comments",
        },
        ready: {
          type: "boolean",
          description: "Set change to ready for review",
        },
        work_in_progress: {
          type: "boolean",
          description: "Set change to WIP",
        },
        add_to_attention_set: {
          type: "array",
          items: { type: "object" },
          description: "Users to add to attention set",
        },
        remove_from_attention_set: {
          type: "array",
          items: { type: "object" },
          description: "Users to remove from attention set",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const { change_id, revision_id, ...body } = params;
      const rev = (revision_id as string) || "current";
      return client.post(
        `/changes/${e(change_id as string)}/revisions/${e(rev)}/review`,
        body
      );
    },
  },
  {
    name: "gerrit_get_related_changes",
    description: "Retrieve related changes (dependency chain) for a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/related`
      );
    },
  },
  {
    name: "gerrit_get_revision_patch",
    description: "Retrieve the patch (diff) of a revision in unified diff format.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        zip: { type: "boolean", description: "Return as zip file" },
        download: { type: "boolean", description: "Set Content-Disposition for download" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      const query: Record<string, string> = {};
      if (params.zip) query.zip = "true";
      if (params.download) query.download = "true";
      return client.request(
        "GET",
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/patch`,
        { query, rawResponse: true }
      );
    },
  },
  {
    name: "gerrit_get_mergeable",
    description: "Check if a revision is mergeable into the destination branch.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        other_branches: {
          type: "array",
          items: { type: "string" },
          description: "Additional branches to check mergeability",
        },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      const query: Record<string, string | string[]> = {};
      if (params.other_branches)
        query["other-branches"] = params.other_branches as string[];
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/mergeable`,
        query
      );
    },
  },
  {
    name: "gerrit_get_submit_type",
    description: "Get the submit type of a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/submit_type`
      );
    },
  },
  {
    name: "gerrit_cherry_pick_revision",
    description: "Cherry-pick a revision to a destination branch.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        destination: { type: "string", description: "Destination branch" },
        message: { type: "string", description: "Commit message for cherry-pick" },
        keep_reviewers: { type: "boolean", description: "Keep original reviewers" },
        allow_conflicts: { type: "boolean" },
        topic: { type: "string" },
      },
      required: ["change_id", "destination"],
    },
    handler: async (client, params) => {
      const { change_id, revision_id, ...body } = params;
      const rev = (revision_id as string) || "current";
      return client.post(
        `/changes/${e(change_id as string)}/revisions/${e(rev)}/cherry_pick`,
        body
      );
    },
  },
  {
    name: "gerrit_get_merge_list",
    description: "Retrieve the merge list of a revision (for merge commits).",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/merge_list`
      );
    },
  },

  // ─── Revision Files ──────────────────────────────────────
  {
    name: "gerrit_list_revision_files",
    description: "List the files modified in a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        base: {
          type: "string",
          description: "Base patch set number for comparison",
        },
        reviewed: { type: "boolean", description: "Include review status" },
        q: { type: "string", description: "File path substring filter" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      const query: Record<string, string> = {};
      if (params.base) query.base = params.base as string;
      if (params.reviewed) query.reviewed = "true";
      if (params.q) query.q = params.q as string;
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/files`,
        query
      );
    },
  },
  {
    name: "gerrit_get_file_content",
    description: "Retrieve the content of a file at a specific revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        file_path: { type: "string", description: "File path" },
      },
      required: ["change_id", "file_path"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.request(
        "GET",
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/files/${e(
          params.file_path as string
        )}/content`,
        { rawResponse: true }
      );
    },
  },
  {
    name: "gerrit_get_file_diff",
    description: "Retrieve the diff of a file in a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        file_path: { type: "string", description: "File path" },
        base: { type: "string", description: "Base patch set number" },
        intraline: { type: "boolean", description: "Include intraline differences" },
        whitespace: {
          type: "string",
          description: "Whitespace handling: IGNORE_NONE, IGNORE_TRAILING, IGNORE_LEADING_AND_TRAILING, IGNORE_ALL",
        },
        context: { type: "number", description: "Number of context lines" },
      },
      required: ["change_id", "file_path"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      const query: Record<string, string | number> = {};
      if (params.base) query.base = params.base as string;
      if (params.intraline) query.intraline = "true";
      if (params.whitespace) query.whitespace = params.whitespace as string;
      if (params.context !== undefined) query.context = params.context as number;
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/files/${e(
          params.file_path as string
        )}/diff`,
        query
      );
    },
  },
  {
    name: "gerrit_get_file_blame",
    description: "Retrieve the blame information for a file at a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        file_path: { type: "string", description: "File path" },
      },
      required: ["change_id", "file_path"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/files/${e(
          params.file_path as string
        )}/blame`
      );
    },
  },
  {
    name: "gerrit_set_file_reviewed",
    description: "Mark a file as reviewed.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        file_path: { type: "string", description: "File path" },
      },
      required: ["change_id", "file_path"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.put(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/files/${e(
          params.file_path as string
        )}/reviewed`
      );
    },
  },
  {
    name: "gerrit_unset_file_reviewed",
    description: "Unmark a file as reviewed.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        file_path: { type: "string", description: "File path" },
      },
      required: ["change_id", "file_path"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.delete(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/files/${e(
          params.file_path as string
        )}/reviewed`
      );
    },
  },

  // ─── Revision Comments ───────────────────────────────────
  {
    name: "gerrit_list_revision_comments",
    description: "List all published comments on a specific revision, grouped by file.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/comments`
      );
    },
  },
  {
    name: "gerrit_get_revision_comment",
    description: "Get a specific comment on a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        comment_id: { type: "string", description: "Comment ID" },
      },
      required: ["change_id", "comment_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/comments/${e(
          params.comment_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_delete_revision_comment",
    description: "Delete a comment on a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        comment_id: { type: "string", description: "Comment ID" },
        reason: { type: "string", description: "Reason for deletion" },
      },
      required: ["change_id", "comment_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.delete(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/comments/${e(
          params.comment_id as string
        )}`,
        params.reason ? { reason: params.reason } : undefined
      );
    },
  },
  {
    name: "gerrit_list_ported_comments",
    description: "List comments that have been ported to a specific revision from an older one.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/ported_comments`
      );
    },
  },

  // ─── Revision Drafts ─────────────────────────────────────
  {
    name: "gerrit_list_revision_drafts",
    description: "List all draft comments on a specific revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
      },
      required: ["change_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.get(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/drafts`
      );
    },
  },
  {
    name: "gerrit_create_draft_comment",
    description: "Create a new draft comment on a revision.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        path: { type: "string", description: "File path for the comment" },
        line: { type: "number", description: "Line number for the comment" },
        message: { type: "string", description: "Comment text" },
        in_reply_to: { type: "string", description: "ID of parent comment for replies" },
        side: {
          type: "string",
          enum: ["PARENT", "REVISION"],
          description: "Which side: PARENT or REVISION",
        },
        range: {
          type: "object",
          description: "Range for the comment: {start_line, start_character, end_line, end_character}",
        },
      },
      required: ["change_id", "path", "message"],
    },
    handler: async (client, params) => {
      const { change_id, revision_id, ...body } = params;
      const rev = (revision_id as string) || "current";
      return client.post(
        `/changes/${e(change_id as string)}/revisions/${e(rev)}/drafts`,
        body
      );
    },
  },
  {
    name: "gerrit_update_draft_comment",
    description: "Update an existing draft comment.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        draft_id: { type: "string", description: "Draft comment ID" },
        path: { type: "string", description: "File path" },
        line: { type: "number", description: "Line number" },
        message: { type: "string", description: "Updated comment text" },
      },
      required: ["change_id", "draft_id", "message"],
    },
    handler: async (client, params) => {
      const { change_id, revision_id, draft_id, ...body } = params;
      const rev = (revision_id as string) || "current";
      return client.put(
        `/changes/${e(change_id as string)}/revisions/${e(rev)}/drafts/${e(
          draft_id as string
        )}`,
        body
      );
    },
  },
  {
    name: "gerrit_delete_draft_comment",
    description: "Delete a draft comment.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        draft_id: { type: "string", description: "Draft comment ID" },
      },
      required: ["change_id", "draft_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.delete(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/drafts/${e(
          params.draft_id as string
        )}`
      );
    },
  },

  // ─── Revision Fixes ──────────────────────────────────────
  {
    name: "gerrit_apply_fix",
    description: "Apply a stored fix suggestion to create a change edit.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        fix_id: { type: "string", description: "Fix ID" },
      },
      required: ["change_id", "fix_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.post(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/fixes/${e(
          params.fix_id as string
        )}/apply`
      );
    },
  },
  {
    name: "gerrit_preview_fix",
    description: "Preview a stored fix suggestion.",
    inputSchema: {
      type: "object",
      properties: {
        change_id: { type: "string", description: "Change identifier" },
        revision_id: { type: "string", description: "Revision identifier", default: "current" },
        fix_id: { type: "string", description: "Fix ID" },
      },
      required: ["change_id", "fix_id"],
    },
    handler: async (client, params) => {
      const rev = (params.revision_id as string) || "current";
      return client.post(
        `/changes/${e(params.change_id as string)}/revisions/${e(rev)}/fixes/${e(
          params.fix_id as string
        )}/preview`
      );
    },
  },
];
