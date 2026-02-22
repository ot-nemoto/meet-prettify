# 開発・デプロイ手順

## 技術スタック

- **Next.js** (静的エクスポート対応)
- **React 19** / **TypeScript**
- **Tailwind CSS v4**
- **Biome** (フォーマット・リント)

---

## ローカル開発

### セットアップ

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` でアクセス可能。

### コード品質

```bash
npm run lint      # リント
npm run format    # フォーマット
```

---

## ビルド

### 本番ビルド（静的エクスポート）

```bash
npm run build
```

`out/` ディレクトリに静的ファイルが生成される。

### ローカルでの動作確認

静的ファイルをサーブして確認する場合:

```bash
npx serve out
```

> `next start` は静的エクスポート時は使用不可。

---

## デプロイ（GitHub Pages）

`master` ブランチへ push すると、GitHub Actions が自動でビルド・デプロイを実行する。

```
master へ push
  └─ GitHub Actions (.github/workflows/deploy.yml)
       ├─ npm ci
       ├─ npm run build  (NEXT_PUBLIC_BASE_PATH=/meet-prettify)
       └─ out/ を GitHub Pages へデプロイ
```

デプロイ先: `https://<username>.github.io/meet-prettify/`

### 初回セットアップ

GitHubリポジトリの **Settings > Pages > Source** を **GitHub Actions** に設定する。

---

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `NEXT_PUBLIC_BASE_PATH` | サブパスのベースパス | `""` (ルート) |
