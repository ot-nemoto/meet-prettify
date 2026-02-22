# アーキテクチャ

## ファイル構成

```
src/
├── app/
│   ├── layout.tsx        # ルートレイアウト・メタデータ
│   ├── page.tsx          # メインページ（UI・状態管理）
│   └── globals.css       # グローバルスタイル（Tailwind）
└── lib/
    └── parseMeetHtml.ts  # 字幕解析ロジック
```

## データフロー

```
ユーザーが HTML を貼り付ける（page.tsx）
  ↓
parseMeetHtml() を呼び出す（lib/parseMeetHtml.ts）
  ↓
CaptionEntry[] を useState で保持（page.tsx）
  ↓
吹き出し UI として表示 / Markdown としてコピー
```

## 状態管理

`page.tsx` の `useState` のみで完結している。外部の状態管理ライブラリは使用しない。

| state | 型 | 役割 |
|-------|----|------|
| `html` | `string` | 入力された HTML |
| `myName` | `string` | 「あなた」の表示名（デフォルト: "あなた"） |
| `entries` | `CaptionEntry[]` | 解析結果 |
| `view` | `"input" \| "result"` | 表示切り替え |
| `copied` | `boolean` | Markdown コピー後のフィードバック表示 |

## 設計方針

- **クライアントサイド完結**: HTML の解析は `DOMParser` を使いブラウザ上で実行する。サーバーへのデータ送信はない。
- **静的エクスポート対応**: `next.config.ts` で `output: "export"` を設定し、GitHub Pages 等の静的ホスティングにデプロイできる。
- **解析ロジックの分離**: UI（`page.tsx`）と解析（`parseMeetHtml.ts`）を分けることで、パーサーの単独テストや差し替えを容易にしている。
