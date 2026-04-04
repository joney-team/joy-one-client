import { restServerClient } from "@/modules/apis/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const post = await restServerClient.get(`/posts/public/${id}`);

  return new Response(JSON.stringify(post), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
