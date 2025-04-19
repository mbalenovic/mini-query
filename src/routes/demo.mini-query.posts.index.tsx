import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import type { Posts } from "../types";

export const Route = createFileRoute("/demo/mini-query/posts/")({
	component: MiniQueryDemo,
});

function MiniQueryDemo() {
	const { data } = useQuery({
		queryKey: ["posts"],
		queryFn: () =>
			fetch("https://dummyjson.com/posts").then(
				(res) => res.json() as Promise<Posts>,
			),
		initialData: { posts: [] },
	});

	return (
		<div className="p-4">
			<h1 className="text-2xl mb-4">Blog posts</h1>
			<ul>
				{data.posts.map((post) => (
					<Link
						to="/demo/mini-query/posts/post/$postId"
						params={{ postId: post.id.toString() }}
						key={post.title}
						className="block text-blue-500 p-1"
					>
						{post.title}
					</Link>
				))}
			</ul>
		</div>
	);
}
