import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import type { Post } from "../types";

export const Route = createFileRoute("/demo/mini-query/posts/post/$postId")({
	component: PostComponent,
});

import { useParams } from "@tanstack/react-router";

export function PostComponent() {
	const params = useParams({ strict: false });
	const id = Number(params.postId);

	const { data } = useQuery({
		queryKey: ["post", id],
		queryFn: () =>
			fetch(`https://dummyjson.com/posts/${id}`).then(
				(res) => res.json() as Promise<Post>,
			),
	});

	return (
		<div className="m-4">
			<p className="text-2xl mb-4">{data?.title}</p>
			<p className="max-w-2xl">{data?.body}</p>
		</div>
	);
}
