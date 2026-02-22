import { describe, expect, it } from "vitest";
import { parseMeetHtml } from "./parseMeetHtml";

// aria-label="字幕" 内に1件のエントリを持つ最小 HTML を生成するヘルパー
function makeHtml(entries: { speaker: string; text: string }[]): string {
  const items = entries
    .map(
      ({ speaker, text }) => `
      <div class="nMcdL">
        <div class="adE6rb">
          <div class="KcIKyf jxFHg">
            <span class="NWpY1d">${speaker}</span>
          </div>
        </div>
        <div class="ygicle">${text}</div>
      </div>`,
    )
    .join("");
  return `<div aria-label="字幕">${items}</div>`;
}

describe("parseMeetHtml", () => {
  describe("正常系", () => {
    it("発言者名と字幕テキストを正しく抽出する", () => {
      const html = makeHtml([{ speaker: "田中", text: "こんにちは" }]);
      expect(parseMeetHtml(html)).toEqual([
        { speaker: "田中", text: "こんにちは" },
      ]);
    });

    it("複数の発言者を順番通りに抽出する", () => {
      const html = makeHtml([
        { speaker: "田中", text: "こんにちは" },
        { speaker: "鈴木", text: "よろしくお願いします" },
      ]);
      expect(parseMeetHtml(html)).toEqual([
        { speaker: "田中", text: "こんにちは" },
        { speaker: "鈴木", text: "よろしくお願いします" },
      ]);
    });

    it("同一発言者の連続エントリをスペース区切りでマージする", () => {
      const html = makeHtml([
        { speaker: "田中", text: "こんにちは" },
        { speaker: "田中", text: "よろしくお願いします" },
      ]);
      expect(parseMeetHtml(html)).toEqual([
        { speaker: "田中", text: "こんにちは よろしくお願いします" },
      ]);
    });

    it("発言者が変わった後に同じ人が再登場してもマージしない", () => {
      const html = makeHtml([
        { speaker: "田中", text: "こんにちは" },
        { speaker: "鈴木", text: "はい" },
        { speaker: "田中", text: "ありがとう" },
      ]);
      expect(parseMeetHtml(html)).toEqual([
        { speaker: "田中", text: "こんにちは" },
        { speaker: "鈴木", text: "はい" },
        { speaker: "田中", text: "ありがとう" },
      ]);
    });
  });

  describe("境界・異常系", () => {
    it("aria-label=\"字幕\" が存在しない場合は空配列を返す", () => {
      const html = "<div><p>字幕なし</p></div>";
      expect(parseMeetHtml(html)).toEqual([]);
    });

    it("空文字列を渡した場合は空配列を返す", () => {
      expect(parseMeetHtml("")).toEqual([]);
    });

    it("字幕テキストが空のエントリはスキップする", () => {
      const html = makeHtml([
        { speaker: "田中", text: "" },
        { speaker: "鈴木", text: "こんにちは" },
      ]);
      expect(parseMeetHtml(html)).toEqual([
        { speaker: "鈴木", text: "こんにちは" },
      ]);
    });

    it("発言者名要素がない場合は speaker が空文字列になる", () => {
      const html = `
        <div aria-label="字幕">
          <div class="nMcdL">
            <div class="ygicle">テキストのみ</div>
          </div>
        </div>`;
      expect(parseMeetHtml(html)).toEqual([
        { speaker: "", text: "テキストのみ" },
      ]);
    });

    it("字幕エリアにエントリが0件の場合は空配列を返す", () => {
      const html = `<div aria-label="字幕"></div>`;
      expect(parseMeetHtml(html)).toEqual([]);
    });
  });
});
