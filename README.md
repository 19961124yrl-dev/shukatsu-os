# Shūkatsu OS

日本向けのローカルファースト就職活動管理アプリです。ビルドツールは使わず、静的ファイルをそのまま配信します。

## ソース構成

```text
index.html              入口（ES Modules を読み込む）
app.js                  ルーティング、画面イベント、フォーム
js/db.js                IndexedDB の保存とストレージ移行
js/state.js             状態スキーマ移行、関連データ削除、集計
js/views.js             表示用の純粋な集計関数
js/csv.js               CSV のエスケープと解析
js/dates.js             日付の表示・入力変換
styles.css              UI
manifest.webmanifest    PWA 設定
service-worker.js       オフラインキャッシュと更新制御
tests/p0-tests.html     ブラウザで実行する P0 テスト
```

`package.json`、`src/`、`public/` は不要です。配信するルートがそのままソースです。

## データベースと移行

- `DB_NAME`: `shukatsu-os-japan`
- `INDEXED_DB_VERSION`: `3`（`js/db.js`）。IndexedDB の**オブジェクトストア構造**を変更した場合だけ上げます。
- `STATE_SCHEMA_VERSION`: `3`（`js/state.js`）。保存された `main` レコードの**業務データ形状**を変更した場合だけ上げます。

この二つは別物です。IndexedDB の `onupgradeneeded` は `oldVersion` / `newVersion` ごとに非破壊で処理し、既存の `state` ストアを再作成しません。保存レコードは読み込み後に `migrateState` で不足フィールドを補完します。

すべてのデータはこの端末・ブラウザの IndexedDB にのみ保存されます。JSON バックアップ、JSON 復元、CSV 入出力を利用できます。

## 関連データの削除

企業を削除すると、同じ企業 ID を持つタスクとタイムラインイベントを削除します。応募書類自体は残し、`documents.companyIds` と企業側の `documents` から対象 ID だけを外します。復元時も孤立したタスク、イベント、書類関連を除去します。

## テスト

ローカルサーバーまたは Cloudflare Pages で `tests/p0-tests.html` を開くと、CRUD、選考履歴、関連削除、JSON 保護、CSV 特殊文字、状態集計、カレンダー連動、IndexedDB 旧版からの更新を実行します。

PowerShell の静的確認：

```powershell
./tests/verify-static-source.ps1
```

## Cloudflare Pages

- 本番 URL: https://toudi-guan-jia.pages.dev/
- Git 連携後の設定: GitHub `19961124yrl-dev/shukatsu-os` / `main`
- フレームワーク: None
- ビルドコマンド: なし
- 出力ディレクトリ: `/`（リポジトリルート）

GitHub 連携を有効にすると、`main` への push が自動デプロイされます。
