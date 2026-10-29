# PhotoSorter — AI Photo Organization & Management Platform (Netlify + NeonDB)

**PhotoSorter** is a responsive, light-themed intelligent photo management web application built for **Netlify** and **Neon Serverless Postgres (`@neondatabase/serverless`)** with `pgvector` semantic indexing.

## Key Capabilities

1. **AI Auto-Sorter & Neural Pipeline**: Automatically classifies unsorted batches by scene semantics (Nature & Alps, People & Portraits, Travel & Architecture, Pets & Wildlife, Culinary, Burst Duplicates, and Low-Sharpness Blur) with CLIP confidence and aesthetic scoring.
2. **Perceptual Hash (`pHash`) Duplicate & Blur Cleaner**: Side-by-side sharpness and exposure comparison to reclaim cloud storage and resolve burst-shot clutter in one click.
3. **AI Face Recognition & People Clusters**: Automatically groups portraits by facial embeddings with confidence telemetry and relationship tags.
4. **Interactive Geo-Location Photo Map**: Plots GPS EXIF coordinates across global regions (Swiss Alps, Kyoto, Amalfi Coast, Sydney, San Francisco, Paris) with interactive pin filtering.
5. **Smart Auto-Sorting Rules Engine**: Customizable rule builder combining EXIF metadata (camera, ISO, aperture, GPS) and AI semantic tags to route photos into Smart Albums automatically.
6. **NeonDB Serverless Postgres Console**: Built-in database connection manager, live SQL query inspector, `pgvector` index telemetry, and schema migration viewer.
7. **Custom Root Favicon (`favicon.svg`)**: Crisp vector icon displaying stacked sorted polaroids with an AI neural sparkle, located in `/favicon.svg`.

## Quick Deployment to Netlify + NeonDB

1. **Create a NeonDB Database**:
   - Sign in to [Neon Console](https://console.neon.tech) and create a project named `photosorter`.
   - Open the SQL Editor and run `db/schema.sql` to initialize the `photos`, `people_clusters`, `smart_rules`, and `sync_audit_logs` tables along with `pgvector`.
2. **Deploy to Netlify**:
   - Drag and drop this folder into Netlify Drop, or connect your Git repository to Netlify.
   - Or use the Netlify Integrations Hub to enable the official **Neon + Netlify integration**, which automatically provisions `DATABASE_URL`.
3. **Configure Environment Variables**:
   - In **Netlify Site Settings -> Environment Variables**, set `DATABASE_URL` to your Neon pooled connection string (`postgresql://...@ep-...-pooler.../photosorter?sslmode=require`).
