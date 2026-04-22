import { Fountain } from 'fountain-js';
import type { Token } from 'fountain-js';
import { XMLBuilder } from 'fast-xml-parser';

const FDX_TYPE_MAP: Partial<Record<string, string>> = {
  scene_heading: 'Scene Heading',
  action: 'Action',
  character: 'Character',
  dialogue: 'Dialogue',
  parenthetical: 'Parenthetical',
  transition: 'Transition',
};

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '');
}

function toFdxText(token: Token): string {
  const raw = stripHtml(token.text ?? '').trim();
  // fountain-js emits parentheticals with surrounding parens already
  return raw;
}

export function fountainToFdx(fountainText: string): string {
  const fountain = new Fountain();
  const { tokens } = fountain.parse(fountainText, true);

  const paragraphs: Array<Record<string, string>> = [];

  for (const token of tokens) {
    const fdxType = FDX_TYPE_MAP[token.type];
    if (!fdxType) continue;

    const text = toFdxText(token);
    if (!text) continue;

    paragraphs.push({ '@_Type': fdxType, '#text': text });
  }

  // Build structure for XMLBuilder: Paragraph elements each need a Text child
  const xmlParagraphs = paragraphs.map(({ '@_Type': type, '#text': text }) => ({
    '@_Type': type,
    Text: text,
  }));

  const docObj = {
    FinalDraft: {
      '@_DocumentType': 'Script',
      '@_Version': '2',
      Content: {
        Paragraph: xmlParagraphs,
      },
    },
  };

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressEmptyNode: true,
  });

  const xmlBody = builder.build(docObj) as string;
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody.trimStart()}`;
}
