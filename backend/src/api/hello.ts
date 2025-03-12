// src/api/hello.ts
export function getHelloResponse(): Response {
  const data = { message: "Hello from API!" };
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
