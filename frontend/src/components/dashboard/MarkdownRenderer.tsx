'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  let keyCounter = 0;
  const getKey = () => `md-${keyCounter++}`;

  // Improved inline markdown parser
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;

    // Split by markdown patterns while preserving order
    const patterns: Array<{ regex: RegExp; render: (match: string, ...groups: string[]) => React.ReactNode }> = [
      {
        regex: /\*\*(.+?)\*\*/g,
        render: (_, text) => <strong key={getKey()} style={{ fontWeight: 700, color: 'inherit' }}>{text}</strong>
      },
      {
        regex: /\*(.+?)\*/g,
        render: (_, text) => <em key={getKey()} style={{ fontStyle: 'italic' }}>{text}</em>
      },
      {
        regex: /`(.+?)`/g,
        render: (_, text) => (
          <code
            key={getKey()}
            style={{
              background: 'rgba(0, 119, 181, 0.15)',
              color: '#0077b5',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            {text}
          </code>
        )
      },
    ];

    // Process text with inline markdown
    let lastIndex = 0;
    const matches: Array<{ index: number; length: number; node: React.ReactNode }> = [];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(text)) !== null) {
        const node = pattern.render(match[0], ...match.slice(1));
        matches.push({
          index: match.index,
          length: match[0].length,
          node
        });
      }
    });

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    // Build parts array
    matches.forEach(match => {
      if (lastIndex < match.index) {
        parts.push(<span key={getKey()}>{text.substring(lastIndex, match.index)}</span>);
      }
      parts.push(match.node);
      lastIndex = match.index + match.length;
    });

    if (lastIndex < text.length) {
      parts.push(<span key={getKey()}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : [<span key={getKey()}>{text}</span>];
  };

  // Main markdown parser
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const result: React.ReactNode[] = [];
    let inList = false;
    let inOrderedList = false;
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        if (inOrderedList) {
          result.push(
            <ol key={getKey()} style={{ margin: '8px 0', paddingLeft: '24px', listStyle: 'decimal' }}>
              {listItems}
            </ol>
          );
        } else {
          result.push(
            <ul key={getKey()} style={{ margin: '8px 0', paddingLeft: '24px', listStyle: 'none' }}>
              {listItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px', position: 'relative', paddingLeft: '20px' }}>
                  <span style={{
                    position: 'absolute',
                    left: '0',
                    color: '#0077b5',
                    fontWeight: 700,
                  }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        listItems = [];
        inList = false;
        inOrderedList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        flushList();
        if (index < lines.length - 1 && lines[index + 1]?.trim()) {
          result.push(<div key={getKey()} style={{ height: '8px' }} />);
        }
        return;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        flushList();
        result.push(
          <h3 key={getKey()} style={{
            fontSize: '1rem',
            fontWeight: 700,
            margin: '16px 0 8px 0',
            color: '#0077b5',
            lineHeight: 1.4,
          }}>
            {parseInlineMarkdown(trimmed.substring(4))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushList();
        result.push(
          <h2 key={getKey()} style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: '20px 0 12px 0',
            color: '#0077b5',
            lineHeight: 1.4,
          }}>
            {parseInlineMarkdown(trimmed.substring(3))}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('# ')) {
        flushList();
        result.push(
          <h1 key={getKey()} style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            margin: '24px 0 16px 0',
            color: '#0077b5',
            lineHeight: 1.4,
          }}>
            {parseInlineMarkdown(trimmed.substring(2))}
          </h1>
        );
        return;
      }

      // Ordered list
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (orderedMatch) {
        if (!inOrderedList) {
          flushList();
          inOrderedList = true;
          inList = true;
        }
        listItems.push(
          <li key={getKey()} style={{ marginBottom: '6px', lineHeight: 1.6 }}>
            {parseInlineMarkdown(orderedMatch[2])}
          </li>
        );
        return;
      }

      // Unordered list
      const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      if (unorderedMatch) {
        if (inOrderedList) {
          flushList();
        }
        if (!inList) {
          inList = true;
        }
        listItems.push(
          <div key={getKey()} style={{ lineHeight: 1.6 }}>
            {parseInlineMarkdown(unorderedMatch[1])}
          </div>
        );
        return;
      }

      // Code block
      if (trimmed.startsWith('```')) {
        flushList();
        // Skip code blocks for now (could be enhanced later)
        return;
      }

      // Regular paragraph
      flushList();
      result.push(
        <p key={getKey()} style={{
          margin: '0 0 10px 0',
          lineHeight: 1.7,
          fontSize: '0.95rem',
        }}>
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    });

    flushList();
    return result;
  };

  return (
    <div style={{
      lineHeight: 1.6,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
    }}>
      {parseMarkdown(content)}
    </div>
  );
}

