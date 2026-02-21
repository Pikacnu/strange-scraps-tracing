import { file, serve } from 'bun';
import index from './entry/index.html';
import db from '../utils/db';
import type { ItemSchema, TraceSchema } from '../types';

export function startServer(port: number, hostname: string) {
  return serve({
    port,
    hostname,
    routes: {
      '/': index,
      '/api/items': {
        GET: async (request, server) => {
          const item = db.prepare('SELECT * FROM items').all() as ItemSchema[];
          const query = db.query(
            'SELECT * FROM traces WHERE itemId = ? ORDER BY APIupdated_at DESC LIMIT 1',
          );
          const itemWithTraces = item.map((i) => ({
            ...i,
            ...Object.fromEntries(
              Object.entries(query.get(i.itemId) as TraceSchema).map(
                ([key, value]) => [
                  key.replace(/_(\w)/g, (_, c) => c.toUpperCase()),
                  value,
                ],
              ),
            ),
          }));

          return new Response(JSON.stringify({ items: itemWithTraces }), {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        },
      },
      '/api/traces': {
        GET: async (request, server) => {
          const searchParams = new URL(request.url).searchParams;
          const itemId = searchParams.get('itemId');
          if (!itemId) {
            return new Response(
              JSON.stringify({ error: 'Missing itemId parameter' }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );
          }
          const tracesRaw = db
            .prepare(
              'SELECT * FROM traces WHERE itemId = ? ORDER BY APIupdated_at DESC',
            )
            .all(itemId) as TraceSchema[];

          // Convert snake_case DB columns to camelCase to match the items payload
          const traces = tracesRaw.map((t) =>
            Object.fromEntries(
              Object.entries(t).map(([key, value]) => [
                key.replace(/_(\w)/g, (_, c) => c.toUpperCase()),
                value,
              ]),
            ),
          );

          return new Response(JSON.stringify({ traces }), {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        },
      },
    },
    fetch(request, server) {
      return new Response('Not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    },
    development: {
      hmr: true,
      chromeDevToolsAutomaticWorkspaceFolders: true,
    },
  });
}
