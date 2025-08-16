import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { fetch } from 'undici';
import { z } from 'zod';

// Basic config
const server = new McpServer({ name: 'myapi-mcp', version: '0.1.1' });

const BASE = 'https://dummyjson.com';
const KEY = process.env.MYAPI_KEY ?? '';

// 1) Tool: find customer by first name
server.registerTool(
  'findCustomerByFirstName',
  {
    title: 'Find customer by first name',
    description: 'Looks up a single customer record by first name.',
    inputSchema: { firstName: z.string().min(2).max(100) },
  },
  async ({ firstName }) => {
    const res = await fetch(
      `${BASE}/users/filter?key=firstName&value=${firstName}`,
      {
        headers: { Authorization: `Bearer ${KEY}` },
      }
    );
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const data = (await res.json()) as { users: any[] };
    const customer = Array.isArray(data.users) ? data.users[0] : data.users;
    return {
      content: [
        { type: 'text', text: JSON.stringify(customer ?? null, null, 2) },
      ],
    };
  }
);

// 2) Tool: list users
server.registerTool(
  'listUsers',
  {
    title: 'List users',
    description: 'Lists of users',
    inputSchema: {},
  },
  async () => {
    const res = await fetch(`${BASE}/users`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const data: any = await res.json();
    // Return a summarized view of users
    const users = Array.isArray(data.users) ? data.users : [];

    return {
      content: [{ type: 'text', text: JSON.stringify(users, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
