export function fmt(n) {
  return "$" + (n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function extractJSON(text) {
  // Prefer array [...] if it appears before the first object {
  const arrStart = text.indexOf("[");
  const objStart = text.indexOf("{");
  const useArray = arrStart >= 0 && (objStart < 0 || arrStart < objStart);
  const s = useArray ? arrStart : objStart;
  const e = useArray ? text.lastIndexOf("]") : text.lastIndexOf("}");

  if (s < 0 || e < 0) throw new Error("No JSON in response");
  const raw = text.slice(s, e + 1);

  try {
    return JSON.parse(raw);
  } catch {
    // fall through to cleanup parsing
  }

  // Best-effort cleanup for minor formatting issues
  const withoutControls = Array.from(raw, ch => {
    const code = ch.charCodeAt(0);
    return (code <= 31 || code === 127) ? " " : ch;
  }).join("");

  const clean = withoutControls
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  try {
    return JSON.parse(clean);
  } catch {
    // keep final error below
  }

  throw new Error("Could not parse AI response");
}

export function formatMonth(yyyyMm) {
  const [year, month] = yyyyMm.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
}
