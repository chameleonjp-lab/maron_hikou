# Supabaseランキング共通仕様

## 1. 基本方針

カメレオンJPのランキング対応ゲームでは、Supabase連携を必須とする。
ゲーム終了時にスコアを送る。仕様で自動送信と決めたゲームでは、結果画面でユーザーに任意送信させない。

## 2. 公開してよい値

```js
const SUPABASE_URL = "https://mlpnjgezrnhdxsxolyzj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_drzcy0v97knU6FgjqSgBHw_0A9XPdFM";
```

Publishable keyは公開HTMLへ入れてよい。
service_role key、DBパスワード、秘密鍵は絶対に入れない。

## 3. 共通送信値

- `display_name`
- `game_slug`
- `score`
- `client_version`

スコアは内部では整数として扱う。
秒や小数表示が必要な場合は、`score_scale` と `score_decimals` で表示を変換する。

## 4. games設定

- `game_slug`
- `title`
- `game_url`
- `description`
- `share_text`
- `score_order`: `asc` または `desc`
- `score_unit`
- `score_scale`
- `score_decimals`
- `score_label`
- `first_score_label`
- `best_score_label`
- `top_ranking_type`: `first` または `best`
- `is_active`
- `display_order`
- `release_date`

## 5. RPC

標準で確認するRPC：

- `submit_score`
- `get_first_try_ranking`
- `get_best_score_ranking`
- `get_game_play_stats`

ゲーム固有RPCを使う場合は、`docs/game-spec.md` に理由と送信値を書く。

## 6. 同率順位

同点の場合は、可能なら `1位、1位、3位` のような同率順位にする。
この表示はフロントだけで無理に作らず、RPCが `rank_no` を返すか確認する。

## 7. 画面表示

ランキング送信では、次の状態を必ず表示する。

- 送信中
- 送信成功
- 送信失敗

送信失敗時も、ゲーム結果は見えるようにする。

## 8. SQL出力ルール

SQLはファイルにしない。
ユーザーがSupabase SQL Editorへ貼れるよう、チャットへコピペできる形式で出す。
