import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { fetch } from 'undici';
import { z } from 'zod';

// Basic config
const server = new McpServer({ name: 'wavefleet-mcp', version: '0.1.1' });

const URL_BASE = process.env.WAVEFLEET_URL ?? '';
const TOKEN = process.env.WAVEFLEET_TOKEN ?? '';

// 1) Tool: Get customer subscription info by user_id
server.registerTool(
  'getCustomerSubscriptionInfo',
  {
    title: 'Get customer subscription info by user_id',
    description: 'Looks up a single customer subscription details by user_id.',
    inputSchema: {
      user_id: z.string().min(2).max(100),
    },
  },
  async ({ user_id }) => {
    const res = await fetch(
      `${URL_BASE}/api/v2/subscriptions?user_id=${user_id}`,
      {
        headers: { token: TOKEN },
      }
    );
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const data = await res.json();
    const subscriptionInfo = Array.isArray(data) ? data[0] : data;
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(subscriptionInfo ?? null, null, 2),
        },
      ],
    };
  }
);

server.registerTool(
  'listUsers',
  {
    title: 'List wavefleet users',
    description:
      'Lists of wavefleet users. Returns {userId, firstName, lastName, username, email} for each user.',
    inputSchema: {},
  },
  async () => {
    const res = await fetch(`${URL_BASE}/view/users`, {
      headers: { token: TOKEN, accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const parsedResponse: any = await res.json();
    // Return a summarized view of users
    const users = Array.isArray(parsedResponse.users)
      ? parsedResponse.users
      : [];

    const conciseUsers = users.map((user: any) => ({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    }));

    const csvHeaders = 'userId,firstName,lastName,username,email';
    const csvRows = conciseUsers.map(
      (user: any) =>
        `${user.userId},${user.firstName},${user.lastName},${user.username},${user.email}`
    );
    const usersCsv = [csvHeaders, ...csvRows].join('\n');

    return {
      content: [{ type: 'text', text: usersCsv }],
    };
  }
);

server.registerTool(
  'getUserByUsername',
  {
    title: 'Get wavefleet user by username',
    description:
      'Fetches a wavefleet user by their username. Returns {userId,firstName,lastName,username,email,role,company,stripeCustomerId,billableAccountId,subscriptionSystem, userDevices} ',
    inputSchema: {
      username: z.string().min(2).max(100),
    },
  },
  async ({ username }) => {
    const res = await fetch(`${URL_BASE}/view/users`, {
      headers: { token: TOKEN, accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const parsedResponse: any = await res.json();
    // Return a summarized view of users
    const users = Array.isArray(parsedResponse.users)
      ? parsedResponse.users
      : [];

    const user = users.find((user: any) => user.username === username);
    const userDevices = user.devices.map((device: any) => ({
      deviceId: device.id,
      deviceName: device.name,
      spotterId: device.spotterId,
    }));

    const csvHeaders =
      'userId,firstName,lastName,username,email,role,company,stripeCustomerId,billableAccountId,subscriptionSystem,userDevices';
    const csvRows = user
      ? [
          `${user.id},${user.firstName},${user.lastName},${user.username},${
            user.email
          },${user.role},${user.company},${user.stripe_customer_id},${
            user.billable_account_id
          },${user.subscription_system},${JSON.stringify(userDevices)}`,
        ]
      : [];

    const usersCsv = [csvHeaders, ...csvRows].join('\n');

    return {
      content: [{ type: 'text', text: usersCsv }],
    };
  }
);

server.registerTool(
  'getUserByUserId',
  {
    title: 'Get wavefleet user by UserId',
    description:
      'Fetches a wavefleet user by their UserId. Returns {userId,firstName,lastName,username,email,role,company,stripeCustomerId,billableAccountId,subscriptionSystem, userDevices} ',
    inputSchema: {
      userId: z.number(),
    },
  },
  async ({ userId }) => {
    const res = await fetch(`${URL_BASE}/view/users`, {
      headers: { token: TOKEN, accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const parsedResponse: any = await res.json();
    // Return a summarized view of users
    const users = Array.isArray(parsedResponse.users)
      ? parsedResponse.users
      : [];

    const user = users.find((user: any) => user.id === userId);
    const userDevices = user?.devices.map((device: any) => ({
      deviceId: device.id,
      deviceName: device.name,
      spotterId: device.spotterId,
    }));

    const csvHeaders =
      'userId,firstName,lastName,username,email,role,company,stripeCustomerId,billableAccountId,subscriptionSystem,userDevices';
    const csvRows = user
      ? [
          `${user.id},${user.firstName},${user.lastName},${user.username},${
            user.email
          },${user.role},${user.company},${user.stripe_customer_id},${
            user.billable_account_id
          },${user.subscription_system},${JSON.stringify(userDevices)}`,
        ]
      : [];

    const usersCsv = [csvHeaders, ...csvRows].join('\n');

    return {
      content: [{ type: 'text', text: usersCsv }],
    };
  }
);

server.registerTool(
  'getDeviceBySpotterId',
  {
    title: 'Get wavefleet device details by spotterId',
    description:
      'Fetches a wavefleet device by their spotterId. Returns {deviceId,deviceName,spotterId} ',
    inputSchema: {
      spotterId: z.string().min(2).max(100),
    },
  },
  async ({ spotterId }) => {
    const res = await fetch(`${URL_BASE}/admin/spotter/${spotterId}`, {
      headers: { token: TOKEN, accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const parsedResponse: any = await res.json();
    // Return a summarized view of users
    const device = parsedResponse.data?.spotter;

    const csvHeaders = 'deviceId,deviceName,spotterId,userId';
    const csvRows = device
      ? [`${device.id},${device.name},${spotterId},${device.user_id}`]
      : [];

    const usersCsv = [csvHeaders, ...csvRows].join('\n');

    return {
      content: [{ type: 'text', text: usersCsv }],
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
