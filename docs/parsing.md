# 字幕解析仕様

解析ロジックは [src/lib/parseMeetHtml.ts](../src/lib/parseMeetHtml.ts) に実装されている。

## 処理フロー

```
入力 HTML
  ↓
DOMParser でパース
  ↓
parseByKnownSelectors()  ← aria-label + CSS セレクタで字幕要素を抽出
  ↓
mergeConsecutiveSpeakers()  ← 同一発言者の連続発言をマージ
  ↓
CaptionEntry[]
```

## セレクタ戦略

`aria-label="字幕"` 属性でキャプション領域全体を特定してからスコープを絞り、その中でクラス名で要素を抽出する。`aria-label` はセマンティックな属性であり、UI の内部クラス名より変更されにくい。

| セレクタ | 対象 |
|----------|------|
| `[aria-label="字幕"]` | 字幕領域のコンテナ（アンカー） |
| `.ygicle` | 字幕テキスト要素（コンテナ内） |
| `.NWpY1d` | 発言者名要素（コンテナ内） |

## DOM 構造

```
[aria-label="字幕"]
  └── div  (エントリ)
        ├── div.adE6rb
        │     └── div.KcIKyf.jxFHg
        │           └── span.NWpY1d  ← 発言者名
        └── div.ygicle               ← 字幕テキスト
```

字幕テキスト要素 (`.ygicle`) の `parentElement` が各エントリのコンテナであり、その中に `.NWpY1d` が含まれる。

## 連続発言のマージ

同一発言者が連続する複数のエントリは、スペース区切りで 1 件にまとめられる。

```
{ speaker: "田中", text: "こんにちは" }
{ speaker: "田中", text: "よろしくお願いします" }
  ↓ マージ
{ speaker: "田中", text: "こんにちは よろしくお願いします" }
```

## 出力データ構造

```typescript
interface CaptionEntry {
  speaker: string; // 発言者名（特定できない場合は空文字列）
  text: string;    // 発言内容
}
```

発言者が特定できない場合、UI 上では「（不明）」と表示される。

## Google Meet の HTML 変更への対応

Google Meet の内部クラス名（`.ygicle`、`.NWpY1d` 等）は UI 更新で変わる可能性がある。解析が機能しなくなった場合は以下を確認する。

1. ブラウザの DevTools で `aria-label="字幕"` 要素を特定する
2. 字幕テキストと発言者名のクラス名を確認する
3. `parseByKnownSelectors()` 内のセレクタを更新する
