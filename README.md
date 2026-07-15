# Shūkatsu OS

日本の就職活動を一元管理する、ブラウザ完結型の静的Webアプリです。

## ソース構成

- `index.html` — アプリのエントリーポイント
- `app.js` — 画面、応募データ、タイムライン、IndexedDB、JSON/CSV入出力
- `styles.css` — レスポンシブUIのスタイル
- `manifest.webmanifest` — PWAメタデータ
- `service-worker.js` — オフライン用キャッシュ
- `tests/verify-static-source.ps1` — 必須ファイルとIndexedDB実装を検査するスクリプト

このプロジェクトはビルドツールを使わない静的サイトです。`package.json`、`src/`、`public/` は不要です。

## データ保存

業務データはブラウザの IndexedDB（`shukatsu-os-db`）に保存されます。クラウド同期は行いません。アプリ内のJSONバックアップ、JSON復元、CSV書き出し、CSV取り込みを利用できます。

## ローカル確認

PowerShell で次を実行します。

```powershell
./tests/verify-static-source.ps1
```

## Cloudflare Pages

- 本番URL: https://toudi-guan-jia.pages.dev/
- デプロイ方式: Direct Upload（Git連携なし）
- ビルドコマンド: なし
- 出力ディレクトリ: リポジトリ直下（`/`）
- 本番ブランチ表示: `main`

GitHubはソース管理用です。Cloudflare PagesをGit連携へ変更するまでは、GitHubへのpushだけでは本番サイトは更新されません。
