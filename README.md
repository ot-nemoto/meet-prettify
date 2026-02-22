# Meet Prettify

Google Meet の字幕 HTML を貼り付けると、発言者ごとに整理して表示する Web アプリケーション。

## 使い方

1. Google Meet で字幕を有効にした状態でページのソース HTML をコピーする
2. 「あなたの名前」フィールドに自分の名前を入力する（字幕中の「あなた」がこの名前に置き換わる）
3. テキストエリアに貼り付けて「解析」ボタンをクリックする
4. 発言者ごとに整理された字幕が吹き出し形式で表示される
5. 「Markdown をコピー」で議事録用のテキストをクリップボードにコピーできる

## 開発

```bash
npm install
npm run dev    # 開発サーバー起動 (http://localhost:3000)
```

詳細は [docs/development.md](docs/development.md) を参照。

## ドキュメント

- [開発・デプロイ](docs/development.md)
- [字幕解析仕様](docs/parsing.md)
- [アーキテクチャ](docs/architecture.md)
