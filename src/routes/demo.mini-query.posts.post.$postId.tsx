import { createFileRoute } from "@tanstack/react-router";
// @ts-ignore
import { useQuery } from "../miniQuery.jsx";

import type { Post } from "../types";

export const Route = createFileRoute("/demo/mini-query/posts/post/$postId")({
	component: PostComponent,
});

import { useParams } from "@tanstack/react-router";

export function PostComponent() {
	const params = useParams({ strict: false });
	const id = Number(params.postId);

	const { data, status } = useQuery({
		queryKey: ["post", id],
		queryFn: () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					fetch(`https://dummyjson.com/posts/${id}`)
						.then((res) => res.json() as Promise<Post>)
						.then(resolve);
				}, 1000);
			});
		},
	});

	return (
		<div className="m-4">
			<p className="text-2xl mb-4">{data?.title}</p>
			<p className="max-w-2xl">{data?.body}</p>
			<p className="text-red-400">{status}</p>
		</div>
	);
}
