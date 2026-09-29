import { api } from "@/lib/api";
import { authHeaders } from "@/lib/session";

// The browser never holds the API token (httpOnly cookie), so the chat page polls through this route.
export async function GET(req: Request, ctx: RouteContext<"/chats/[id]/poll">) {
  const { id } = await ctx.params;
  const after = new URL(req.url).searchParams.get("after") ?? undefined;
  const { data, error, response } = await api.GET(
    "/conversations/{id}/messages",
    {
      params: { path: { id }, query: { after } },
      headers: await authHeaders(),
    },
  );
  return Response.json(data ?? error, {
    status: data ? 200 : response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
