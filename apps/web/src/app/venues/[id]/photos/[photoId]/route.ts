// Venue photos are public; the browser loads them here because only the web server talks to the API.
export async function GET(
  _: Request,
  ctx: RouteContext<"/venues/[id]/photos/[photoId]">,
) {
  const { id, photoId } = await ctx.params;
  const uuid = /^[0-9a-f-]{36}$/;
  if (!uuid.test(id) || !uuid.test(photoId))
    return new Response("Not found.", { status: 404 });
  const res = await fetch(
    `${process.env.API_URL ?? "http://localhost:3000"}/venues/${id}/photos/${photoId}`,
  );
  return new Response(res.ok ? res.body : "Not found.", {
    status: res.status,
    headers: res.ok
      ? {
          "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
          "Cache-Control": res.headers.get("cache-control") ?? "no-store",
        }
      : { "Cache-Control": "no-store" },
  });
}
