# カメレオンJP実験場連携仕様

## 1. 基本方針

ゲームを新しく公開する場合、ゲーム本体だけでなく、カメレオンJPの実験場にも反映する。

ユーザー向けの実験場URL：

```text
https://chameleonjp-lab.github.io/chameleonjp_lab/
```

Codeberg側の公開元：

```text
https://codeberg.org/chameleonjp
```

## 2. 確認対象

新しいゲーム追加時は、次の4点を確認する。

1. ゲーム本体の `index.html`
2. Supabase `games` 登録とランキングRPC
3. 実験場トップ `index.html`
4. 詳細ランキングページ `ranking.html`

## 3. GAMES配列の注意

実験場トップや詳細ランキングページに `GAMES` 配列がある場合、Supabase `games` に登録しただけでは表示されない。
固定配列にも、同じ `game_slug`、タイトル、URL、説明、スコア設定を追加する。

## 4. 登録時に確認する値

- `display_order`
- `game_slug`
- `title`
- `game_url`
- `description`
- `share_text`
- `is_active`
- `top_ranking_type`
- `score_order`
- `score_unit`
- `score_scale`
- `score_decimals`
- `score_label`
- `first_score_label`
- `best_score_label`
- `release_date`

## 5. 難易度別ランキング

1つのゲーム内に難易度がある場合、実験場トップでは1つのゲームとして見せる。
詳細ランキングページでは、必要に応じて難易度別のランキングを表示する。
トップ表示ランキングは、仕様書で決めた代表難易度を使う。

## 6. 追加後の確認

- 実験場トップに表示される
- カードを開ける
- 遊ぶボタンが正しいURLへ飛ぶ
- シェア文が正しい
- 詳細ランキングが開く
- ランキング0件でも表示が壊れない

## maron_hikou の登録値

`docs/game-spec.md` §13 を正とする。
スコアは到達ウェーブ優先の合成値(ranking_score)のため、詳細ランキングページでの表示方法(復元表示できるか)を追加前に要確認。
