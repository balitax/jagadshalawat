// Lightweight, isomorphic HTML sanitizer.
// Strips the most common XSS vectors (script/style/iframe, event-handler
// attributes, javascript: URLs). Runs identically on server and client so the
// rendered HTML stays hydration-safe.

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = html;

  // Remove dangerous elements (including their contents)
  out = out.replace(
    /<(script|style|iframe|object|embed|link|meta|svg|math|base|form)[^>]*>[\s\S]*?<\/(?:\1)>/gi,
    ""
  );
  // Remove self-closing / empty dangerous elements
  out = out.replace(
    /<(script|style|iframe|object|embed|link|meta|svg|math|base|form)[^>]*\/?>/gi,
    ""
  );
  // Strip event-handler attributes (on*="...")
  out = out.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Neutralize javascript: URLs
  out = out.replace(
    /(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi,
    '$1=$2#$2'
  );

  return out;
}
