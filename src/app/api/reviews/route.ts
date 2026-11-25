import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const osmKeyPattern = /^(node|way|relation)\/\d+$/;

// Return ratings for max 100 valid OSM keys
export async function GET(request: Request) {
  const requestedIds =
    new URL(request.url).searchParams.get("ids")?.split(",") ?? [];
  const ids = [
    ...new Set(requestedIds.filter((id) => osmKeyPattern.test(id))),
  ].slice(0, 100);
  if (ids.length === 0) return Response.json([]);

  const records = ids.map((id) => {
    const [osm_type, osm_id] = id.split("/");
    return { osm_type, osm_id };
  });
  const places = await sql`
    SELECT osm_type, osm_id, rating, amount
    FROM places
    WHERE (osm_type, osm_id) IN (
      SELECT osm_type, osm_id
      FROM jsonb_to_recordset(${JSON.stringify(records)}::jsonb)
        AS requested(osm_type text, osm_id bigint)
    )
  `;

  return Response.json(
    places.map((place) => ({
      id: `${place.osm_type}/${place.osm_id}`,
      rating: place.rating,
      amount: place.amount,
    })),
  );
}

// Save a review by updating the review average in the database
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid review data." }, { status: 400 });
  }

  const { id, name, lat, lon, stars } = body as Record<string, unknown>;
  const match =
    typeof id === "string" ? id.match(/^(node|way|relation)\/(\d+)$/) : null;
  if (
    typeof id !== "string" ||
    !match ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    Array.from(name).length > 200 ||
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    typeof lon !== "number" ||
    !Number.isFinite(lon) ||
    lon < -180 ||
    lon > 180 ||
    typeof stars !== "number" ||
    !Number.isInteger(stars) ||
    stars < 0 ||
    stars > 5
  ) {
    return Response.json({ error: "Invalid review data." }, { status: 400 });
  }

  const [, osm_type, osm_id] = match;
  const [place] = await sql`
    INSERT INTO places (osm_type, osm_id, name, lat, lon, amount, rating)
    VALUES (${osm_type}, ${osm_id}, ${name}, ${lat}, ${lon}, 1, ${stars})
    ON CONFLICT (osm_type, osm_id) DO UPDATE SET
      rating = (places.rating * places.amount + ${stars}) / (places.amount + 1),
      amount = places.amount + 1,
      updated = now()
    RETURNING osm_type, osm_id, rating, amount
  `;

  return Response.json({
    id,
    rating: place.rating,
    amount: place.amount,
  });
}
