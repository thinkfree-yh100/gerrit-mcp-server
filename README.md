# Gerrit MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that provides comprehensive access to the [Gerrit Code Review](https://www.gerritcodereview.com/) REST API.

**250 tools** covering all major Gerrit API endpoints — changes, reviews, projects, branches, accounts, groups, and more.

## Requirements

- **Node.js 18+**

## Quick Start

```bash
# Clone and build
git clone https://github.com/thinkfree-yh100/gerrit-mcp-server.git
cd gerrit-mcp-server
npm install
npm run build
```

## Configuration

The server is configured via environment variables:

| Variable | Required | Description |
|---|---|---|
| `GERRIT_BASE_URL` | Yes | Gerrit server URL (e.g. `https://gerrit.example.com`) |
| `GERRIT_USERNAME` | No | Username for HTTP Basic Auth |
| `GERRIT_PASSWORD` | No | HTTP password or token |

> **Note**: Without credentials, the server accesses Gerrit anonymously. Authenticated access uses the `/a/` prefix automatically.

### Generate HTTP Password

In Gerrit, go to **Settings → HTTP Credentials** and click **Generate New Password**.

## MCP Client Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gerrit": {
      "command": "node",
      "args": ["/path/to/gerrit-mcp-server/dist/index.js"],
      "env": {
        "GERRIT_BASE_URL": "https://gerrit.example.com",
        "GERRIT_USERNAME": "your-username",
        "GERRIT_PASSWORD": "your-http-password"
      }
    }
  }
}
```

### Claude Code

Add to your `.claude/settings.json` or project `CLAUDE.md`:

```json
{
  "mcpServers": {
    "gerrit": {
      "command": "node",
      "args": ["/path/to/gerrit-mcp-server/dist/index.js"],
      "env": {
        "GERRIT_BASE_URL": "https://gerrit.example.com",
        "GERRIT_USERNAME": "your-username",
        "GERRIT_PASSWORD": "your-http-password"
      }
    }
  }
}
```

## Available Tools (250)

### Access Rights (1)

| Tool | Description |
|---|---|
| `gerrit_list_access_rights` | List access rights for one or more projects |

### Accounts (41)

| Tool | Description |
|---|---|
| `gerrit_search_accounts` | Search/suggest accounts |
| `gerrit_get_account` | Retrieve account information |
| `gerrit_get_account_detail` | Retrieve detailed account info |
| `gerrit_create_account` | Create a new user account |
| `gerrit_get_account_name` | Get account full name |
| `gerrit_set_account_name` | Set account full name |
| `gerrit_get_account_status` | Get account status message |
| `gerrit_set_account_status` | Set account status message |
| `gerrit_get_account_active` | Check if account is active |
| `gerrit_set_account_active` | Activate/deactivate account |
| `gerrit_list_account_emails` | List email addresses |
| `gerrit_add_account_email` | Register email address |
| `gerrit_delete_account_email` | Delete email address |
| `gerrit_set_preferred_email` | Set preferred email |
| `gerrit_list_ssh_keys` | List SSH keys |
| `gerrit_add_ssh_key` | Add SSH key |
| `gerrit_delete_ssh_key` | Delete SSH key |
| `gerrit_list_gpg_keys` | List GPG keys |
| `gerrit_get_account_capabilities` | List global capabilities |
| `gerrit_list_account_groups` | List groups containing user |
| `gerrit_get_account_preferences` | Get user preferences |
| `gerrit_set_account_preferences` | Set user preferences |
| `gerrit_get_diff_preferences` | Get diff preferences |
| `gerrit_set_diff_preferences` | Set diff preferences |
| `gerrit_get_edit_preferences` | Get edit preferences |
| `gerrit_set_edit_preferences` | Set edit preferences |
| `gerrit_list_watched_projects` | List watched projects |
| `gerrit_set_watched_projects` | Add/update watched projects |
| `gerrit_delete_watched_projects` | Remove watched projects |
| `gerrit_list_external_ids` | List external identifiers |
| `gerrit_delete_external_ids` | Delete external identifiers |
| `gerrit_list_starred_changes` | List starred changes |
| `gerrit_star_change` | Star a change |
| `gerrit_unstar_change` | Unstar a change |
| `gerrit_list_contributor_agreements` | List signed CLAs |
| `gerrit_sign_contributor_agreement` | Sign a CLA |
| `gerrit_delete_account` | Delete an account |
| `gerrit_index_account` | Reindex account |
| `gerrit_generate_http_password` | Generate HTTP password |
| `gerrit_delete_http_password` | Delete HTTP password |
| `gerrit_delete_account_draft_comments` | Delete draft comments |

### Changes (87)

Core change operations, reviews, comments, revisions, files, and edits.

| Tool | Description |
|---|---|
| `gerrit_query_changes` | Query changes with Gerrit search operators |
| `gerrit_get_change` | Retrieve change information |
| `gerrit_get_change_detail` | Get change with labels, accounts, messages |
| `gerrit_create_change` | Create a new change |
| `gerrit_delete_change` | Delete a change |
| `gerrit_get_change_topic` | Get change topic |
| `gerrit_set_change_topic` | Set change topic |
| `gerrit_delete_change_topic` | Remove change topic |
| `gerrit_get_change_commit_message` | Get commit message |
| `gerrit_set_change_commit_message` | Update commit message |
| `gerrit_get_change_hashtags` | Get hashtags |
| `gerrit_set_change_hashtags` | Add/remove hashtags |
| `gerrit_get_custom_keyed_values` | Get custom key-value pairs |
| `gerrit_set_custom_keyed_values` | Set custom key-value pairs |
| `gerrit_abandon_change` | Abandon a change |
| `gerrit_restore_change` | Restore an abandoned change |
| `gerrit_rebase_change` | Rebase a change |
| `gerrit_rebase_chain` | Rebase an ancestry chain |
| `gerrit_move_change` | Move to different branch |
| `gerrit_revert_change` | Revert a change |
| `gerrit_revert_submission` | Revert all submitted together |
| `gerrit_submit_change` | Submit a change |
| `gerrit_get_submitted_together` | List changes submitted together |
| `gerrit_set_work_in_progress` | Mark as WIP |
| `gerrit_set_ready_for_review` | Mark as ready |
| `gerrit_set_private` | Mark as private |
| `gerrit_unset_private` | Unmark private |
| `gerrit_get_pure_revert` | Check if pure revert |
| `gerrit_get_change_included_in` | Get branches/tags containing change |
| `gerrit_index_change` | Reindex change |
| `gerrit_check_change` | Consistency check |
| `gerrit_fix_change` | Fix consistency issues |
| `gerrit_check_submit_requirement` | Test submit requirement |
| `gerrit_list_change_messages` | List change messages |
| `gerrit_get_change_message` | Get specific message |
| `gerrit_delete_change_message` | Delete message |
| `gerrit_list_change_comments` | List published comments |
| `gerrit_list_change_drafts` | List draft comments |
| `gerrit_get_attention_set` | Get attention set |
| `gerrit_add_to_attention_set` | Add user to attention set |
| `gerrit_remove_from_attention_set` | Remove from attention set |
| `gerrit_list_reviewers` | List reviewers |
| `gerrit_suggest_reviewers` | Suggest reviewers |
| `gerrit_get_reviewer` | Get reviewer details |
| `gerrit_add_reviewer` | Add reviewer |
| `gerrit_remove_reviewer` | Remove reviewer |
| `gerrit_list_reviewer_votes` | List reviewer votes |
| `gerrit_delete_vote` | Remove a vote |
| `gerrit_get_change_edit` | Get change edit details |
| `gerrit_modify_file_in_edit` | Create/modify file in edit |
| `gerrit_delete_file_in_edit` | Delete file from edit |
| `gerrit_get_file_in_edit` | Get file content from edit |
| `gerrit_restore_file_in_edit` | Restore file in edit |
| `gerrit_rename_file_in_edit` | Rename file in edit |
| `gerrit_delete_change_edit` | Discard edit |
| `gerrit_publish_change_edit` | Publish edit as new patch set |
| `gerrit_rebase_change_edit` | Rebase edit |
| `gerrit_get_edit_commit_message` | Get edit commit message |
| `gerrit_set_edit_commit_message` | Set edit commit message |
| `gerrit_get_revision` | Get revision details |
| `gerrit_get_revision_commit` | Get revision commit info |
| `gerrit_get_revision_description` | Get patch set description |
| `gerrit_set_revision_description` | Set patch set description |
| `gerrit_get_revision_actions` | Get available actions |
| `gerrit_set_review` | Post review (labels, comments, message) |
| `gerrit_get_related_changes` | Get dependency chain |
| `gerrit_get_revision_patch` | Get patch in unified diff |
| `gerrit_get_mergeable` | Check mergeability |
| `gerrit_get_submit_type` | Get submit type |
| `gerrit_cherry_pick_revision` | Cherry-pick to branch |
| `gerrit_get_merge_list` | Get merge list |
| `gerrit_list_revision_files` | List modified files |
| `gerrit_get_file_content` | Get file content |
| `gerrit_get_file_diff` | Get file diff |
| `gerrit_get_file_blame` | Get blame info |
| `gerrit_set_file_reviewed` | Mark file reviewed |
| `gerrit_unset_file_reviewed` | Unmark file reviewed |
| `gerrit_list_revision_comments` | List revision comments |
| `gerrit_get_revision_comment` | Get specific comment |
| `gerrit_delete_revision_comment` | Delete comment |
| `gerrit_list_ported_comments` | List ported comments |
| `gerrit_list_revision_drafts` | List drafts |
| `gerrit_create_draft_comment` | Create draft comment |
| `gerrit_update_draft_comment` | Update draft |
| `gerrit_delete_draft_comment` | Delete draft |
| `gerrit_apply_fix` | Apply fix suggestion |
| `gerrit_preview_fix` | Preview fix suggestion |

### Config (31)

| Tool | Description |
|---|---|
| `gerrit_get_server_version` | Get Gerrit version |
| `gerrit_get_server_info` | Get server configuration |
| `gerrit_get_server_summary` | Get server state summary |
| `gerrit_get_server_capabilities` | List global capabilities |
| `gerrit_get_top_menus` | Get plugin menu entries |
| `gerrit_reload_config` | Reload gerrit.config |
| `gerrit_confirm_email` | Validate email with token |
| `gerrit_list_experiments` | List experiments |
| `gerrit_get_experiment` | Get experiment details |
| `gerrit_list_global_labels` | List global labels |
| `gerrit_list_global_submit_requirements` | List global submit requirements |
| `gerrit_check_consistency` | Server consistency check |
| `gerrit_cleanup_changes` | Abandon stale changes |
| `gerrit_deactivate_stale_accounts` | Deactivate stale accounts |
| `gerrit_list_caches` | List server caches |
| `gerrit_get_cache` | Get cache info |
| `gerrit_flush_cache` | Flush specific cache |
| `gerrit_flush_all_caches` | Flush all caches |
| `gerrit_get_default_preferences` | Get default user prefs |
| `gerrit_set_default_preferences` | Set default user prefs |
| `gerrit_get_default_diff_preferences` | Get default diff prefs |
| `gerrit_set_default_diff_preferences` | Set default diff prefs |
| `gerrit_get_default_edit_preferences` | Get default edit prefs |
| `gerrit_set_default_edit_preferences` | Set default edit prefs |
| `gerrit_list_tasks` | List background tasks |
| `gerrit_get_task` | Get task info |
| `gerrit_delete_task` | Kill a task |
| `gerrit_list_indexes` | List secondary indexes |
| `gerrit_get_index` | Get index info |
| `gerrit_index_changes_batch` | Reindex specific changes |
| `gerrit_snapshot_indexes` | Snapshot all indexes |

### Groups (29)

| Tool | Description |
|---|---|
| `gerrit_list_groups` | List accessible groups |
| `gerrit_query_groups` | Query internal groups |
| `gerrit_get_group` | Get group by name/UUID |
| `gerrit_get_group_detail` | Get group with members |
| `gerrit_create_group` | Create internal group |
| `gerrit_delete_group` | Delete internal group |
| `gerrit_get_group_name` | Get group name |
| `gerrit_rename_group` | Rename group |
| `gerrit_get_group_description` | Get description |
| `gerrit_set_group_description` | Set description |
| `gerrit_delete_group_description` | Remove description |
| `gerrit_get_group_options` | Get options |
| `gerrit_set_group_options` | Set options |
| `gerrit_get_group_owner` | Get owner group |
| `gerrit_set_group_owner` | Set owner group |
| `gerrit_get_group_audit_log` | Get audit log |
| `gerrit_index_group` | Reindex group |
| `gerrit_list_group_members` | List members |
| `gerrit_get_group_member` | Get specific member |
| `gerrit_add_group_member` | Add member |
| `gerrit_add_group_members` | Add multiple members |
| `gerrit_remove_group_member` | Remove member |
| `gerrit_remove_group_members` | Remove multiple members |
| `gerrit_list_subgroups` | List subgroups |
| `gerrit_get_subgroup` | Get subgroup |
| `gerrit_add_subgroup` | Add subgroup |
| `gerrit_add_subgroups` | Add multiple subgroups |
| `gerrit_remove_subgroup` | Remove subgroup |
| `gerrit_remove_subgroups` | Remove multiple subgroups |

### Plugins (6)

| Tool | Description |
|---|---|
| `gerrit_list_plugins` | List installed plugins |
| `gerrit_get_plugin_status` | Get plugin status |
| `gerrit_enable_plugin` | Enable plugin |
| `gerrit_disable_plugin` | Disable plugin |
| `gerrit_reload_plugin` | Reload plugin |
| `gerrit_install_plugin` | Install plugin from URL |

### Projects (55)

Projects, branches, tags, commits, dashboards, labels, and submit requirements.

| Tool | Description |
|---|---|
| `gerrit_list_projects` | List accessible projects |
| `gerrit_query_projects` | Query projects |
| `gerrit_get_project` | Get project info |
| `gerrit_create_project` | Create project |
| `gerrit_get_project_description` | Get description |
| `gerrit_set_project_description` | Set description |
| `gerrit_delete_project_description` | Remove description |
| `gerrit_get_project_parent` | Get parent project |
| `gerrit_set_project_parent` | Set parent project |
| `gerrit_get_project_head` | Get HEAD ref |
| `gerrit_set_project_head` | Set HEAD ref |
| `gerrit_get_project_config` | Get project config |
| `gerrit_set_project_config` | Set project config |
| `gerrit_get_project_statistics` | Get repo statistics |
| `gerrit_run_gc` | Run git GC |
| `gerrit_ban_commits` | Ban commits |
| `gerrit_index_project` | Reindex project |
| `gerrit_index_project_changes` | Reindex all project changes |
| `gerrit_check_project` | Consistency check |
| `gerrit_get_project_access` | List access rights |
| `gerrit_set_project_access` | Update access rights |
| `gerrit_create_access_change` | Create access change for review |
| `gerrit_check_project_access` | Check user access |
| `gerrit_list_branches` | List branches |
| `gerrit_get_branch` | Get branch info |
| `gerrit_create_branch` | Create branch |
| `gerrit_delete_branch` | Delete branch |
| `gerrit_delete_branches` | Delete multiple branches |
| `gerrit_get_branch_file_content` | Get file from branch |
| `gerrit_get_branch_reflog` | Get branch reflog |
| `gerrit_check_branch_mergeable` | Check mergeability |
| `gerrit_list_tags` | List tags |
| `gerrit_get_tag` | Get tag info |
| `gerrit_create_tag` | Create tag |
| `gerrit_delete_tag` | Delete tag |
| `gerrit_delete_tags` | Delete multiple tags |
| `gerrit_get_commit` | Get commit info |
| `gerrit_get_commit_included_in` | Get refs containing commit |
| `gerrit_list_commit_files` | List commit files |
| `gerrit_get_commit_file_content` | Get file at commit |
| `gerrit_cherry_pick_commit` | Cherry-pick commit |
| `gerrit_list_child_projects` | List child projects |
| `gerrit_list_dashboards` | List dashboards |
| `gerrit_get_dashboard` | Get dashboard |
| `gerrit_create_dashboard` | Create/update dashboard |
| `gerrit_delete_dashboard` | Delete dashboard |
| `gerrit_list_project_labels` | List label definitions |
| `gerrit_get_project_label` | Get label definition |
| `gerrit_create_project_label` | Create label |
| `gerrit_delete_project_label` | Delete label |
| `gerrit_list_submit_requirements` | List submit requirements |
| `gerrit_get_submit_requirement` | Get submit requirement |
| `gerrit_create_submit_requirement` | Create submit requirement |
| `gerrit_delete_submit_requirement` | Delete submit requirement |
| `gerrit_search_documentation` | Search Gerrit docs |

## Architecture

```
src/
├── index.ts              # MCP server entry point (low-level Server API)
├── gerrit-client.ts      # HTTP client with auth & XSSI handling
├── tool-registry.ts      # ToolDefinition interface
└── tools/
    ├── access.ts          # Access rights endpoints
    ├── accounts.ts        # Account management endpoints
    ├── changes.ts         # Change/review/revision endpoints
    ├── config.ts          # Server configuration endpoints
    ├── groups.ts          # Group management endpoints
    ├── plugins.ts         # Plugin management endpoints
    └── projects.ts        # Project/branch/tag/label endpoints
```

### Key Design Decisions

- **Low-level MCP Server API**: Uses `Server` class directly instead of `McpServer` to support raw JSON Schema definitions without Zod conversion overhead
- **XSSI prefix stripping**: Automatically removes Gerrit's `)]}'` response prefix
- **Authenticated access**: Prepends `/a/` path prefix when credentials are provided
- **URL encoding**: Properly encodes project names, branches, and other identifiers containing special characters (e.g. `/`)

## Usage Examples

Once connected to an MCP client, you can interact with Gerrit naturally:

- *"Show me all open changes in the myproject repository"*
- *"Add a Code-Review +2 to change 12345"*
- *"List all branches in the platform/build project"*
- *"Create a new project called test-repo with an empty initial commit"*
- *"Who are the members of the core-reviewers group?"*
- *"What's the diff for the current patch set of change 67890?"*

## License

MIT
