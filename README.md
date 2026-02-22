# Meet Prettify

Google Meet の字幕データを抽出し、発言者ごとに整理して表示する Web アプリケーション。

## 使い方

1. Google Meet で字幕を有効にした状態でページのソース HTML をコピーする
2. テキストエリアに貼り付ける
3. 「解析」ボタンをクリックする
4. 発言者ごとに整理された字幕が表示される

## 解析仕様

解析ロジックは [src/lib/parseMeetHtml.ts](src/lib/parseMeetHtml.ts) に実装されている。

### 処理フロー

```
入力 HTML
  ↓
DOMParser でパース
  ↓
parseByKnownSelectors()  ← CSS セレクタで字幕要素を抽出
  ↓
mergeConsecutiveSpeakers()  ← 同一発言者の連続発言をマージ
  ↓
CaptionEntry[]
```

### セレクタ戦略

`aria-label="字幕"` 属性でキャプション領域全体を特定してからスコープを絞り、その中でクラス名で要素を抽出する。`aria-label` はセマンティックな属性であり、UI の内部クラス名より変更されにくい。

| セレクタ | 対象 |
|----------|------|
| `[aria-label="字幕"]` | 字幕領域のコンテナ（アンカー） |
| `.ygicle` | 字幕テキスト要素（コンテナ内） |
| `.NWpY1d` | 発言者名要素（コンテナ内） |

### 発言者の特定

字幕テキスト要素 (`.ygicle`) の親要素が各エントリのコンテナであり、その中に発言者名要素 (`.NWpY1d`) が含まれる。

```
[aria-label="字幕"]
  └── div  (エントリ)
        ├── div.adE6rb
        │     └── div.KcIKyf.jxFHg
        │           └── span.NWpY1d  ← 発言者名
        └── div.ygicle               ← 字幕テキスト
```

### 連続発言のマージ

同一発言者が連続する複数のエントリは、スペース区切りで 1 件にまとめられる。

例：
```
{ speaker: "田中", text: "こんにちは" }
{ speaker: "田中", text: "よろしくお願いします" }
  ↓ マージ
{ speaker: "田中", text: "こんにちは よろしくお願いします" }
```

### 出力データ構造

```typescript
interface CaptionEntry {
  speaker: string; // 発言者名（特定できない場合は空文字列）
  text: string;    // 発言内容
}
```

発言者が特定できない場合、UI 上では「（不明）」と表示される。

## 技術スタック

| カテゴリ | ライブラリ / ツール |
|----------|-------------------|
| フレームワーク | Next.js v16 |
| UI | React v19 |
| スタイル | Tailwind CSS v4 |
| 言語 | TypeScript v5 |
| Linter / Formatter | Biome |

## 開発

```bash
npm install
npm run dev    # 開発サーバー起動 (http://localhost:3000)
npm run build  # 本番ビルド
npm run lint   # Biome でリント
npm run format # Biome でフォーマット
```

## ファイル構成

```
src/
├── app/
│   ├── layout.tsx     # ルートレイアウト
│   ├── page.tsx       # メインページ（UI・状態管理）
│   └── globals.css    # グローバルスタイル
└── lib/
    └── parseMeetHtml.ts  # 字幕解析ロジック
```
