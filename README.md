# えぬﾀﾝｺ 公式サイト

イロハミント制作。ビルド不要の静的サイトです(GitHub Pages でそのまま公開できます)。

## 公開のしかた
1. このフォルダの中身をリポジトリのルートに置く
2. Settings → Pages → Source を `main` / `(root)` にする

## 更新するファイル
| やりたいこと | 編集するファイル |
| --- | --- |
| お知らせ・配信予定・曲リスト・作品・動画 | `data.js` |
| X のアカウント / フォーム送信先 | `data.js` の `CONFIG` |
| 見た目 | `style.css` |
| 画像 | `assets/` |

`data.js` の中身は現在 **サンプル** です。公開前に本物へ差し替えてください。

## 動作確認
```sh
python3 -m http.server 8000
```
http://localhost:8000/ を開く。

## 未接続の機能
- 匿名メッセージ / お問い合わせ: `CONFIG.endpoint` が空のあいだは「サンプル表示」で、実際には送信されません。
- 共有画像(OGP): 公開URLが決まったら `index.html` の `og:image` を絶対URLにしてください。

## ファイル構成
- `index.html` 画面構成 / `style.css` 見た目 / `app.js` 動き / `data.js` 更新データ
- `manifest.webmanifest` `sw.js` ホーム画面追加・オフライン対応
- `404.html` 見つからないときの案内


## 管理画面(HP更新ページ)
- `/admin/` が管理画面です。合言葉を入れて、お知らせ・配信予定・歌える曲・作品/動画・プロフィール・受信箱を更新できます。
- データは Supabase(`enu_get` などの関数)に保存され、サイトは開くたびに読み込みます。つながらないときは前回の内容 → `data.js` のサンプル、の順で表示します。
- 初回だけ `admin/setup.sql` を Supabase の SQL Editor で実行します(最後の行の合言葉を書き換えてから)。
- 試作用の鍵(`gate.js`)は、公開時に `ENABLED=false` にします。
