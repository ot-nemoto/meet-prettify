"use client";

import { useState } from "react";
import { parseMeetHtml, type CaptionEntry } from "@/lib/parseMeetHtml";

type View = "input" | "result";

export default function Home() {
  const [html, setHtml] = useState("");
  const [entries, setEntries] = useState<CaptionEntry[]>([]);
  const [view, setView] = useState<View>("input");

  const handleParse = () => {
    const result = parseMeetHtml(html);
    setEntries(result);
    setView("result");
  };

  const handleReset = () => {
    setView("input");
    setEntries([]);
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
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                onClick={handleReset}
              >
                戻る
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                字幕データが見つかりませんでした。Google Meet で字幕を有効にした状態の HTML を貼り付けてください。
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {entries.map((entry, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static list
                  <li key={i} className="rounded-lg bg-white p-4 shadow-sm">
                    <span className="text-xs font-semibold text-blue-600">
                      {entry.speaker || "（不明）"}
                    </span>
                    <p className="mt-1 text-sm text-gray-800">{entry.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
