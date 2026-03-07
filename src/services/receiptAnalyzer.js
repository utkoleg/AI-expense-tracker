import { CAT_NAMES, CATS } from "../constants/categories";
import { extractJSON } from "../utils/format";

const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";

const PROMPT = `Is this a receipt/invoice/bill/financial document?
No→ {"not_receipt":true}
Yes→ JSON array where EACH category gets its OWN object. If items span 3 categories, output 3 objects. No markdown:
[{"merchant":"","date":"YYYY-MM-DD","total":0,"currency":"USD","category":"","items":[{"name":"","quantity":1,"price":0}],"notes":""}]
Rules: One object per category. Group total=sum of its items. Tax/shipping→add to largest group.
Categories: ${CAT_NAMES.join(", ")}
Categorize by item type not store name:
- protein/creatine/BCAAs/supplements→Gym
- workout gear/gym clothes→Gym
- medicine/vitamins/pills/OTC drugs→Pharmacy
- prescriptions/lab tests→Healthcare
- cookware/spatulas/utensils→Home & Garden
- sports equipment/shoes→Sports
- food delivery→Fast Food
- fresh food/produce/pantry→Groceries
- clothing/apparel/shoes→Clothing
- Only use Shopping if item truly doesn't fit any other category
Extract ALL line items. Never collapse multiple categories into one.`;

/**
 * Sends one or more base64-encoded images to Claude and parses the expense data.
 * @param {Array<{b64: string, mediaType: string}>} images
 * @returns {Promise<{not_receipt: true} | object[]>}
 */
export async function analyzeReceipt(images) {
  if (!API_KEY) {
    throw new Error("No API key configured. Add VITE_ANTHROPIC_KEY to your .env file.");
  }

  const imageBlocks = images.map(img => ({
    type: "image",
    source: { type: "base64", media_type: img.mediaType, data: img.b64 },
  }));

  const promptText = images.length > 1
    ? `These ${images.length} images are different pages/parts of the SAME receipt. Treat them as one document and extract all items across all pages.\n\n${PROMPT}`
    : PROMPT;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      stream: true,
      messages: [{
        role: "user",
        content: [
          ...imageBlocks,
          { type: "text", text: promptText },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  // Stream the response and stop as soon as we have valid complete JSON.
  // This way simple receipts naturally use fewer tokens.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let sseBuffer = "";
  let sawDone = false;

  try {
    while (!sawDone) {
      const { done, value } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split("\n");
      sseBuffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") {
          sawDone = true;
          break;
        }
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            accumulated += evt.delta.text;
          } else if (evt.type === "error") {
            throw new Error(evt.error?.message || "Stream error");
          }
        } catch (e) {
          if (e.message === "Stream error") throw e;
          // ignore JSON parse errors for malformed SSE lines
        }
      }

      // Stop streaming as soon as we have parseable JSON
      try {
        const result = extractJSON(accumulated);
        reader.cancel();
        if (!Array.isArray(result)) return result;
        return result;
      } catch {
        // incomplete — keep reading
      }
    }
  } finally {
    reader.cancel();
  }

  // Fallback: parse whatever we accumulated
  const result = extractJSON(accumulated);
  if (!Array.isArray(result)) return result;
  return result;
}

/**
 * Builds ONE expense from all category groups returned by Claude.
 * Multiple groups → one expense with a `groups` field for the detail view.
 * @param {object[]} groups - Array returned by analyzeReceipt
 * @returns {object} expense
 */
export function buildExpense(groups) {
  if (!Array.isArray(groups) || groups.length === 0) {
    throw new Error("Receipt has no line items to save");
  }

  const dominant = groups.reduce((a, b) =>
    (parseFloat(b.total) || 0) > (parseFloat(a.total) || 0) ? b : a, groups[0]);

  const normalizedGroups = groups.map(g => {
    const items = Array.isArray(g.items) ? g.items : [];
    return {
      category: CATS[g.category] ? g.category : "Other",
      total:    items.reduce((s, item) => s + (parseFloat(item.price) || 0), 0),
      items,
    };
  });

  return {
    id:       crypto.randomUUID(),
    merchant: groups[0]?.merchant || "Unknown",
    date:     groups[0]?.date || new Date().toISOString().slice(0, 10),
    total:    normalizedGroups.reduce((s, g) => s + g.total, 0),
    currency: groups[0]?.currency || "USD",
    category: CATS[dominant.category] ? dominant.category : "Other",
    items:    normalizedGroups.flatMap(g => g.items),
    notes:    groups[0]?.notes || "",
    addedAt:  new Date().toISOString(),
    groups:   normalizedGroups.length > 1 ? normalizedGroups : undefined,
  };
}
