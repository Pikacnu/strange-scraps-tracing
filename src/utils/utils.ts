import { getEffectiveRollCost } from '.';
import type { Item, TraceSchema } from '../types';
import db from './db';

export async function getCurrentItem(cookies?: string): Promise<Item[]> {
  const res = await fetch('https://api.scraps.hackclub.com/shop/items', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(cookies ? { Cookie: cookies } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch items: ${res.statusText}`);
  }
  const data = (await res.json()) as Item[];
  return data;
}

export function updateItemAndTrace(
  items: Item[],
  alwaysSaveTrace = false,
): Item[] {
  const insertItemQuery = db.prepare(
    `INSERT INTO items (itemId, name, description) VALUES (?, ?, ?) ON CONFLICT(itemId) DO NOTHING`,
  );
  const insertTraceQuery = db.prepare(
    `INSERT INTO traces (
      itemId, price, cost_multiplier, count, base_probability,effective_probability, base_upgrade_cost, boost_amount, roll_cost_override, APIupdated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  return items.filter((item) => {
    insertItemQuery.run(item.id, item.name, item.description);
    const lastTraceOfItem = db
      .prepare(
        `SELECT * FROM traces WHERE itemId = ? ORDER BY created_at DESC LIMIT 1`,
      )
      .get(item.id) as TraceSchema | undefined;
    if (
      !lastTraceOfItem ||
      lastTraceOfItem.APIupdated_at !== item.updatedAt ||
      alwaysSaveTrace
    ) {
      insertTraceQuery.run(
        item.id,
        item.price,
        item.costMultiplier,
        item.count,
        item.baseProbability,
        item.effectiveProbability,
        item.baseUpgradeCost,
        item.boostAmount,
        item.rollCostOverride,
        item.updatedAt,
      );
      return true;
    }
    return true;
  });
}

export function printResultAsTable(
  items: Item[],
  sortFn: (a: Item, b: Item) => number,
) {
  console.table(
    items.toSorted(sortFn).map((item) => ({
      Name: item.name,
      'Effective Roll Cost': getEffectiveRollCost(item),
      'Base Probability': `${item.baseProbability}%`,
      'User Boost': `${item.userBoostPercent}%`,
      'Effective Probability': `${item.effectiveProbability}%`,
      'Next Upgrade Cost': item.nextUpgradeCost,
      Count: item.count,
    })),
  );
}
