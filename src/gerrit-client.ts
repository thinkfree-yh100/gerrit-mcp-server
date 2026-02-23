/**
 * Gerrit REST API HTTP Client
 * Handles authentication, XSSI prefix stripping, and all HTTP methods.
 */

export interface GerritClientConfig {
  baseUrl: string;
  username?: string;
  password?: string;
}

export class GerritClient {
  private baseUrl: string;
  private authHeader?: string;

  constructor(config: GerritClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    if (config.username && config.password) {
      const credentials = Buffer.from(
        `${config.username}:${config.password}`
      ).toString("base64");
      this.authHeader = `Basic ${credentials}`;
    }
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | string[] | number | boolean | undefined>
  ): string {
    // Use /a/ prefix for authenticated access
    const prefix = this.authHeader ? "/a" : "";
    const url = new URL(`${this.baseUrl}${prefix}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, v);
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private getHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (this.authHeader) {
      headers["Authorization"] = this.authHeader;
    }
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }

  /**
   * Strip Gerrit's XSSI prevention prefix )]}'
   */
  private stripXssiPrefix(text: string): string {
    const trimmed = text.trimStart();
    if (trimmed.startsWith(")]}'")) {
      return trimmed.slice(4).trimStart();
    }
    return trimmed;
  }

  async request(
    method: string,
    path: string,
    options?: {
      query?: Record<
        string,
        string | string[] | number | boolean | undefined
      >;
      body?: unknown;
      contentType?: string;
      rawResponse?: boolean;
    }
  ): Promise<unknown> {
    const url = this.buildUrl(path, options?.query);
    const headers = this.getHeaders(
      options?.contentType ?? (options?.body ? "application/json" : undefined)
    );

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options?.body) {
      fetchOptions.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gerrit API error ${response.status} ${response.statusText}: ${errorText}`
      );
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    if (options?.rawResponse) {
      return text;
    }

    try {
      const cleaned = this.stripXssiPrefix(text);
      return JSON.parse(cleaned);
    } catch {
      return text;
    }
  }

  async get(
    path: string,
    query?: Record<string, string | string[] | number | boolean | undefined>
  ): Promise<unknown> {
    return this.request("GET", path, { query });
  }

  async post(
    path: string,
    body?: unknown,
    query?: Record<string, string | string[] | number | boolean | undefined>
  ): Promise<unknown> {
    return this.request("POST", path, { body, query });
  }

  async put(
    path: string,
    body?: unknown,
    query?: Record<string, string | string[] | number | boolean | undefined>
  ): Promise<unknown> {
    return this.request("PUT", path, { body, query });
  }

  async delete(
    path: string,
    body?: unknown,
    query?: Record<string, string | string[] | number | boolean | undefined>
  ): Promise<unknown> {
    return this.request("DELETE", path, { body, query });
  }
}

/** URL-encode a Gerrit identifier (project name, branch, etc.) */
export function encodeGerritId(id: string): string {
  return encodeURIComponent(id);
}
