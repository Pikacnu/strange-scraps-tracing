import { type Item, type TraceSchema } from '../types';
import db from './db';

// Code is copied from the website javascript
`
function ge(o) {
        let u;
        return o.rollCostOverride != null && o.rollCostOverride > 0 ? u = o.rollCostOverride : u = Math.max(1, Math.round(o.price * (o.baseProbability / 100))),
        Math.round(u * (1 + .05 * (o.rollCount || 0)))
    }
`;

export function getEffectiveRollCost(item: Item): number {
  const { rollCostOverride, price, baseProbability, rollCount } = item;

  const baseCost =
    rollCostOverride != null && rollCostOverride > 0
      ? rollCostOverride
      : Math.max(1, Math.round(price * (baseProbability / 100)));

  const multiplier = 1 + 0.05 * (rollCount || 0);
  return Math.round(baseCost * multiplier);
}

export const calculateProbPenalty = (
  base: number,
  adjusted: number,
): number => {
  return Math.max(0, base - adjusted);
};

export const formatProbabilityLabel = (item: {
  baseProbability: number;
  userBoostPercent: number;
}): string => {
  return `(${item.baseProbability}% + ${item.userBoostPercent}%`;
};

export const scrapsToHours = (scraps: number): number => {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const FACTOR = 10;
  return Math.round((scraps / (PHI * FACTOR)) * 10) / 10;
};

// const API_BASE = 'https://api.scraps.hackclub.com/shop/items';

// export async function upgradeItem(itemId: number) {
//   const response = await fetch(`${API_BASE}/${itemId}/upgrade-probability`, {
//     method: 'POST',
//     credentials: 'include',
//   });
//   const data = await response.json();
//   if (data.error) throw new Error(data.error);

//   return {
//     userBoostPercent: data.boostPercent,
//     effectiveProbability: data.effectiveProbability,
//     nextUpgradeCost: data.nextCost,
//   };
// }

// export async function undoAllUpgrades(itemId: number) {
//   const response = await fetch(`${API_BASE}/${itemId}/refinery/undo-all`, {
//     method: 'POST',
//     credentials: 'include',
//   });
//   const data = await response.json();
//   if (data.error) throw new Error(data.error);

//   return {
//     userBoostPercent: data.boostPercent,
//     upgradeCount: data.upgradeCount,
//     effectiveProbability: data.effectiveProbability,
//     nextUpgradeCost: data.nextCost,
//     refundedCost: data.refundedCost,
//     undoneCount: data.undoneCount,
//   };
// }

// export async function tryLuck(itemId: number) {
//   const res = await fetch(`${API_BASE}/shop/items/${itemId}/try-luck`, {
//     method: 'POST',
//     credentials: 'include',
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.error || 'Failed to try luck');
//   return data; // 回傳 won: boolean, orderId, effectiveProbability 等
// }
