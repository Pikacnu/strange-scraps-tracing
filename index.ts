import type { Item, TraceSchema } from './src/types';
import { getEffectiveRollCost } from './src/utils';
import {
  getCurrentItem,
  printResultAsTable,
  updateItemAndTrace,
} from './src/utils/utils';
import { startServer } from './src/web';

const disordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const sessionCookie = process.env.SESSION_COOKIE;
// domain : api.scraps.hackclub.com , path: / , secure, httpOnly
const cookieString = sessionCookie
  ? `session=${sessionCookie}; Domain=api.scraps.hackclub.com; Path=/; Secure; HttpOnly`
  : '';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function sendDiscordNotification(items: Item[]) {
  const SplitedItems = items.reduce((acc: Item[][], item) => {
    if (acc.length === 0) {
      acc.push([item]);
    } else {
      const lastGroup = acc[acc.length - 1];
      if (lastGroup!.length < 20) {
        lastGroup!.push(item);
      } else {
        acc.push([item]);
      }
    }
    return acc;
  }, []);
  const contents = SplitedItems.map((groups) => [
    {
      type: 17,
      accent_color: 16711680,
      spoiler: false,
      components: [
        {
          type: 10,
          content: 'Scraps Content Update',
        },
      ],
    },
    {
      type: 17,
      accent_color: 16711680,
      spoiler: false,
      components: groups
        .map((item) => [
          {
            type: 10,
            content:
              `**${item.name}**\n` +
              `Effective Roll Cost: ${getEffectiveRollCost(item)}\n` +
              `Base Probability: ${item.baseProbability}%\n` +
              `User Boost: ${item.userBoostPercent}%\n` +
              `Effective Probability: ${item.effectiveProbability}%\n` +
              `Next Upgrade Cost: ${item.nextUpgradeCost}\n` +
              `Count: ${item.count}\n`,
          },
        ])
        .flat(),
    },
  ]);
  for (const content of contents) {
    try {
      const res = await fetch(`${disordWebhookUrl}?with_components=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components: content,
          flags: Math.pow(2, 15),
        }), // Suppress mentions
      });
      if (!res.ok) {
        console.error('Failed to send Discord notification:', res.statusText);
        const errorData = await res.json();
        console.error('Discord API error response:', errorData);
      }
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }
}

async function intervalCheck(printAllItems = false, filteredSoldOut = false) {
  try {
    const items = await getCurrentItem(cookieString);
    const updateItems = updateItemAndTrace(items);
    console.clear();
    console.log(`Updated ${updateItems.length} items.`);
    console.log(JSON.stringify(updateItems, null, 2));
    if (printAllItems) {
      printResultAsTable(
        filteredSoldOut ? items.filter((item) => item.count > 0) : items,
        (a, b) => getEffectiveRollCost(a) - getEffectiveRollCost(b),
      );
    } else if (updateItems.length > 0) {
      printResultAsTable(
        filteredSoldOut
          ? updateItems.filter((item) => item.count > 0)
          : updateItems,
        (a, b) => getEffectiveRollCost(a) - getEffectiveRollCost(b),
      );
    }
    if (updateItems.length > 0 && disordWebhookUrl) {
      await sendDiscordNotification(updateItems);
    }
  } catch (error) {
    console.error('Error fetching items or updating traces:', error);
  }
}

if (!disordWebhookUrl) {
  console.error(
    'DISCORD_WEBHOOK_URL environment variable is not set. Discord notifications will be disabled.',
  );
}

setInterval(() => intervalCheck(false, true), 5 * 60 * 1000); // Check every 5 minutes
intervalCheck(true, true).then(() => {
  console.log(`Server started at http://${hostname}:${port}`);
}); // Initial check on startup
startServer(port, hostname);
