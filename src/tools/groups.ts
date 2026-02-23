import { ToolDefinition } from "../tool-registry.js";
import { GerritClient, encodeGerritId } from "../gerrit-client.js";

const e = encodeGerritId;

export const tools: ToolDefinition[] = [
  // ─── Group CRUD ──────────────────────────────────────────
  {
    name: "gerrit_list_groups",
    description:
      "List groups accessible by the caller. Supports query, suggest, pagination, and option fields.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Group query string" },
        n: { type: "number", description: "Limit number of results" },
        S: { type: "number", description: "Skip first N results" },
        suggest: { type: "boolean", description: "Suggest groups" },
        p: { type: "string", description: "Limit to groups owned by this project" },
        o: {
          type: "array",
          items: { type: "string" },
          description: "Additional fields: MEMBERS, INCLUDES",
        },
        r: { type: "string", description: "Regex to filter group names" },
        m: { type: "string", description: "Substring match on group name" },
      },
    },
    handler: async (client, params) => {
      return client.get("/groups/", params as Record<string, string | string[]>);
    },
  },
  {
    name: "gerrit_query_groups",
    description: "Query internal groups using a search string.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Group search query" },
        n: { type: "number", description: "Limit" },
        S: { type: "number", description: "Skip offset" },
      },
      required: ["query"],
    },
    handler: async (client, params) => {
      const query: Record<string, string | number> = { query2: params.query as string };
      if (params.n !== undefined) query.n = params.n as number;
      if (params.S !== undefined) query.S = params.S as number;
      return client.get("/groups/", query);
    },
  },
  {
    name: "gerrit_get_group",
    description: "Retrieve a specific group by name or UUID.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}`);
    },
  },
  {
    name: "gerrit_get_group_detail",
    description: "Retrieve a group with members and includes (subgroups).",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}/detail`);
    },
  },
  {
    name: "gerrit_create_group",
    description: "Create a new internal group.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Group name" },
        description: { type: "string", description: "Group description" },
        visible_to_all: { type: "boolean", description: "Visible to all users" },
        owner: { type: "string", description: "Owner group name/UUID" },
        owner_id: { type: "string", description: "Owner group UUID" },
        members: {
          type: "array",
          items: { type: "string" },
          description: "Initial members (account IDs)",
        },
      },
      required: ["name"],
    },
    handler: async (client, params) => {
      const { name, ...body } = params;
      return client.put(`/groups/${e(name as string)}`, body);
    },
  },
  {
    name: "gerrit_delete_group",
    description: "Delete an internal group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/groups/${e(params.group_id as string)}`);
    },
  },

  // ─── Group Properties ────────────────────────────────────
  {
    name: "gerrit_get_group_name",
    description: "Get the name of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}/name`);
    },
  },
  {
    name: "gerrit_rename_group",
    description: "Rename a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        name: { type: "string", description: "New group name" },
      },
      required: ["group_id", "name"],
    },
    handler: async (client, params) => {
      return client.put(`/groups/${e(params.group_id as string)}/name`, {
        name: params.name,
      });
    },
  },
  {
    name: "gerrit_get_group_description",
    description: "Get the description of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}/description`);
    },
  },
  {
    name: "gerrit_set_group_description",
    description: "Set the description of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        description: { type: "string", description: "Group description" },
      },
      required: ["group_id", "description"],
    },
    handler: async (client, params) => {
      return client.put(`/groups/${e(params.group_id as string)}/description`, {
        description: params.description,
      });
    },
  },
  {
    name: "gerrit_delete_group_description",
    description: "Remove the description of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.delete(`/groups/${e(params.group_id as string)}/description`);
    },
  },
  {
    name: "gerrit_get_group_options",
    description: "Get the options of a group (e.g. visible_to_all).",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}/options`);
    },
  },
  {
    name: "gerrit_set_group_options",
    description: "Set the options of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        visible_to_all: { type: "boolean", description: "Visible to all users" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      const { group_id, ...body } = params;
      return client.put(`/groups/${e(group_id as string)}/options`, body);
    },
  },
  {
    name: "gerrit_get_group_owner",
    description: "Get the owner group of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}/owner`);
    },
  },
  {
    name: "gerrit_set_group_owner",
    description: "Set the owner group of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        owner: { type: "string", description: "Owner group name or UUID" },
      },
      required: ["group_id", "owner"],
    },
    handler: async (client, params) => {
      return client.put(`/groups/${e(params.group_id as string)}/owner`, {
        owner: params.owner,
      });
    },
  },
  {
    name: "gerrit_get_group_audit_log",
    description: "Get the audit log of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}/log.audit`);
    },
  },
  {
    name: "gerrit_index_group",
    description: "Index a group in the secondary index.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.post(`/groups/${e(params.group_id as string)}/index`);
    },
  },

  // ─── Group Members ───────────────────────────────────────
  {
    name: "gerrit_list_group_members",
    description: "List the direct members of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        recursive: { type: "boolean", description: "Include members of subgroups" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      const query: Record<string, string> = {};
      if (params.recursive) query.recursive = "true";
      return client.get(
        `/groups/${e(params.group_id as string)}/members/`,
        query
      );
    },
  },
  {
    name: "gerrit_get_group_member",
    description: "Get a specific member of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        account_id: { type: "string", description: "Account identifier" },
      },
      required: ["group_id", "account_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/groups/${e(params.group_id as string)}/members/${e(
          params.account_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_add_group_member",
    description: "Add a member to a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        account_id: { type: "string", description: "Account to add" },
      },
      required: ["group_id", "account_id"],
    },
    handler: async (client, params) => {
      return client.put(
        `/groups/${e(params.group_id as string)}/members/${e(
          params.account_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_add_group_members",
    description: "Add multiple members to a group at once.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        members: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to add",
        },
      },
      required: ["group_id", "members"],
    },
    handler: async (client, params) => {
      return client.post(
        `/groups/${e(params.group_id as string)}/members.add`,
        { members: params.members }
      );
    },
  },
  {
    name: "gerrit_remove_group_member",
    description: "Remove a member from a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        account_id: { type: "string", description: "Account to remove" },
      },
      required: ["group_id", "account_id"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/groups/${e(params.group_id as string)}/members/${e(
          params.account_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_remove_group_members",
    description: "Remove multiple members from a group at once.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
        members: {
          type: "array",
          items: { type: "string" },
          description: "Account IDs to remove",
        },
      },
      required: ["group_id", "members"],
    },
    handler: async (client, params) => {
      return client.post(
        `/groups/${e(params.group_id as string)}/members.delete`,
        { members: params.members }
      );
    },
  },

  // ─── Subgroups ───────────────────────────────────────────
  {
    name: "gerrit_list_subgroups",
    description: "List the direct subgroups of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Group name or UUID" },
      },
      required: ["group_id"],
    },
    handler: async (client, params) => {
      return client.get(`/groups/${e(params.group_id as string)}/groups/`);
    },
  },
  {
    name: "gerrit_get_subgroup",
    description: "Get a specific subgroup of a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Parent group name or UUID" },
        subgroup_id: { type: "string", description: "Subgroup name or UUID" },
      },
      required: ["group_id", "subgroup_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/groups/${e(params.group_id as string)}/groups/${e(
          params.subgroup_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_add_subgroup",
    description: "Add a subgroup to a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Parent group name or UUID" },
        subgroup_id: { type: "string", description: "Subgroup name or UUID to add" },
      },
      required: ["group_id", "subgroup_id"],
    },
    handler: async (client, params) => {
      return client.put(
        `/groups/${e(params.group_id as string)}/groups/${e(
          params.subgroup_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_add_subgroups",
    description: "Add multiple subgroups to a group at once.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Parent group name or UUID" },
        groups: {
          type: "array",
          items: { type: "string" },
          description: "Subgroup names or UUIDs to add",
        },
      },
      required: ["group_id", "groups"],
    },
    handler: async (client, params) => {
      return client.post(
        `/groups/${e(params.group_id as string)}/groups.add`,
        { groups: params.groups }
      );
    },
  },
  {
    name: "gerrit_remove_subgroup",
    description: "Remove a subgroup from a group.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Parent group name or UUID" },
        subgroup_id: { type: "string", description: "Subgroup name or UUID to remove" },
      },
      required: ["group_id", "subgroup_id"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/groups/${e(params.group_id as string)}/groups/${e(
          params.subgroup_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_remove_subgroups",
    description: "Remove multiple subgroups from a group at once.",
    inputSchema: {
      type: "object",
      properties: {
        group_id: { type: "string", description: "Parent group name or UUID" },
        groups: {
          type: "array",
          items: { type: "string" },
          description: "Subgroup names or UUIDs to remove",
        },
      },
      required: ["group_id", "groups"],
    },
    handler: async (client, params) => {
      return client.post(
        `/groups/${e(params.group_id as string)}/groups.delete`,
        { groups: params.groups }
      );
    },
  },
];
