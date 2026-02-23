import { ToolDefinition } from "../tool-registry.js";
import { GerritClient, encodeGerritId } from "../gerrit-client.js";

const e = encodeGerritId;

export const tools: ToolDefinition[] = [
  // ═══════════════════════════════════════════════════════════
  //  PROJECT CRUD
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_list_projects",
    description:
      "List projects accessible by the caller. Supports filtering by prefix, regex, substring, type, and state.",
    inputSchema: {
      type: "object",
      properties: {
        n: { type: "number", description: "Limit number of results" },
        S: { type: "number", description: "Skip first N results" },
        p: { type: "string", description: "Filter by project name prefix" },
        r: { type: "string", description: "Filter by regex on project name" },
        m: { type: "string", description: "Filter by substring match" },
        b: { type: "string", description: "Limit to projects with this branch" },
        type: {
          type: "string",
          enum: ["ALL", "CODE", "PERMISSIONS"],
          description: "Project type filter",
        },
        state: {
          type: "string",
          enum: ["ACTIVE", "READ_ONLY", "HIDDEN"],
          description: "Project state filter",
        },
        d: { type: "boolean", description: "Include project description" },
        t: { type: "boolean", description: "Include tree-like folder structure" },
      },
    },
    handler: async (client, params) => {
      return client.get("/projects/", params as Record<string, string | number | boolean>);
    },
  },
  {
    name: "gerrit_query_projects",
    description: "Query projects using Gerrit project search operators.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Project query string" },
        n: { type: "number", description: "Limit" },
        S: { type: "number", description: "Skip offset" },
      },
      required: ["query"],
    },
    handler: async (client, params) => {
      const q: Record<string, string | number> = { query: params.query as string };
      if (params.n !== undefined) q.n = params.n as number;
      if (params.S !== undefined) q.S = params.S as number;
      return client.get("/projects/", q);
    },
  },
  {
    name: "gerrit_get_project",
    description: "Retrieve information about a specific project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(`/projects/${e(params.project_name as string)}`);
    },
  },
  {
    name: "gerrit_create_project",
    description: "Create a new project.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        parent: { type: "string", description: "Parent project name" },
        description: { type: "string", description: "Project description" },
        permissions_only: { type: "boolean", description: "Permissions-only project" },
        create_empty_commit: { type: "boolean", description: "Create initial empty commit" },
        submit_type: {
          type: "string",
          enum: [
            "INHERIT",
            "FAST_FORWARD_ONLY",
            "MERGE_IF_NECESSARY",
            "REBASE_IF_NECESSARY",
            "REBASE_ALWAYS",
            "MERGE_ALWAYS",
            "CHERRY_PICK",
          ],
          description: "Submit type",
        },
        branches: {
          type: "array",
          items: { type: "string" },
          description: "Initial branches to create",
        },
        owners: {
          type: "array",
          items: { type: "string" },
          description: "Group names/UUIDs for project ownership",
        },
        reject_empty_commit: { type: "string", enum: ["TRUE", "FALSE", "INHERIT"] },
      },
      required: ["name"],
    },
    handler: async (client, params) => {
      const { name, ...body } = params;
      return client.put(`/projects/${e(name as string)}`, body);
    },
  },

  // ─── Project Properties ──────────────────────────────────
  {
    name: "gerrit_get_project_description",
    description: "Get the description of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(`/projects/${e(params.project_name as string)}/description`);
    },
  },
  {
    name: "gerrit_set_project_description",
    description: "Set the description of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        description: { type: "string", description: "New description" },
        commit_message: { type: "string", description: "Commit message for the change" },
      },
      required: ["project_name", "description"],
    },
    handler: async (client, params) => {
      return client.put(
        `/projects/${e(params.project_name as string)}/description`,
        { description: params.description, commit_message: params.commit_message }
      );
    },
  },
  {
    name: "gerrit_delete_project_description",
    description: "Remove the description of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.delete(`/projects/${e(params.project_name as string)}/description`);
    },
  },
  {
    name: "gerrit_get_project_parent",
    description: "Get the parent project of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(`/projects/${e(params.project_name as string)}/parent`);
    },
  },
  {
    name: "gerrit_set_project_parent",
    description: "Set the parent project of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        parent: { type: "string", description: "Parent project name" },
        commit_message: { type: "string", description: "Commit message" },
      },
      required: ["project_name", "parent"],
    },
    handler: async (client, params) => {
      return client.put(`/projects/${e(params.project_name as string)}/parent`, {
        parent: params.parent,
        commit_message: params.commit_message,
      });
    },
  },
  {
    name: "gerrit_get_project_head",
    description: "Get the HEAD ref of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(`/projects/${e(params.project_name as string)}/HEAD`);
    },
  },
  {
    name: "gerrit_set_project_head",
    description: "Set the HEAD ref of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        ref: { type: "string", description: "New HEAD ref (e.g. refs/heads/main)" },
      },
      required: ["project_name", "ref"],
    },
    handler: async (client, params) => {
      return client.put(`/projects/${e(params.project_name as string)}/HEAD`, {
        ref: params.ref,
      });
    },
  },
  {
    name: "gerrit_get_project_config",
    description: "Retrieve the configuration of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(`/projects/${e(params.project_name as string)}/config`);
    },
  },
  {
    name: "gerrit_set_project_config",
    description: "Set the configuration of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        description: { type: "string" },
        use_contributor_agreements: { type: "string", enum: ["TRUE", "FALSE", "INHERIT"] },
        use_content_merge: { type: "string", enum: ["TRUE", "FALSE", "INHERIT"] },
        use_signed_off_by: { type: "string", enum: ["TRUE", "FALSE", "INHERIT"] },
        create_new_change_for_all_not_in_target: {
          type: "string",
          enum: ["TRUE", "FALSE", "INHERIT"],
        },
        require_change_id: { type: "string", enum: ["TRUE", "FALSE", "INHERIT"] },
        reject_empty_commit: { type: "string", enum: ["TRUE", "FALSE", "INHERIT"] },
        max_object_size_limit: { type: "string" },
        submit_type: { type: "string" },
        state: { type: "string", enum: ["ACTIVE", "READ_ONLY", "HIDDEN"] },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      const { project_name, ...body } = params;
      return client.put(`/projects/${e(project_name as string)}/config`, body);
    },
  },
  {
    name: "gerrit_get_project_statistics",
    description: "Get Git repository statistics for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(`/projects/${e(params.project_name as string)}/statistics.git`);
    },
  },
  {
    name: "gerrit_run_gc",
    description: "Run Git garbage collection for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        show_progress: { type: "boolean", description: "Show GC progress in response" },
        aggressive: { type: "boolean", description: "Use aggressive GC" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      const { project_name, ...body } = params;
      return client.post(`/projects/${e(project_name as string)}/gc`, body);
    },
  },
  {
    name: "gerrit_ban_commits",
    description: "Ban commits from a project repository.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        commits: {
          type: "array",
          items: { type: "string" },
          description: "Commit SHA-1s to ban",
        },
        reason: { type: "string", description: "Reason for banning" },
      },
      required: ["project_name", "commits"],
    },
    handler: async (client, params) => {
      return client.put(`/projects/${e(params.project_name as string)}/ban`, {
        commits: params.commits,
        reason: params.reason,
      });
    },
  },
  {
    name: "gerrit_index_project",
    description: "Index a project in the secondary index.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.post(`/projects/${e(params.project_name as string)}/index`);
    },
  },
  {
    name: "gerrit_index_project_changes",
    description: "Index all changes of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.post(
        `/projects/${e(params.project_name as string)}/index.changes`
      );
    },
  },
  {
    name: "gerrit_check_project",
    description: "Perform consistency checks on a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.post(`/projects/${e(params.project_name as string)}/check`);
    },
  },

  // ─── Project Access Rights ───────────────────────────────
  {
    name: "gerrit_get_project_access",
    description: "List access rights for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(`/projects/${e(params.project_name as string)}/access`);
    },
  },
  {
    name: "gerrit_set_project_access",
    description: "Update access rights for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        add: {
          type: "object",
          description: "Access sections to add (ref -> permissions)",
        },
        remove: {
          type: "object",
          description: "Access sections to remove",
        },
        message: { type: "string", description: "Commit message" },
        parent: { type: "string", description: "New parent project for rights inheritance" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      const { project_name, ...body } = params;
      return client.post(
        `/projects/${e(project_name as string)}/access`,
        body
      );
    },
  },
  {
    name: "gerrit_create_access_change",
    description: "Create a change for access rights review instead of applying directly.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        add: { type: "object", description: "Access sections to add" },
        remove: { type: "object", description: "Access sections to remove" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      const { project_name, ...body } = params;
      return client.put(
        `/projects/${e(project_name as string)}/access:review`,
        body
      );
    },
  },
  {
    name: "gerrit_check_project_access",
    description: "Check access for a specific user/ref combination on a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        account: { type: "string", description: "Account to check access for" },
        ref: { type: "string", description: "Branch/ref to check" },
        permission: { type: "string", description: "Permission to check (e.g. push)" },
      },
      required: ["project_name", "account"],
    },
    handler: async (client, params) => {
      const query: Record<string, string> = { account: params.account as string };
      if (params.ref) query.ref = params.ref as string;
      if (params.permission) query.perm = params.permission as string;
      return client.get(
        `/projects/${e(params.project_name as string)}/check.access`,
        query
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  BRANCHES
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_list_branches",
    description: "List the branches of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        n: { type: "number", description: "Limit number of results" },
        S: { type: "number", description: "Skip first N results" },
        m: { type: "string", description: "Substring match on branch name" },
        r: { type: "string", description: "Regex filter on branch name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      const { project_name, ...query } = params;
      return client.get(
        `/projects/${e(project_name as string)}/branches/`,
        query as Record<string, string | number>
      );
    },
  },
  {
    name: "gerrit_get_branch",
    description: "Retrieve a specific branch of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        branch: { type: "string", description: "Branch name (without refs/heads/ prefix)" },
      },
      required: ["project_name", "branch"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/branches/${e(
          params.branch as string
        )}`
      );
    },
  },
  {
    name: "gerrit_create_branch",
    description: "Create a new branch in a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        branch: { type: "string", description: "Branch name to create" },
        revision: {
          type: "string",
          description: "Base revision (SHA-1 or branch name) for the new branch",
        },
      },
      required: ["project_name", "branch"],
    },
    handler: async (client, params) => {
      return client.put(
        `/projects/${e(params.project_name as string)}/branches/${e(
          params.branch as string
        )}`,
        { revision: params.revision }
      );
    },
  },
  {
    name: "gerrit_delete_branch",
    description: "Delete a branch from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        branch: { type: "string", description: "Branch name to delete" },
      },
      required: ["project_name", "branch"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/projects/${e(params.project_name as string)}/branches/${e(
          params.branch as string
        )}`
      );
    },
  },
  {
    name: "gerrit_delete_branches",
    description: "Delete multiple branches from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        branches: {
          type: "array",
          items: { type: "string" },
          description: "Branch names to delete",
        },
      },
      required: ["project_name", "branches"],
    },
    handler: async (client, params) => {
      return client.post(
        `/projects/${e(params.project_name as string)}/branches:delete`,
        { branches: params.branches }
      );
    },
  },
  {
    name: "gerrit_get_branch_file_content",
    description: "Get the content of a file from a branch.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        branch: { type: "string", description: "Branch name" },
        file_path: { type: "string", description: "File path" },
      },
      required: ["project_name", "branch", "file_path"],
    },
    handler: async (client, params) => {
      return client.request(
        "GET",
        `/projects/${e(params.project_name as string)}/branches/${e(
          params.branch as string
        )}/files/${e(params.file_path as string)}/content`,
        { rawResponse: true }
      );
    },
  },
  {
    name: "gerrit_get_branch_reflog",
    description: "Get the reflog of a branch.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        branch: { type: "string", description: "Branch name" },
      },
      required: ["project_name", "branch"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/branches/${e(
          params.branch as string
        )}/reflog`
      );
    },
  },
  {
    name: "gerrit_check_branch_mergeable",
    description: "Check if a source ref is mergeable into a branch.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        branch: { type: "string", description: "Destination branch name" },
        source: { type: "string", description: "Source ref or SHA-1" },
        strategy: {
          type: "string",
          description: "Merge strategy (e.g. recursive, resolve)",
        },
      },
      required: ["project_name", "branch", "source"],
    },
    handler: async (client, params) => {
      const query: Record<string, string> = { source: params.source as string };
      if (params.strategy) query.strategy = params.strategy as string;
      return client.get(
        `/projects/${e(params.project_name as string)}/branches/${e(
          params.branch as string
        )}/mergeable`,
        query
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  TAGS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_list_tags",
    description: "List the tags of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        n: { type: "number", description: "Limit" },
        S: { type: "number", description: "Skip" },
        m: { type: "string", description: "Substring match" },
        r: { type: "string", description: "Regex filter" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      const { project_name, ...query } = params;
      return client.get(
        `/projects/${e(project_name as string)}/tags/`,
        query as Record<string, string | number>
      );
    },
  },
  {
    name: "gerrit_get_tag",
    description: "Retrieve a specific tag of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        tag: { type: "string", description: "Tag name" },
      },
      required: ["project_name", "tag"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/tags/${e(params.tag as string)}`
      );
    },
  },
  {
    name: "gerrit_create_tag",
    description: "Create a new tag in a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        tag: { type: "string", description: "Tag name" },
        revision: { type: "string", description: "Revision to tag" },
        message: { type: "string", description: "Tag message (for annotated tags)" },
      },
      required: ["project_name", "tag"],
    },
    handler: async (client, params) => {
      const { project_name, tag, ...body } = params;
      return client.put(
        `/projects/${e(project_name as string)}/tags/${e(tag as string)}`,
        body
      );
    },
  },
  {
    name: "gerrit_delete_tag",
    description: "Delete a tag from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        tag: { type: "string", description: "Tag name" },
      },
      required: ["project_name", "tag"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/projects/${e(params.project_name as string)}/tags/${e(params.tag as string)}`
      );
    },
  },
  {
    name: "gerrit_delete_tags",
    description: "Delete multiple tags from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tag names to delete",
        },
      },
      required: ["project_name", "tags"],
    },
    handler: async (client, params) => {
      return client.post(
        `/projects/${e(params.project_name as string)}/tags:delete`,
        { tags: params.tags }
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  COMMITS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_get_commit",
    description: "Retrieve a specific commit from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        commit_id: { type: "string", description: "Commit SHA-1" },
      },
      required: ["project_name", "commit_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/commits/${e(
          params.commit_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_get_commit_included_in",
    description: "Get the branches and tags that contain a specific commit.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        commit_id: { type: "string", description: "Commit SHA-1" },
      },
      required: ["project_name", "commit_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/commits/${e(
          params.commit_id as string
        )}/in`
      );
    },
  },
  {
    name: "gerrit_list_commit_files",
    description: "List files modified by a commit.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        commit_id: { type: "string", description: "Commit SHA-1" },
      },
      required: ["project_name", "commit_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/commits/${e(
          params.commit_id as string
        )}/files/`
      );
    },
  },
  {
    name: "gerrit_get_commit_file_content",
    description: "Get the content of a file at a specific commit.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        commit_id: { type: "string", description: "Commit SHA-1" },
        file_path: { type: "string", description: "File path" },
      },
      required: ["project_name", "commit_id", "file_path"],
    },
    handler: async (client, params) => {
      return client.request(
        "GET",
        `/projects/${e(params.project_name as string)}/commits/${e(
          params.commit_id as string
        )}/files/${e(params.file_path as string)}/content`,
        { rawResponse: true }
      );
    },
  },
  {
    name: "gerrit_cherry_pick_commit",
    description: "Cherry-pick a commit to a destination branch.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        commit_id: { type: "string", description: "Commit SHA-1" },
        destination: { type: "string", description: "Destination branch" },
        message: { type: "string", description: "Commit message" },
      },
      required: ["project_name", "commit_id", "destination"],
    },
    handler: async (client, params) => {
      const { project_name, commit_id, ...body } = params;
      return client.post(
        `/projects/${e(project_name as string)}/commits/${e(
          commit_id as string
        )}/cherrypick`,
        body
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  CHILD PROJECTS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_list_child_projects",
    description: "List the direct child projects of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        recursive: { type: "boolean", description: "List child projects recursively" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      const query: Record<string, string> = {};
      if (params.recursive) query.recursive = "true";
      return client.get(
        `/projects/${e(params.project_name as string)}/children/`,
        query
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  DASHBOARDS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_list_dashboards",
    description: "List the custom dashboards of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/dashboards/`
      );
    },
  },
  {
    name: "gerrit_get_dashboard",
    description: "Retrieve a specific dashboard of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        dashboard_id: { type: "string", description: "Dashboard ID (ref:path)" },
      },
      required: ["project_name", "dashboard_id"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/dashboards/${e(
          params.dashboard_id as string
        )}`
      );
    },
  },
  {
    name: "gerrit_create_dashboard",
    description: "Create or update a dashboard for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        dashboard_id: { type: "string", description: "Dashboard ID (ref:path)" },
        id: { type: "string", description: "Dashboard ID" },
        commit_message: { type: "string", description: "Commit message" },
      },
      required: ["project_name", "dashboard_id"],
    },
    handler: async (client, params) => {
      const { project_name, dashboard_id, ...body } = params;
      return client.put(
        `/projects/${e(project_name as string)}/dashboards/${e(
          dashboard_id as string
        )}`,
        body
      );
    },
  },
  {
    name: "gerrit_delete_dashboard",
    description: "Delete a dashboard from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        dashboard_id: { type: "string", description: "Dashboard ID" },
      },
      required: ["project_name", "dashboard_id"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/projects/${e(params.project_name as string)}/dashboards/${e(
          params.dashboard_id as string
        )}`
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  LABELS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_list_project_labels",
    description: "List label definitions for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/labels/`
      );
    },
  },
  {
    name: "gerrit_get_project_label",
    description: "Retrieve a specific label definition.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        label_name: { type: "string", description: "Label name" },
      },
      required: ["project_name", "label_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/labels/${e(
          params.label_name as string
        )}`
      );
    },
  },
  {
    name: "gerrit_create_project_label",
    description: "Create a new label definition for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        name: { type: "string", description: "Label name" },
        values: {
          type: "object",
          description: "Label values, e.g. {'-2': 'Rejected', '-1': 'Needs work', '0': 'No score', '+1': 'Approved', '+2': 'Looks good'}",
        },
        default_value: { type: "number", description: "Default value" },
        function: {
          type: "string",
          description: "Label function (MaxWithBlock, MaxNoBlock, etc.)",
        },
        copy_condition: { type: "string", description: "Copy condition expression" },
        allow_post_submit: { type: "boolean" },
        ignore_self_approval: { type: "boolean" },
        commit_message: { type: "string" },
      },
      required: ["project_name", "name", "values"],
    },
    handler: async (client, params) => {
      const { project_name, name, ...body } = params;
      return client.put(
        `/projects/${e(project_name as string)}/labels/${e(name as string)}`,
        body
      );
    },
  },
  {
    name: "gerrit_delete_project_label",
    description: "Delete a label definition from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        label_name: { type: "string", description: "Label name" },
        commit_message: { type: "string" },
      },
      required: ["project_name", "label_name"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/projects/${e(params.project_name as string)}/labels/${e(
          params.label_name as string
        )}`
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  SUBMIT REQUIREMENTS
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_list_submit_requirements",
    description: "List submit requirements of a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
      },
      required: ["project_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/submit_requirements/`
      );
    },
  },
  {
    name: "gerrit_get_submit_requirement",
    description: "Retrieve a specific submit requirement.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        requirement_name: { type: "string", description: "Submit requirement name" },
      },
      required: ["project_name", "requirement_name"],
    },
    handler: async (client, params) => {
      return client.get(
        `/projects/${e(params.project_name as string)}/submit_requirements/${e(
          params.requirement_name as string
        )}`
      );
    },
  },
  {
    name: "gerrit_create_submit_requirement",
    description: "Create or update a submit requirement for a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        name: { type: "string", description: "Submit requirement name" },
        description: { type: "string", description: "Description" },
        applicability_expression: { type: "string", description: "Applicability expression" },
        submittability_expression: {
          type: "string",
          description: "Submittability expression",
        },
        override_expression: { type: "string", description: "Override expression" },
        allow_override_in_child_projects: { type: "boolean" },
        commit_message: { type: "string" },
      },
      required: ["project_name", "name", "submittability_expression"],
    },
    handler: async (client, params) => {
      const { project_name, name, ...body } = params;
      return client.put(
        `/projects/${e(project_name as string)}/submit_requirements/${e(
          name as string
        )}`,
        body
      );
    },
  },
  {
    name: "gerrit_delete_submit_requirement",
    description: "Delete a submit requirement from a project.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Project name" },
        requirement_name: { type: "string", description: "Submit requirement name" },
      },
      required: ["project_name", "requirement_name"],
    },
    handler: async (client, params) => {
      return client.delete(
        `/projects/${e(params.project_name as string)}/submit_requirements/${e(
          params.requirement_name as string
        )}`
      );
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  DOCUMENTATION SEARCH
  // ═══════════════════════════════════════════════════════════

  {
    name: "gerrit_search_documentation",
    description: "Search the Gerrit documentation index.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Documentation search query" },
      },
      required: ["q"],
    },
    handler: async (client, params) => {
      return client.get("/Documentation/", { q: params.q as string });
    },
  },
];
