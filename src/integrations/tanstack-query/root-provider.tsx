import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// @ts-ignore
import { MiniQueryClient, MiniQueryClientProvider } from "../../miniQuery.jsx";

const queryClient = new QueryClient();

const miniQueryClient = new MiniQueryClient();

export function getContext() {
	return {
		queryClient,
	};
}

export function Provider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<MiniQueryClientProvider queryClient={miniQueryClient}>
				{children}
			</MiniQueryClientProvider>
		</QueryClientProvider>
	);
}
