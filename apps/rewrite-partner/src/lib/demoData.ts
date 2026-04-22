export type NoteCategory = 'story' | 'character' | 'dialogue'
export type NotePriority = 'critical' | 'high' | 'medium' | 'low'
export type NoteColor = 'story' | 'character' | 'dialogue' | 'scene' | 'research' | 'producer'

export interface DemoNote {
  id: string
  text: string
  category: NoteCategory
  color: NoteColor
  priority: NotePriority
  resolved: boolean
  sceneRef: string
  source: string
  createdAt: string
}

export interface DemoProject {
  id: string
  title: string
  lastModified: string
  noteCount: number
  resolvedCount: number
  pageCount: number
}

// Public domain-inspired Fountain screenplay (Chinatown style, original text)
export const DEMO_SCREENPLAY = `INT. GITTES' OFFICE - DAY

The office is spare: a desk, two chairs, a wall of framed licenses.
J.J. GITTES — 40s, a face that has seen too much and charged fair
rates for the privilege — sits studying a photograph.

The photograph shows a man and a woman on a park bench. The man is
feeding pigeons. The woman is watching the man.

                    EVELYN
          You've been looking at that for
          twenty minutes.

GITTES doesn't look up.

                    GITTES
          I'm being thorough.

                    EVELYN
          Is that what you call it?

He sets the photograph down. Meets her eyes.

                    GITTES
          Mrs. Mulwray — when people hire me
          to find out what their husband is
          doing, they usually want to know
          what their husband is doing.

                    EVELYN
          And when I hired you?

                    GITTES
          You hired me to confirm something
          you already knew.

A long beat. She looks away toward the window.

                    EVELYN
          You're very sure of yourself.

                    GITTES
          It's a professional requirement.

He picks up the photograph again. Studies the woman in the frame.

                    GITTES (CONT'D)
          The question isn't what he was
          doing. The question is why you
          needed someone else to see it.

EXT. ECHO PARK LAKE - DAY

The same park bench from the photograph. Gittes stands at the water's
edge, hands in his pockets. The pigeons are here but the man is gone.

A GROUNDSKEEPER rakes the path nearby.

                    GITTES
          Hey. You here yesterday afternoon?

                    GROUNDSKEEPER
          Most afternoons.

                    GITTES
          See a man feeding the birds?
          Expensive suit. Silver hair.

The groundskeeper stops raking.

                    GROUNDSKEEPER
          I see a lot of men feed the birds.

                    GITTES
          This one came with a woman.

The groundskeeper looks at him for a long moment. Then goes back to
raking.

                    GROUNDSKEEPER
          Lots of men come with women.

Gittes takes out a five dollar bill. Sets it on the bench.

                    GITTES
          You see the woman leave alone?

The groundskeeper looks at the bill. Looks at Gittes.

                    GROUNDSKEEPER
          I mind my own business.

Gittes picks up the bill. Puts it back in his pocket.

                    GITTES
          Smart man.

He walks away. Behind him, the groundskeeper watches until he's gone.

INT. WATER DEPARTMENT - RECORDS ROOM - DAY

Rows of filing cabinets, each labeled with a year. Gittes moves down
the aisle, reading labels, until he finds what he's looking for.

He opens the drawer. Runs his finger along the tabs.

                    GITTES
                (to himself)
          1935. 1936. 1937.

The file he needs is missing.

He checks the drawer again. Checks the next drawer. Both empty where
they should be full.

A CLERK appears at the end of the aisle.

                    CLERK
          Can I help you find something?

Gittes closes the drawer. Smiles.

                    GITTES
          Just browsing.

He walks toward the exit. His smile disappears the moment he turns
away from the clerk.

INT. GITTES' OFFICE - NIGHT

Gittes is at his desk again. The photograph is gone. In its place: a
map of the city with several locations circled in red.

He pours himself two fingers of bourbon. Doesn't drink it.

The phone rings.

                    GITTES
          Gittes.

A pause.

                    EVELYN (V.O.)
          Mr. Gittes. I need to see you.

                    GITTES
          It's eleven o'clock.

                    EVELYN (V.O.)
          I know what time it is.

He looks at the map. At the circled locations.

                    GITTES
          Twenty minutes.

He hangs up. Picks up the bourbon. Still doesn't drink it.

He looks at the map one more time — then folds it and puts it in his
jacket pocket.

SMASH CUT TO BLACK.`

