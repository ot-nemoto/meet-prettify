# アーキテクチャ

## ファイル構成

```
src/
├── app/
│   ├── layout.tsx             # ルートレイアウト・メタデータ
│   ├── page.tsx               # メインページ（UI・状態管理）
│   └── globals.css            # グローバルスタイル（Tailwind）
└── lib/
    ├── parseMeetHtml.ts       # 字幕解析ロジック
    └── parseMeetHtml.test.ts  # 字幕解析ロジックの単体テスト
vitest.config.ts               # Vitest 設定（jsdom 環境）
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
| `entries` | `CaptionEntry[]` | 解析結果（編集・追加後は変更済みの値を保持） |
| `view` | `"input" \| "result"` | 表示切り替え |
| `copied` | `boolean` | Markdown コピー後のフィードバック表示 |
| `editingIndex` | `number \| null` | 現在編集中のエントリのインデックス（`null` は非編集状態） |
| `editingText` | `string` | 編集中テキストの一時保持領域 |
| `isAdding` | `boolean` | 追加フォームの表示状態 |
| `addAfterIndex` | `number \| null` | 追加するエントリの挿入位置（`null` は末尾に追加） |
| `addingSpeaker` | `string` | 追加フォームの発言者名入力値 |
| `addingText` | `string` | 追加フォームの発言内容入力値 |

## 発言者名の表示ロジック

`page.tsx` の `toDisplayName(speaker)` 関数が、解析結果の `speaker` をUI表示用の名前に変換する。

| `speaker` の値 | 表示名 |
|---|---|
| `"あなた"` | `myName` 入力フィールドの値（デフォルト: `"あなた"`） |
| `""` (空文字列) | `"（不明）"` |
| その他 | そのまま表示 |

## 解析結果の編集機能

解析後の結果画面で、各発言エントリのテキストを個別に編集できる。

- 吹き出しにホバーすると鉛筆アイコン（✏️）が表示され、クリックで編集モードに入る
- 編集中はテキストエリアが表示される
  - `Enter` キーで保存、`Shift+Enter` で改行
  - `Escape` キーまたは「キャンセル」ボタンで変更を破棄
- 保存時にテキストが空白のみの場合は変更を反映せず元のテキストを維持する
- 編集できるのはテキストのみ。発言者名の変更は不可

## エントリ追加機能

解析後の結果画面で、発言エントリを新たに追加できる。

- 吹き出しにホバーすると ➕ アイコンが表示され、クリックでその下に追加フォームが開く
- 結果画面の下部にある「＋ エントリを追加」ボタンをクリックすると末尾に追加フォームが開く
- 追加フォームには発言者名（省略可）と発言内容を入力する
  - 発言内容の `Enter` キーで追加確定、`Shift+Enter` で改行
  - `Escape` キーまたは「キャンセル」ボタンで破棄
- 発言内容が空白のみの場合は追加できない（「追加」ボタンが無効化される）

## Markdown コピー機能

「Markdown をコピー」ボタンを押すと、以下の形式でクリップボードにコピーされる。

```
**{発言者名}: {テキスト}
**{発言者名}: {テキスト}
...
```

発言者名は `toDisplayName()` で変換した値が使用される。

## 設計方針

- **クライアントサイド完結**: HTML の解析は `DOMParser` を使いブラウザ上で実行する。サーバーへのデータ送信はない。
- **静的エクスポート対応**: `next.config.ts` で `output: "export"` を設定し、GitHub Pages 等の静的ホスティングにデプロイできる。
- **解析ロジックの分離**: UI（`page.tsx`）と解析（`parseMeetHtml.ts`）を分けることで、パーサーの単独テストや差し替えを容易にしている。
