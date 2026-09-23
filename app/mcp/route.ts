import { handleMessage } from "@/content/models/mcp";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
};

const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return reply({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400);
  }
  const messages = Array.isArray(payload) ? payload : [payload];
  const responses = messages.map((message) => handleMessage(message)).filter((response) => response !== null);
  if (responses.length === 0) return new Response(null, { status: 202, headers: cors });
  return reply(Array.isArray(payload) ? responses : responses[0]);
}

// Stateless server: no server-initiated stream and no sessions to end.
export function GET() {
  return new Response("This MCP endpoint accepts POST only. See https://pickamodel.dev/agents", { status: 405, headers: { ...cors, Allow: "POST, OPTIONS" } });
}

export function DELETE() {
  return new Response(null, { status: 405, headers: { ...cors, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}