export const DEMO_NOTES: DemoNote[] = [
  {
    id: 'note-1',
    text: 'The inciting incident feels too passive. Evelyn hiring Gittes needs more urgency — what forces her hand TODAY? Consider adding an external pressure (a phone call she received, something she found) that makes this the moment she can no longer wait.',
    category: 'story',
    color: 'story',
    priority: 'high',
    resolved: false,
    sceneRef: "INT. GITTES' OFFICE - DAY",
    source: 'Director note',
    createdAt: '2026-04-20T09:00:00Z',
  },
  {
    id: 'note-2',
    text: "The records room scene ends too neatly. Gittes escaping without consequence undermines the stakes. Either the clerk suspects him (plants a seed for Act 2), or he gets something — a partial file, a torn page — that complicates rather than dead-ends the investigation.",
    category: 'story',
    color: 'story',
    priority: 'critical',
    resolved: false,
    sceneRef: 'INT. WATER DEPARTMENT - RECORDS ROOM - DAY',
    source: 'Script notes, draft 3',
    createdAt: '2026-04-20T09:30:00Z',
  },
  {
    id: 'note-3',
    text: "Gittes' final moment with the bourbon — not drinking it — is good but needs a callback. If we don't pay this off later (he drinks it when things go wrong, or offers it to someone), cut it. Chekhov's glass.",
    category: 'story',
    color: 'scene',
    priority: 'medium',
    resolved: true,
    sceneRef: "INT. GITTES' OFFICE - NIGHT",
    source: 'Producer note',
    createdAt: '2026-04-21T10:00:00Z',
  },
  {
    id: 'note-4',
    text: "Evelyn is reactive in every scene. She responds, deflects, retreats. Where is the one moment where she chooses something? Even a small choice — picking up the photograph, crossing to the window first — gives us a crack of agency. She needs to want something, not just fear something.",
    category: 'character',
    color: 'character',
    priority: 'high',
    resolved: false,
    sceneRef: "INT. GITTES' OFFICE - DAY",
    source: 'Director note',
    createdAt: '2026-04-20T14:00:00Z',
  },
  {
    id: 'note-5',
    text: "The groundskeeper is a missed opportunity. He knows something — the five dollar bill refusal makes that clear — but we never return to him. Either use him in Act 2 or cut the hint entirely. Right now he's a dangling thread that reads like a mistake.",
    category: 'character',
    color: 'character',
    priority: 'medium',
    resolved: true,
    sceneRef: 'EXT. ECHO PARK LAKE - DAY',
    source: 'Script notes, draft 3',
    createdAt: '2026-04-21T11:00:00Z',
  },
  {
    id: 'note-6',
    text: '"It\'s a professional requirement." This is the best line in the script. Don\'t rewrite it. Everything around it can go but this line stays. Build to it — the preceding exchange is slightly clunky and weakens the landing.',
    category: 'dialogue',
    color: 'dialogue',
    priority: 'low',
    resolved: false,
    sceneRef: "INT. GITTES' OFFICE - DAY",
    source: 'Director note',
    createdAt: '2026-04-21T13:00:00Z',
  },
  {
    id: 'note-7',
    text: 'Gittes speaking to himself in the records room ("1935. 1936. 1937.") — this is film noir shorthand we\'ve seen a thousand times. Either make it specific to THIS character\'s voice or cut it. He can simply read the labels; we understand what he\'s doing.',
    category: 'dialogue',
    color: 'dialogue',
    priority: 'medium',
    resolved: false,
    sceneRef: 'INT. WATER DEPARTMENT - RECORDS ROOM - DAY',
    source: 'Script notes, draft 3',
    createdAt: '2026-04-21T15:30:00Z',
  },
]

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: 'demo',
    title: 'The Last Water (Draft 3)',
    lastModified: '2026-04-22',
    noteCount: 7,
    resolvedCount: 2,
    pageCount: 94,
  },
  {
    id: 'demo-2',
    title: 'Night Protocol (Spec)',
    lastModified: '2026-04-18',
    noteCount: 12,
    resolvedCount: 8,
    pageCount: 112,
  },
  {
    id: 'demo-3',
    title: 'Harbor View (Pilot Draft)',
    lastModified: '2026-04-10',
    noteCount: 24,
    resolvedCount: 24,
    pageCount: 58,
  },
]

export const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@rewritepartner.app',
}
