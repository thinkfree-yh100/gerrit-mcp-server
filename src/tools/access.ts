import { ToolDefinition } from "../tool-registry.js";
import { GerritClient } from "../gerrit-client.js";

export const tools: ToolDefinition[] = [
  {
    name: "gerrit_list_access_rights",
    description:
      "List access rights for one or more projects. Returns access rights information including inherits_from, local, and owner details.",
    inputSchema: {
      type: "object",
      properties: {
        project: {
          oneOf: [
            { type: "string" },
            { type: "array", items: { type: "string" } },
          ],
          description: "Project name(s) to query access rights for",
        },
      },
      required: ["project"],
    },
    handler: async (client: GerritClient, params: Record<string, unknown>) => {
      const project = params.project;
      const query: Record<string, string | string[]> = {};
      if (Array.isArray(project)) {
        query.project = project as string[];
      } else {
        query.project = project as string;
      }
      return client.get("/access/", query);
    },
  },
];
