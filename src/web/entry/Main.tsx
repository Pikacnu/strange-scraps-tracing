import { useEffect, useState, useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Coins,
  Package,
  Percent,
  TrendingUp,
  ArrowUpCircle,
} from 'lucide-react';
import type { Item, TraceAPIEndpoint } from '../../types';
import { getEffectiveRollCost } from '../../utils';

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [traces, setTraces] = useState<TraceAPIEndpoint[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data.items);
      if (data.items.length > 0) {
        setSelectedItemId(data.items[0].id);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedItemId === null) return;
    const fetchTraces = async () => {
      const res = await fetch(
        `/api/traces?itemId=${items.find((item) => item.id === selectedItemId)?.itemId!}`,
      );
      const data = await res.json();
      // server returns camelCase fields for traces now
      const sortedTraces = data.traces.sort(
        (a: TraceAPIEndpoint, b: TraceAPIEndpoint) =>
          new Date(a.APIupdatedAt).getTime() -
          new Date(b.APIupdatedAt).getTime(),
      );
      setTraces(sortedTraces);
    };
    fetchTraces();
  }, [selectedItemId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId),
    [items, selectedItemId],
  );

  const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 font-sans'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <header className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800'>
          <div>
            <h1 className='text-3xl font-extrabold tracking-tight flex items-center gap-3'>
              <TrendingUp className='w-8 h-8 text-indigo-500' />
              Scraps Tracker
            </h1>
            <p className='text-slate-500 dark:text-slate-400 mt-1'>
              Monitor item prices, counts, and probabilities over time.
            </p>
          </div>

          <div className='min-w-[250px]'>
            <label
              htmlFor='item-select'
              className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'
            >
              Select Item
            </label>
            <select
              id='item-select'
              className='w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 rounded-xl p-3 text-slate-900 dark:text-slate-100 transition-all'
              value={selectedItemId || ''}
              onChange={(e) => {
                console.log('Selected item ID:', e.target.value);
                setSelectedItemId(Number(e.target.value));
              }}
            >
              <optgroup label='Has Stack (In Inventory)'>
                {items
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name} ({item.count})
                    </option>
                  ))}
              </optgroup>
              <optgroup label='No Stack (Empty)'>
                {items
                  .filter(
                    (item) => item.count === 0 || item.count === undefined,
                  )
                  .map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </header>

        {selectedItem && (
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            {/* Left Column: Basic Info */}
            <div className='lg:col-span-1 space-y-6'>
              <div className='bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800'>
                <h2 className='text-xl font-bold mb-2'>{selectedItem.name}</h2>
                <p className='text-sm text-slate-500 dark:text-slate-400 mb-4'>
                  {selectedItem.description}
                </p>
                <div className='inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold'>
                  {selectedItem.category || 'Uncategorized'}
                </div>
              </div>

              <div className='grid grid-cols-2 lg:grid-cols-1 gap-4'>
                <StatCard
                  icon={<Coins className='w-5 h-5 text-amber-500' />}
                  label='Roll Cost'
                  value={
                    getEffectiveRollCost(selectedItem).toLocaleString() || '-'
                  }
                />
                <StatCard
                  icon={<Package className='w-5 h-5 text-blue-500' />}
                  label='Inventory Count'
                  value={selectedItem.count?.toLocaleString() || 0}
                />
                <StatCard
                  icon={<Percent className='w-5 h-5 text-emerald-500' />}
                  label='Effective Prob.'
                  value={formatPercent(selectedItem.effectiveProbability / 100)}
                />
                <StatCard
                  icon={<ArrowUpCircle className='w-5 h-5 text-purple-500' />}
                  label='Next Upgrade Cost'
                  value={selectedItem.nextUpgradeCost?.toLocaleString() || '-'}
                />
              </div>
            </div>

            {/* Right Column: Charts */}
            <div className='lg:col-span-3 space-y-6'>
              {traces.length > 0 ? (
                <>
                  {/* Roll Cost & Count Chart */}
                  <div className='bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800'>
                    <h3 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                      <TrendingUp className='w-5 h-5 text-indigo-500' />
                      Roll Cost & Count History
                    </h3>
                    <div className='h-[350px] w-full'>
                      <ResponsiveContainer
                        width='100%'
                        height='100%'
                      >
                        <LineChart
                          data={traces}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray='3 3'
                            stroke='#334155'
                            opacity={0.2}
                          />
                          <XAxis
                            dataKey='APIupdatedAt'
                            tickFormatter={(tick) =>
                              new Date(tick).toLocaleDateString()
                            }
                            stroke='#64748b'
                            fontSize={12}
                            tickMargin={10}
                          />
                          <YAxis
                            yAxisId='left'
                            stroke='#8b5cf6'
                            fontSize={12}
                            tickFormatter={(val) => val.toLocaleString()}
                          />
                          <YAxis
                            yAxisId='right'
                            orientation='right'
                            stroke='#3b82f6'
                            fontSize={12}
                            tickFormatter={(val) => val.toLocaleString()}
                          />
                          <Tooltip
                            labelFormatter={(label) =>
                              formatDate(label as string)
                            }
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: 'none',
                              borderRadius: '12px',
                              color: '#f8fafc',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            itemStyle={{ fontSize: '14px' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Line
                            yAxisId='left'
                            type='monotone'
                            dataKey={(trace: TraceAPIEndpoint) =>
                              trace.rollCostOverride ??
                              getEffectiveRollCost({
                                ...trace,
                                rollCount: 0,
                                baseProbability: trace.baseProbability,
                              } as unknown as Item)
                            }
                            stroke='#8b5cf6'
                            strokeWidth={3}
                            name='Roll Cost'
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                          <Line
                            yAxisId='right'
                            type='monotone'
                            dataKey='count'
                            stroke='#3b82f6'
                            strokeWidth={3}
                            name='Count'
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Probability Chart */}
                  <div className='bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800'>
                    <h3 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                      <Percent className='w-5 h-5 text-emerald-500' />
                      Base Probability History
                    </h3>
                    <div className='h-[250px] w-full'>
                      <ResponsiveContainer
                        width='100%'
                        height='100%'
                      >
                        <AreaChart
                          data={traces}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id='colorProb'
                              x1='0'
                              y1='0'
                              x2='0'
                              y2='1'
                            >
                              <stop
                                offset='5%'
                                stopColor='#10b981'
                                stopOpacity={0.3}
                              />
                              <stop
                                offset='95%'
                                stopColor='#10b981'
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray='3 3'
                            stroke='#334155'
                            opacity={0.2}
                          />
                          <XAxis
                            dataKey='APIupdatedAt'
                            tickFormatter={(tick) =>
                              new Date(tick).toLocaleDateString()
                            }
                            stroke='#64748b'
                            fontSize={12}
                            tickMargin={10}
                          />
                          <YAxis
                            stroke='#10b981'
                            fontSize={12}
                            tickFormatter={(val) => `${val}%`}
                          />
                          <Tooltip
                            labelFormatter={(label) =>
                              formatDate(label as string)
                            }
                            // traces provide baseProbability as a percent number (e.g. 5 means 5%).
                            // Show it as a human-friendly percent without re-multiplying.
                            formatter={(value: number | undefined) => [
                              `${value ?? 0}%`,
                              'Base Probability',
                            ]}
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: 'none',
                              borderRadius: '12px',
                              color: '#f8fafc',
                            }}
                          />
                          <Area
                            type='stepAfter'
                            dataKey='baseProbability'
                            stroke='#10b981'
                            strokeWidth={3}
                            fillOpacity={1}
                            fill='url(#colorProb)'
                            name='Base Probability'
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className='flex items-center justify-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800'>
                  <div className='animate-pulse flex flex-col items-center gap-3'>
                    <div className='w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin'></div>
                    <p className='text-slate-500'>Loading trace data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className='bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4'>
      <div className='p-3 bg-slate-50 dark:bg-slate-800 rounded-xl'>{icon}</div>
      <div>
        <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
          {label}
        </p>
        <p className='text-xl font-bold text-slate-900 dark:text-slate-100'>
          {value}
        </p>
      </div>
    </div>
  );
}

export default App;
