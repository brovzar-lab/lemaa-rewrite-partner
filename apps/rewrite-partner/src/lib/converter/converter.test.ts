import { describe, it, expect } from 'vitest';
import { fdxToFountain } from './fdxToFountain';
import { fountainToFdx } from './fountainToFdx';

// ---------------------------------------------------------------------------
// Sample FDX — 10-line script (Chinatown-style)
// ---------------------------------------------------------------------------
const SAMPLE_FDX = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="2">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. GITTES OFFICE - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Jake Gittes sits behind his desk, a cigarette dangling from his lip.</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>JAKE</Text>
    </Paragraph>
    <Paragraph Type="Parenthetical">
      <Text>(lighting up)</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>Forget it, Jake. It's Chinatown.</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>EVELYN</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>We could go away. Together.</Text>
    </Paragraph>
    <Paragraph Type="Scene Heading">
      <Text>EXT. CHINATOWN - NIGHT</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>The city glitters far below.</Text>
    </Paragraph>
    <Paragraph Type="Transition">
      <Text>FADE OUT.</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

// ---------------------------------------------------------------------------
// fdxToFountain
// ---------------------------------------------------------------------------
describe('fdxToFountain', () => {
  it('produces non-empty output', () => {
    const result = fdxToFountain(SAMPLE_FDX);
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes scene headings in uppercase', () => {
    const result = fdxToFountain(SAMPLE_FDX);
    expect(result).toContain('INT. GITTES OFFICE - DAY');
    expect(result).toContain('EXT. CHINATOWN - NIGHT');
  });

  it('includes action lines', () => {
    const result = fdxToFountain(SAMPLE_FDX);
    expect(result).toContain('Jake Gittes sits behind his desk');
  });

  it('includes character names in uppercase', () => {
    const result = fdxToFountain(SAMPLE_FDX);
    expect(result).toContain('JAKE');
    expect(result).toContain('EVELYN');
  });

  it('wraps parentheticals in parens', () => {
    const result = fdxToFountain(SAMPLE_FDX);
    expect(result).toContain('(lighting up)');
  });

  it('includes dialogue text', () => {
    const result = fdxToFountain(SAMPLE_FDX);
    expect(result).toContain("Forget it, Jake. It's Chinatown.");
    expect(result).toContain('We could go away. Together.');
  });

  it('renders transitions with > prefix', () => {
    const result = fdxToFountain(SAMPLE_FDX);
    expect(result).toContain('> FADE OUT.');
  });

  it('returns empty string for FDX with no Content', () => {
    const emptyFdx = `<?xml version="1.0" encoding="UTF-8"?><FinalDraft DocumentType="Script" Version="2"></FinalDraft>`;
    expect(fdxToFountain(emptyFdx)).toBe('');
  });

  it('handles scene heading with - DAY/NIGHT suffix', () => {
    const fdx = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="2">
  <Content>
    <Paragraph Type="Scene Heading"><Text>INT. APARTMENT - NIGHT</Text></Paragraph>
  </Content>
</FinalDraft>`;
    const result = fdxToFountain(fdx);
    expect(result).toContain('INT. APARTMENT - NIGHT');
  });
});

// ---------------------------------------------------------------------------
// fountainToFdx
// ---------------------------------------------------------------------------
describe('fountainToFdx', () => {
  const SAMPLE_FOUNTAIN = `INT. GITTES OFFICE - DAY

Jake Gittes sits behind his desk, a cigarette dangling from his lip.

JAKE
(lighting up)
Forget it, Jake. It's Chinatown.

EVELYN
We could go away. Together.

EXT. CHINATOWN - NIGHT

The city glitters far below.

> FADE OUT.`;

  it('produces valid XML starting with declaration', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toMatch(/^<\?xml/);
  });

  it('includes FinalDraft root element', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toContain('<FinalDraft');
    expect(result).toContain('</FinalDraft>');
  });

  it('wraps content in <Content>', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toContain('<Content>');
  });

  it('emits Scene Heading paragraphs', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toContain('Type="Scene Heading"');
  });

  it('emits Character paragraphs', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toContain('Type="Character"');
  });

  it('emits Dialogue paragraphs', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toContain('Type="Dialogue"');
  });

  it('emits Parenthetical paragraphs', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toContain('Type="Parenthetical"');
  });

  it('preserves scene heading text', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    expect(result).toContain('INT. GITTES OFFICE - DAY');
  });

  it('preserves dialogue text', () => {
    const result = fountainToFdx(SAMPLE_FOUNTAIN);
    // fast-xml-parser encodes apostrophes as &apos; in attribute-aware mode
    expect(result).toMatch(/Forget it, Jake\. It(&apos;|&#39;|')s Chinatown\./);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: FDX → Fountain → FDX
// ---------------------------------------------------------------------------
describe('round-trip FDX → Fountain → FDX', () => {
  it('preserves all paragraph types', () => {
    const fountain = fdxToFountain(SAMPLE_FDX);
    const fdxOut = fountainToFdx(fountain);

    expect(fdxOut).toContain('Type="Scene Heading"');
    expect(fdxOut).toContain('Type="Action"');
    expect(fdxOut).toContain('Type="Character"');
    expect(fdxOut).toContain('Type="Dialogue"');
    expect(fdxOut).toContain('Type="Parenthetical"');
  });

  it('preserves scene heading content', () => {
    const fountain = fdxToFountain(SAMPLE_FDX);
    const fdxOut = fountainToFdx(fountain);
    expect(fdxOut).toContain('INT. GITTES OFFICE - DAY');
    expect(fdxOut).toContain('EXT. CHINATOWN - NIGHT');
  });

  it('preserves character names', () => {
    const fountain = fdxToFountain(SAMPLE_FDX);
    const fdxOut = fountainToFdx(fountain);
    expect(fdxOut).toContain('JAKE');
    expect(fdxOut).toContain('EVELYN');
  });

  it('is stable on second round-trip', () => {
    const fountain1 = fdxToFountain(SAMPLE_FDX);
    const fdx1 = fountainToFdx(fountain1);
    const fountain2 = fdxToFountain(fdx1);
    const fdx2 = fountainToFdx(fountain2);
    // Content should be stable after two trips
    expect(fdx2).toContain('INT. GITTES OFFICE - DAY');
    expect(fdx2).toContain('JAKE');
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  it('fdxToFountain: handles empty scene (heading with no body)', () => {
    const fdx = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="2">
  <Content>
    <Paragraph Type="Scene Heading"><Text>INT. EMPTY ROOM - DAY</Text></Paragraph>
    <Paragraph Type="Scene Heading"><Text>EXT. STREET - NIGHT</Text></Paragraph>
  </Content>
</FinalDraft>`;
    const result = fdxToFountain(fdx);
    expect(result).toContain('INT. EMPTY ROOM - DAY');
    expect(result).toContain('EXT. STREET - NIGHT');
  });

  it('fdxToFountain: adds parens to parenthetical missing them', () => {
    const fdx = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="2">
  <Content>
    <Paragraph Type="Character"><Text>JAKE</Text></Paragraph>
    <Paragraph Type="Parenthetical"><Text>beat</Text></Paragraph>
    <Paragraph Type="Dialogue"><Text>Hello.</Text></Paragraph>
  </Content>
</FinalDraft>`;
    const result = fdxToFountain(fdx);
    expect(result).toContain('(beat)');
  });

  it('fountainToFdx: dual dialogue does not crash', () => {
    const dualFountain = `JAKE
Hello there.

EVELYN ^
Hello yourself.`;
    expect(() => fountainToFdx(dualFountain)).not.toThrow();
  });
});
