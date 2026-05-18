export const config = { runtime: "edge", maxDuration: 300 };

export default async function handler(req: Request): Promise<Response> {
	if (req.method !== "POST")
		return new Response("Method Not Allowed", { status: 405 });

	const target = req.headers.get("x-ollama-target");
	if (!target)
		return new Response("Missing x-ollama-target header", { status: 400 });

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	const auth = req.headers.get("authorization");
	if (auth) headers.Authorization = auth;

	const body = await req.text();

	try {
		const res = await fetch(`${target}/api/chat`, {
			method: "POST",
			headers,
			body,
		});
		return new Response(res.body, {
			status: res.status,
			headers: {
				"Content-Type":
					res.headers.get("content-type") || "application/x-ndjson",
			},
		});
	} catch {
		return new Response(`Cannot reach Ollama at ${target}`, { status: 502 });
	}
}
