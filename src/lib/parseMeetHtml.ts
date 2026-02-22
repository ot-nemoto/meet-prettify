export interface CaptionEntry {
  speaker: string;
  text: string;
}

export function parseMeetHtml(html: string): CaptionEntry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const entries = parseByKnownSelectors(doc);
  return mergeConsecutiveSpeakers(entries);
}

function parseByKnownSelectors(doc: Document): CaptionEntry[] {
  const entries: CaptionEntry[] = [];

  const captionRegion = doc.querySelector('[aria-label="字幕"]');
  if (!captionRegion) return entries;

  const captionTexts = captionRegion.querySelectorAll(".ygicle");
  for (const textEl of captionTexts) {
    const container = textEl.parentElement ?? null;
    const speakerEl = container?.querySelector(".NWpY1d") ?? null;

    const speaker = speakerEl?.textContent?.trim() || "";
    const text = textEl.textContent?.trim() || "";

    if (text) {
      entries.push({ speaker, text });
    }
  }

  return entries;
}

function mergeConsecutiveSpeakers(entries: CaptionEntry[]): CaptionEntry[] {
  return entries.reduce<CaptionEntry[]>((acc, entry) => {
    const last = acc[acc.length - 1];
    if (last && last.speaker === entry.speaker) {
      last.text = `${last.text} ${entry.text}`.trim();
    } else {
      acc.push({ ...entry });
    }
    return acc;
  }, []);
}
