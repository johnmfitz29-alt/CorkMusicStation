// Reads a request body as text, stopping as soon as it passes the limit, whatever length was declared.
// Returns null when the body is too big.

export async function readText(request, maxBytes) {
  if (Number(request.headers.get("content-length") || 0) > maxBytes) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}
