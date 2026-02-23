import { ToolDefinition } from "../tool-registry.js";
import { GerritClient, encodeGerritId } from "../gerrit-client.js";

const e = encodeGerritId;

export const tools: ToolDefinition[] = [
  // ─── Query / Get ─────────────────────────────────────────
  {
    name: "gerrit_search_accounts",
    description:
      "Search/suggest accounts. Use 'q' for query or 'suggest' for auto-complete suggestions.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Account query string" },
        n: { type: "number", description: "Limit number of results" },
        S: { type: "number", description: "Skip first N results" },
        suggest: {
          type: "boolean",
          description: "If true, treat q as prefix for auto-complete",
        },
        o: {
          type: "array",
          items: { type: "string" },
          description:
            "Additional fields: DETAILS, ALL_EMAILS, etc.",
        },
      },
    },
    handler: async (client, params) => {
      return client.get("/accounts/", params as Record<string, string | string[]>);
    },
  },
  {
    name: "gerrit_get_account",
    description:
      "Retrieve account information. Use 'self' for the authenticated user.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: {
          type: "string",
          description: "Account identifier (numeric ID, 'self', username, or email)",
        },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}`);
    },
  },
  {
    name: "gerrit_get_account_detail",
    description: "Retrieve detailed account information including registered_on.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/detail`);
    },
  },
  {
    name: "gerrit_create_account",
    description: "Create a new user account.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "Username for the new account" },
        name: { type: "string", description: "Full name" },
        display_name: { type: "string", description: "Display name" },
        email: { type: "string", description: "Email address" },
        ssh_key: { type: "string", description: "Initial SSH public key" },
        http_password: { type: "string", description: "Initial HTTP password" },
        groups: {
          type: "array",
          items: { type: "string" },
          description: "Groups to add the account to",
        },
      },
      required: ["username"],
    },
    handler: async (client, params) => {
      const { username, ...body } = params;
      return client.put(`/accounts/${e(username as string)}`, body);
    },
  },
  {
    name: "gerrit_get_account_name",
    description: "Retrieve the full name of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/name`);
    },
  },
  {
    name: "gerrit_set_account_name",
    description: "Set the full name of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        name: { type: "string", description: "New full name" },
      },
      required: ["account_id", "name"],
    },
    handler: async (client, params) => {
      return client.put(`/accounts/${e(params.account_id as string)}/name`, {
        name: params.name,
      });
    },
  },
  {
    name: "gerrit_get_account_status",
    description: "Retrieve the status message of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/status`);
    },
  },
  {
    name: "gerrit_set_account_status",
    description: "Set the status message of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        status: { type: "string", description: "Status message" },
      },
      required: ["account_id", "status"],
    },
    handler: async (client, params) => {
      return client.put(`/accounts/${e(params.account_id as string)}/status`, {
        status: params.status,
      });
    },
  },
  {
    name: "gerrit_get_account_active",
    description: "Check whether an account is active.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/active`);
    },
  },
  {
    name: "gerrit_set_account_active",
    description: "Activate or deactivate an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        active: {
          type: "boolean",
          description: "true to activate, false to deactivate",
        },
      },
      required: ["account_id", "active"],
    },
    handler: async (client, params) => {
      if (params.active) {
        return client.put(`/accounts/${e(params.account_id as string)}/active`);
      } else {
        return client.delete(`/accounts/${e(params.account_id as string)}/active`);
      }
    },
  },

  // ─── Emails ──────────────────────────────────────────────
  {
    name: "gerrit_list_account_emails",
    description: "List the email addresses configured for an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/emails`);
    },
  },
  {
    name: "gerrit_add_account_email",
    description: "Register a new email address for an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        email: { type: "string", description: "Email address to register" },
        preferred: { type: "boolean", description: "Set as preferred email" },
        no_confirmation: {
          type: "boolean",
          description: "Skip email confirmation (admin only)",
        },
      },
      required: ["account_id", "email"],
    },
    handler: async (client, params) => {
      const { account_id, email, ...body } = params;
      return client.put(
        `/accounts/${e(account_id as string)}/emails/${e(email as string)}`,
        body
      );
    },
  },
  {
    name: "gerrit_delete_account_email",
    description: "Delete an email address of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        email: { type: "string", description: "Email address to delete" },
      },
      required: ["account_id", "email"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/accounts/${e(params.account_id as string)}/emails/${e(params.email as string)}`
      );
    },
  },
  {
    name: "gerrit_set_preferred_email",
    description: "Set an email address as preferred for an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        email: { type: "string", description: "Email address to set as preferred" },
      },
      required: ["account_id", "email"],
    },
    handler: async (client, params) => {
      return client.put(
        `/accounts/${e(params.account_id as string)}/emails/${e(params.email as string)}/preferred`
      );
    },
  },

  // ─── SSH Keys ────────────────────────────────────────────
  {
    name: "gerrit_list_ssh_keys",
    description: "List the SSH keys of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/sshkeys`);
    },
  },
  {
    name: "gerrit_add_ssh_key",
    description: "Add an SSH key for an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        ssh_public_key: {
          type: "string",
          description: "SSH public key content (e.g. 'ssh-rsa AAAA...')",
        },
      },
      required: ["account_id", "ssh_public_key"],
    },
    handler: async (client, params) => {
      return client.request("POST", `/accounts/${e(params.account_id as string)}/sshkeys`, {
        body: params.ssh_public_key as string,
        contentType: "text/plain",
      });
    },
  },
  {
    name: "gerrit_delete_ssh_key",
    description: "Delete an SSH key of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        ssh_key_id: { type: "number", description: "SSH key sequence number" },
      },
      required: ["account_id", "ssh_key_id"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/accounts/${e(params.account_id as string)}/sshkeys/${params.ssh_key_id}`
      );
    },
  },

  // ─── GPG Keys ────────────────────────────────────────────
  {
    name: "gerrit_list_gpg_keys",
    description: "List the GPG keys of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/gpgkeys`);
    },
  },

  // ─── Capabilities ────────────────────────────────────────
  {
    name: "gerrit_get_account_capabilities",
    description: "List the global capabilities of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        q: {
          type: "array",
          items: { type: "string" },
          description: "Filter specific capabilities",
        },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      const query: Record<string, string | string[]> = {};
      if (params.q) query.q = params.q as string[];
      return client.get(
        `/accounts/${e(params.account_id as string)}/capabilities`,
        query
      );
    },
  },

  // ─── Groups ──────────────────────────────────────────────
  {
    name: "gerrit_list_account_groups",
    description: "List all groups that contain an account as a member.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/groups/`);
    },
  },

  // ─── Preferences ─────────────────────────────────────────
  {
    name: "gerrit_get_account_preferences",
    description: "Retrieve the user preferences of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/preferences`);
    },
  },
  {
    name: "gerrit_set_account_preferences",
    description: "Set the user preferences of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        changes_per_page: { type: "number", description: "Changes per page" },
        expand_inline_diffs: { type: "boolean" },
        download_scheme: { type: "string" },
        date_format: { type: "string", description: "e.g. STD, US, ISO, EURO" },
        time_format: { type: "string", description: "e.g. HHMM_12, HHMM_24" },
        relative_date_in_change_table: { type: "boolean" },
        size_bar_in_change_table: { type: "boolean" },
        mute_common_path_prefixes: { type: "boolean" },
        my: {
          type: "array",
          items: { type: "object" },
          description: "My menu items",
        },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      const { account_id, ...prefs } = params;
      return client.put(
        `/accounts/${e(account_id as string)}/preferences`,
        prefs
      );
    },
  },
  {
    name: "gerrit_get_diff_preferences",
    description: "Retrieve the diff preferences of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/preferences.diff`);
    },
  },
  {
    name: "gerrit_set_diff_preferences",
    description: "Set the diff preferences of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        context: { type: "number", description: "Number of context lines" },
        ignore_whitespace: { type: "string" },
        intraline_difference: { type: "boolean" },
        line_length: { type: "number" },
        tab_size: { type: "number" },
        font_size: { type: "number" },
        syntax_highlighting: { type: "boolean" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      const { account_id, ...prefs } = params;
      return client.put(
        `/accounts/${e(account_id as string)}/preferences.diff`,
        prefs
      );
    },
  },
  {
    name: "gerrit_get_edit_preferences",
    description: "Retrieve the edit preferences of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/preferences.edit`);
    },
  },
  {
    name: "gerrit_set_edit_preferences",
    description: "Set the edit preferences of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        tab_size: { type: "number" },
        line_length: { type: "number" },
        indent_unit: { type: "number" },
        cursor_blink_rate: { type: "number" },
        show_tabs: { type: "boolean" },
        syntax_highlighting: { type: "boolean" },
        match_brackets: { type: "boolean" },
        auto_close_brackets: { type: "boolean" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      const { account_id, ...prefs } = params;
      return client.put(
        `/accounts/${e(account_id as string)}/preferences.edit`,
        prefs
      );
    },
  },

  // ─── Watched Projects ────────────────────────────────────
  {
    name: "gerrit_list_watched_projects",
    description: "List the watched projects of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/accounts/${e(params.account_id as string)}/watched.projects`
      );
    },
  },
  {
    name: "gerrit_set_watched_projects",
    description: "Add or update watched project entries.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              project: { type: "string" },
              filter: { type: "string" },
              notify_new_changes: { type: "boolean" },
              notify_new_patch_sets: { type: "boolean" },
              notify_all_comments: { type: "boolean" },
              notify_submitted_changes: { type: "boolean" },
              notify_abandoned_changes: { type: "boolean" },
            },
          },
          description: "List of watched project entries",
        },
      },
      required: ["account_id", "projects"],
    },
    handler: async (client, params) => {
      return client.post(
        `/accounts/${e(params.account_id as string)}/watched.projects`,
        params.projects
      );
    },
  },
  {
    name: "gerrit_delete_watched_projects",
    description: "Remove watched project entries.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              project: { type: "string" },
              filter: { type: "string" },
            },
          },
          description: "List of watched project entries to remove",
        },
      },
      required: ["account_id", "projects"],
    },
    handler: async (client, params) => {
      return client.post(
        `/accounts/${e(params.account_id as string)}/watched.projects:delete`,
        params.projects
      );
    },
  },

  // ─── External IDs ────────────────────────────────────────
  {
    name: "gerrit_list_external_ids",
    description: "List the external identifiers of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/external.ids`);
    },
  },
  {
    name: "gerrit_delete_external_ids",
    description: "Delete external identifiers of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        external_ids: {
          type: "array",
          items: { type: "string" },
          description: "External IDs to delete",
        },
      },
      required: ["account_id", "external_ids"],
    },
    handler: async (client, params) => {
      return client.post(
        `/accounts/${e(params.account_id as string)}/external.ids:delete`,
        params.external_ids
      );
    },
  },

  // ─── Starred Changes ─────────────────────────────────────
  {
    name: "gerrit_list_starred_changes",
    description: "Retrieve the list of starred changes of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/accounts/${e(params.account_id as string)}/starred.changes`
      );
    },
  },
  {
    name: "gerrit_star_change",
    description: "Star a change for an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["account_id", "change_id"],
    },
    handler: async (client, params) => {
      return client.put(
        `/accounts/${e(params.account_id as string)}/starred.changes/${e(
          params.change_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_unstar_change",
    description: "Unstar a change for an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        change_id: { type: "string", description: "Change identifier" },
      },
      required: ["account_id", "change_id"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/accounts/${e(params.account_id as string)}/starred.changes/${e(
          params.change_id as string
        )}`
      );
    },
  },

  // ─── Contributor Agreements ──────────────────────────────
  {
    name: "gerrit_list_contributor_agreements",
    description: "List the signed contributor agreements of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.get(`/accounts/${e(params.account_id as string)}/agreements`);
    },
  },
  {
    name: "gerrit_sign_contributor_agreement",
    description: "Sign a contributor agreement.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        name: { type: "string", description: "Agreement name" },
      },
      required: ["account_id", "name"],
    },
    handler: async (client, params) => {
      return client.put(`/accounts/${e(params.account_id as string)}/agreements`, {
        name: params.name,
      });
    },
  },

  // ─── Delete Account ──────────────────────────────────────
  {
    name: "gerrit_delete_account",
    description: "Delete an account (admin only).",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/accounts/${e(params.account_id as string)}`);
    },
  },

  // ─── Index Account ───────────────────────────────────────
  {
    name: "gerrit_index_account",
    description: "Reindex an account in the secondary index.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.post(`/accounts/${e(params.account_id as string)}/index`);
    },
  },

  // ─── HTTP Password ───────────────────────────────────────
  {
    name: "gerrit_generate_http_password",
    description: "Generate a new HTTP password for an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        generate: {
          type: "boolean",
          description: "If true, generate a new password",
          default: true,
        },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.put(`/accounts/${e(params.account_id as string)}/password.http`, {
        generate: params.generate !== false,
      });
    },
  },
  {
    name: "gerrit_delete_http_password",
    description: "Delete the HTTP password of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/accounts/${e(params.account_id as string)}/password.http`);
    },
  },

  // ─── Delete Draft Comments ───────────────────────────────
  {
    name: "gerrit_delete_account_draft_comments",
    description: "Delete draft comments of an account.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "Account identifier" },
        query: {
          type: "string",
          description: "Change query to limit which drafts to delete",
        },
      },
      required: ["account_id"],
    },
    handler: async (client, params) => {
      const body: Record<string, unknown> = {};
      if (params.query) body.query = params.query;
      return client.post(
        `/accounts/${e(params.account_id as string)}/drafts:delete`,
        body
      );
    },
  },
];
