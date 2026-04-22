import { XMLParser } from 'fast-xml-parser';

type FdxTextNode = { '#text'?: string | number } | string | number;

interface FdxParagraph {
  '@_Type'?: string;
  Text?: FdxTextNode | FdxTextNode[];
}

interface FdxContent {
  Paragraph?: FdxParagraph | FdxParagraph[];
}

interface FdxDocument {
  FinalDraft?: {
    Content?: FdxContent;
  };
}

function extractText(text: FdxParagraph['Text']): string {
  if (text == null) return '';
  const nodes: FdxTextNode[] = Array.isArray(text) ? text : [text];
  return nodes
    .map((node) => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      return node['#text'] != null ? String(node['#text']) : '';
    })
    .join('');
}

export function fdxToFountain(fdxXml: string): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (tagName) => tagName === 'Paragraph' || tagName === 'Text',
    allowBooleanAttributes: true,
    parseTagValue: false,
  });

  const parsed = parser.parse(fdxXml) as FdxDocument;
  const content = parsed?.FinalDraft?.Content;
  if (!content) return '';

  const rawParagraphs = content.Paragraph ?? [];
  const paragraphs: FdxParagraph[] = Array.isArray(rawParagraphs)
    ? rawParagraphs
    : [rawParagraphs];

  const lines: string[] = [];
  let prevType: string | null = null;

  for (const para of paragraphs) {
    const type = para['@_Type'] ?? 'Action';
    const text = extractText(para.Text).trim();
    if (!text) continue;

    // Blank line before block-level elements that start a new visual group
    const startsNewGroup =
      type === 'Scene Heading' ||
      type === 'Transition' ||
      type === 'Action' ||
      (type === 'Character' &&
        prevType !== 'Dialogue' &&
        prevType !== 'Parenthetical');

    if (startsNewGroup && lines.length > 0) {
      lines.push('');
    }

    switch (type) {
      case 'Scene Heading':
        lines.push(text.toUpperCase());
        break;
      case 'Action':
        lines.push(text);
        break;
      case 'Character':
        lines.push(text.toUpperCase());
        break;
      case 'Dialogue':
        lines.push(text);
        break;
      case 'Parenthetical': {
        const normalized =
          text.startsWith('(') && text.endsWith(')') ? text : `(${text})`;
        lines.push(normalized);
        break;
      }
      case 'Transition':
        lines.push(`> ${text.toUpperCase()}`);
        break;
      default:
        lines.push(text);
    }

    prevType = type;
  }

  return lines.join('\n').trim();
}
