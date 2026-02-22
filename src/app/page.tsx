"use client";

import { useState } from "react";
import { applyEdit, parseMeetHtml, type CaptionEntry } from "@/lib/parseMeetHtml";

type View = "input" | "result";

export default function Home() {
  const [html, setHtml] = useState("");
  const [myName, setMyName] = useState("あなた");
  const [entries, setEntries] = useState<CaptionEntry[]>([]);
  const [view, setView] = useState<View>("input");
  const [copied, setCopied] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleParse = () => {
    const result = parseMeetHtml(html);
    setEntries(result);
    setView("result");
  };

  const handleReset = () => {
    setView("input");
    setEntries([]);
    setEditingIndex(null);
  };

  const handleEditStart = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleEditCommit = (index: number) => {
    setEntries((prev) => applyEdit(prev, index, editingText));
    setEditingIndex(null);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  const toDisplayName = (speaker: string) =>
    speaker === "あなた" ? myName : (speaker || "（不明）");

  const handleCopyMarkdown = async () => {
    const md = entries
      .map((e) => `**${toDisplayName(e.speaker)}**: ${e.text}`)
      .join("\n\n");
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Meet Prettify
        </h1>

        {view === "input" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              Google Meet で字幕を有効にした状態のページ HTML を貼り付けてください。
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 whitespace-nowrap" htmlFor="my-name">
                あなたの名前
              </label>
              <input
                id="my-name"
                type="text"
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
              />
            </div>
            <textarea
              className="h-64 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="<!DOCTYPE html>..."
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
            <button
              type="button"
              className="self-end rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
              onClick={handleParse}
              disabled={!html.trim()}
            >
              解析
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {entries.length} 件の発言を抽出しました
              </span>
              <div className="flex gap-2">
                {entries.length > 0 && (
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                    onClick={handleCopyMarkdown}
                  >
                    {copied ? "コピーしました" : "Markdown をコピー"}
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={handleReset}
                >
                  戻る
                </button>
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                字幕データが見つかりませんでした。Google Meet で字幕を有効にした状態の HTML を貼り付けてください。
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {entries.map((entry, i) => {
                  const displayName = toDisplayName(entry.speaker);
                  const isEditing = editingIndex === i;
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static list
                    <li key={i} className="flex flex-col items-start gap-1">
                      <span className="px-1 text-xs font-semibold text-gray-500">
                        {displayName}
                      </span>
                      {isEditing ? (
                        <div className="flex w-full max-w-[75%] flex-col gap-1">
                          <textarea
                            className="w-full rounded-2xl rounded-tl-sm border border-blue-400 bg-white px-4 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm focus:outline-none"
                            // biome-ignore lint/a11y/noAutofocus: 編集開始時に即フォーカスする
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleEditCommit(i);
                              }
                              if (e.key === "Escape") handleEditCancel();
                            }}
                            rows={Math.max(2, editingText.split("\n").length)}
                          />
                          <div className="flex gap-2 px-1">
                            <button
                              type="button"
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() => handleEditCommit(i)}
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              className="text-xs text-gray-400 hover:underline"
                              onClick={handleEditCancel}
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative max-w-[75%]">
                          <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm">
                            {entry.text}
                          </div>
                          <button
                            type="button"
                            aria-label="編集"
                            className="absolute -right-7 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100"
                            onClick={() => handleEditStart(i, entry.text)}
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
