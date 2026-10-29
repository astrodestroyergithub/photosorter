import { neon } from '@neondatabase/serverless';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Neon-Pool',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
};

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return new Response(
      JSON.stringify({
        ok: false,
        mode: 'local-fallback',
        message: 'DATABASE_URL environment variable not set. Running in hybrid client-state mode.'
      }),
      { status: 200, headers }
    );
  }

  try {
    const start = Date.now();
    const sql = neon(dbUrl);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('q');

      let rows;
      if (category && category !== 'all') {
        rows = await sql`
          SELECT * FROM photos
          WHERE is_archived = FALSE AND LOWER(category) = LOWER(${category})
          ORDER BY captured_at DESC
          LIMIT 200
        `;
      } else if (search) {
        const pattern = '%' + search + '%';
        rows = await sql`
          SELECT * FROM photos
          WHERE is_archived = FALSE
            AND (title ILIKE ${pattern} OR location_name ILIKE ${pattern} OR ai_caption ILIKE ${pattern})
          ORDER BY aesthetic_score DESC, captured_at DESC
          LIMIT 200
        `;
      } else {
        rows = await sql`
          SELECT * FROM photos
          WHERE is_archived = FALSE
          ORDER BY captured_at DESC
          LIMIT 200
        `;
      }

      return new Response(
        JSON.stringify({
          ok: true,
          latencyMs: Date.now() - start,
          count: rows.length,
          photos: rows
        }),
        { status: 200, headers }
      );
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const {
        filename, title, storage_url, category, location_name,
        camera_model, ai_tags, ai_caption, ai_confidence, aesthetic_score, sharpness_score, phash
      } = body;

      const inserted = await sql`
        INSERT INTO photos (
          filename, title, storage_url, category, location_name,
          camera_model, ai_tags, ai_caption, ai_confidence, aesthetic_score, sharpness_score, phash
        ) VALUES (
          ${filename}, ${title}, ${storage_url}, ${category || 'Nature'},
          ${location_name || 'Unknown Location'}, ${camera_model || 'Sony A7R V'},
          ${ai_tags || ['ai-sorted', 'hd']}, ${ai_caption || title},
          ${ai_confidence || 98.4}, ${aesthetic_score || 9.3}, ${sharpness_score || 95.0},
          ${phash || 'a9f4c28e11b0934e'}
        )
        RETURNING *
      `;

      return new Response(
        JSON.stringify({ ok: true, latencyMs: Date.now() - start, photo: inserted[0] }),
        { status: 201, headers }
      );
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      const { id, is_favorite, category, title, is_archived } = body;

      const updated = await sql`
        UPDATE photos
        SET
          is_favorite = COALESCE(${is_favorite}, is_favorite),
          category = COALESCE(${category}, category),
          title = COALESCE(${title}, title),
          is_archived = COALESCE(${is_archived}, is_archived),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      return new Response(
        JSON.stringify({ ok: true, latencyMs: Date.now() - start, photo: updated[0] }),
        { status: 200, headers }
      );
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      await sql`DELETE FROM photos WHERE id = ${id}`;
      return new Response(
        JSON.stringify({ ok: true, deletedId: id, latencyMs: Date.now() - start }),
        { status: 200, headers }
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers }
    );
  }
};
