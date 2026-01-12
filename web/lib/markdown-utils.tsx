import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Decode common HTML entities in text
 * Uses simple string replacements for readability
 */
function decodeHtmlEntities(text: string): string {
  let result = text;
  
  // Replace common named entities
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&amp;/g, '&');
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  result = result.replace(/&apos;/g, "'");
  result = result.replace(/&#39;/g, "'");
  
  // Replace decimal numeric entities (e.g., &#34; → ")
  result = result.replace(/&#(\d+);/g, (_match, decimalCode) => {
    const codePoint = Number(decimalCode);
    return String.fromCodePoint(codePoint);
  });
  
  // Replace hexadecimal numeric entities (e.g., &#x22; → ")
  result = result.replace(/&#x([0-9A-Fa-f]+);/g, (_match, hexCode) => {
    const codePoint = Number.parseInt(hexCode, 16);
    return String.fromCodePoint(codePoint);
  });
  
  return result;
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
