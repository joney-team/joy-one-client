import { apiServerSide } from "@/modules/apis/server";
import { PostEntity } from "@/modules/posts/posts-types";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const post = await apiServerSide.get<PostEntity>(`/posts/public/${id}`);

  return new Response(JSON.stringify(post), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
