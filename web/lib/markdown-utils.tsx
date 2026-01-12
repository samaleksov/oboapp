import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Decode HTML entities in text
 * Handles both named entities (&quot;, &amp;, etc.) and numeric entities (&#34;, &#x22;)
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&quot;": '"',
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&apos;": "'",
    "&#39;": "'",
  };

  let decoded = text;
  
  // Replace named entities using a single regex with all entities
  const entityPattern = new RegExp(
    Object.keys(entities)
      .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|"),
    "g"
  );
  decoded = decoded.replace(entityPattern, (match) => entities[match]);
  
  // Replace numeric entities (decimal like &#34;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    const codePoint = parseInt(dec, 10);
    // Validate Unicode range (0-0x10FFFF)
    if (!Number.isNaN(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff) {
      return String.fromCodePoint(codePoint);
    }
    return match; // Return original if invalid
  });
  
  // Replace hexadecimal entities (like &#x22;)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    const codePoint = parseInt(hex, 16);
    // Validate Unicode range (0-0x10FFFF)
    if (!Number.isNaN(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff) {
      return String.fromCodePoint(codePoint);
    }
    return match; // Return original if invalid
  });
  
  return decoded;
}

/**
 * Strip markdown formatting from text for plain text display
 * Uses react-markdown with plain text renderers to extract content
 */
export function stripMarkdown(text: string): string {
  // Create components that just output text content
  const textOnlyComponents: Components = {
    // Just output text content for all elements
    p: ({ children }) => <>{children}</>,
    h1: ({ children }) => <>{children}</>,
    h2: ({ children }) => <>{children}</>,
    h3: ({ children }) => <>{children}</>,
    h4: ({ children }) => <>{children}</>,
    h5: ({ children }) => <>{children}</>,
    h6: ({ children }) => <>{children}</>,
    strong: ({ children }) => <>{children}</>,
    em: ({ children }) => <>{children}</>,
    a: ({ children }) => <>{children}</>,
    code: ({ children }) => <>{children}</>,
    ul: ({ children }) => <>{children}</>,
    ol: ({ children }) => <>{children}</>,
    li: ({ children }) => <>{children} </>,
    blockquote: ({ children }) => <>{children}</>,
    br: () => <> </>,
  };

  // Render markdown to static markup with text-only components
  const markup = renderToStaticMarkup(
    <ReactMarkdown components={textOnlyComponents} skipHtml={true}>
      {text}
    </ReactMarkdown>
  );

  // The markup will still have some HTML tags, so extract text content
  // and normalize whitespace
  const cleaned = markup
    .replace(/<[^>]*>/g, "") // Remove any remaining HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
  
  // Decode HTML entities
  return decodeHtmlEntities(cleaned);
}
