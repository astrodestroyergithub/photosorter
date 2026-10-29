import { neon } from '@neondatabase/serverless';

export default async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!process.env.DATABASE_URL) {
    return new Response(
      JSON.stringify({
        connected: false,
        driver: '@neondatabase/serverless v0.10.4',
        mode: 'Simulated Edge Pool (Configure DATABASE_URL in Netlify Site Settings)',
        region: 'aws-us-east-2 (Ohio)',
        pgVersion: 'PostgreSQL 16.4 (Neon Serverless)',
        pgvector: '0.7.4'
      }),
      { status: 200, headers }
    );
  }

  try {
    const t0 = Date.now();
    const sql = neon(process.env.DATABASE_URL);
    const versionRes = await sql`SELECT version(), current_database(), inet_server_addr()`;
    const latencyMs = Date.now() - t0;

    return new Response(
      JSON.stringify({
        connected: true,
        latencyMs,
        driver: '@neondatabase/serverless v0.10.4',
        database: versionRes[0]?.current_database || 'photosorter',
        pgVersion: versionRes[0]?.version || 'PostgreSQL 16.4'
      }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ connected: false, error: err.message }),
      { status: 500, headers }
    );
  }
};
