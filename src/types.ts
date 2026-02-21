export type Item = {
  // Item properties
  id: number;
  name: string;
  image: string;
  description: string;
  category: string;

  count: number;

  // Cost properties
  price: number;
  costMultiplier: number;
  rollCostOverride: number | null;

  // Default Probability
  baseProbability: number;
  baseUpgradeCost: number;

  userBoostPercent: number;
  upgradeCount: number;
  adjustedBaseProbability: number;
  effectiveProbability: number;

  nextUpgradeCost: number;

  // user interaction properties
  rollCount: number;
  boostAmount: number;

  // Item interaction properties
  heartCount: number;
  userHearted: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  itemId?: number;
};

export type ItemSchema = Pick<
  Item,
  'id' | 'createdAt' | 'updatedAt' | 'name' | 'description'
> & {
  itemId: number;
};

export type TraceSchema = {
  id: number;
  item_id: number;
  price: number;
  cost_multiplier: number;
  count: number;
  base_probability: number;
  base_upgrade_cost: number;
  boost_amount: number;
  roll_cost_override: number | null;
  created_at: string;
  APIupdated_at: string;
};

// Camel-cased version used by frontend after server normalizes keys
export type TraceAPIEndpoint = {
  id: number;
  itemId: number;
  price: number;
  costMultiplier: number;
  count: number;
  baseProbability: number;
  baseUpgradeCost: number;
  boostAmount: number;
  rollCostOverride: number | null;
  createdAt: string;
  APIupdatedAt: string;
};
