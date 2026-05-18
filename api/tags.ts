export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
	const target = req.headers.get("x-ollama-target");
	if (!target)
		return new Response("Missing x-ollama-target header", { status: 400 });

	const headers: Record<string, string> = {};
	const auth = req.headers.get("authorization");
	if (auth) headers.Authorization = auth;

	try {
		const res = await fetch(`${target}/api/tags`, {
			headers,
			signal: AbortSignal.timeout(4000),
		});
		return new Response(res.body, { status: res.status });
	} catch {
		return new Response("{}", { status: 502 });
	}
}
