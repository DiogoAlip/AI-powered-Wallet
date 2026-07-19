import React from "react";

export function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1 font-sans text-sm">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (inlineText: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const tokens = inlineText.split(regex);

    tokens.forEach((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(<strong key={index} className="font-bold">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(<em key={index} className="italic">{token.slice(1, -1)}</em>);
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code key={index} className="bg-gray-100 text-[#006a61] font-mono px-1.5 py-0.5 rounded text-xs">
            {token.slice(1, -1)}
          </code>
        );
      } else {
        parts.push(token);
      }
    });

    return parts;
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      flushList(`line-${lineIdx}`);
      elements.push(
        <h4 key={lineIdx} className="font-bold text-sm text-[#0b1c30] mt-3 mb-1">
          {parseInline(trimmed.substring(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(`line-${lineIdx}`);
      elements.push(
        <h3 key={lineIdx} className="font-bold text-base text-[#0b1c30] mt-4 mb-2">
          {parseInline(trimmed.substring(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList(`line-${lineIdx}`);
      elements.push(
        <h2 key={lineIdx} className="font-bold text-lg text-[#0b1c30] mt-4 mb-2">
          {parseInline(trimmed.substring(2))}
        </h2>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(
        <li key={`li-${lineIdx}`} className="font-sans text-sm leading-relaxed">
          {parseInline(trimmed.substring(2))}
        </li>
      );
    } else if (trimmed === "") {
      flushList(`line-${lineIdx}`);
    } else {
      flushList(`line-${lineIdx}`);
      elements.push(
        <p key={lineIdx} className="font-sans text-sm leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  });

  if (inList) {
    flushList("end");
  }

  return <div className="space-y-1">{elements}</div>;
}
