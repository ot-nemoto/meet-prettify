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

/**
 * 指定インデックスのエントリのテキストを更新した新しい配列を返す。
 * newText がトリム後に空になる場合は元の配列をそのまま返す。
 */
export function applyEdit(
  entries: CaptionEntry[],
  index: number,
  newText: string,
): CaptionEntry[] {
  const trimmed = newText.trim();
  if (!trimmed) return entries;
  return entries.map((e, i) => (i === index ? { ...e, text: trimmed } : e));
}

/**
 * 新しいエントリを insertAfterIndex の直後に挿入した新しい配列を返す。
 * insertAfterIndex が null の場合は末尾に追加する。
 * speaker または text がトリム後に空になる場合は元の配列をそのまま返す。
 */
export function addEntry(
  entries: CaptionEntry[],
  newEntry: CaptionEntry,
  insertAfterIndex: number | null = null,
): CaptionEntry[] {
  const speaker = newEntry.speaker.trim();
  const text = newEntry.text.trim();
  if (!text) return entries;
  const entry: CaptionEntry = { speaker, text };
  if (insertAfterIndex === null) {
    return [...entries, entry];
  }
  const result = [...entries];
  result.splice(insertAfterIndex + 1, 0, entry);
  return result;
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
