# CLAUDE.md — マロン飛行 (maron_hikou)

このリポジトリは、カメレオンJP共通テンプレート
[chameleonjp_browser_game_kit](https://github.com/chameleonjp-lab/chameleonjp_browser_game_kit)
に従って開発するスマホ向けブラウザゲームです。

## プロジェクト概要

スマホ縦画面で遊ぶ 2D 縦スクロール飛行機シューティング。
敵を倒して戦利品を拾い、1プレイ中だけ機体を強化しながら 30 ウェーブ突破を目指す。
永続強化なし。Supabase ランキング連携必須。Codeberg Pages で公開予定。

| 項目 | 内容 |
|---|---|
| ゲーム名 | マロン飛行 |
| game_slug | maron_hikou |
| 公開予定URL | https://chameleonjp.codeberg.page/maron_hikou/ |
| 公開正本 | `index.html`(HTML・CSS・JS 1ファイル完結) |

- ゲーム固有仕様: `docs/game-spec.md`(共通テンプレート形式)
- 詳細要件仕様: `docs/SPEC_v0.2.md`(数値・文言の唯一の正)
- 開発計画: `docs/DEVELOPMENT_PLAN.md`
- 共通ルール: `.claude/rules/`、`docs/ranking-spec.md`、`docs/mobile-touch-checklist.md`、`docs/lab-integration.md`、`docs/known-issues.md`

## 基本方針(共通テンプレート準拠)

- 公開正本は常に `index.html`。HTML・CSS・JavaScript は1ファイルにまとめる。
- npm、Node、ビルドツール、外部フレームワーク、外部素材を勝手に追加しない。
- Codeberg Pages で公開できる構成を優先する。
- ゲーム仕様を勝手に変えない。不明点は断定せず「未確認」「要確認」と書く。
- 古いコード参照用の途中版は `index_v2.html` のように名前を変え、上書きで履歴を失わない。
- SQL はファイルではなく、チャットへコピペできる形式で出す。

## セッション運用方針(必須)

トークン節約のため、役割を以下のように分担する。

- **メインセッション(Fable 5)**: 設計・監査・レビューに専念する。実装コードの大量出力をしない。
- **実装はサブエージェントへ委譲する**(Agent ツールの `model` パラメータで指定):
  - `sonnet`: UI骨格・画面遷移・CSS・定型的な実装、軽微な修正
  - `opus`: ゲームコア(衝突判定、ウェーブ進行、強化抽選など)の複雑な実装
- **例外**: 実装難易度が特に高い箇所(例: ranking_score の合成・復元、二重送信防止、当たり判定チューニング)はメインセッションで直接実装してよい。
- サブエージェントには必ず `docs/game-spec.md`・`docs/SPEC_v0.2.md` と `docs/DEVELOPMENT_PLAN.md` の該当フェーズを読ませること。
- サブエージェント完了後、メインセッションが必ず差分レビューと仕様監査(`/spec-audit`)を行ってからコミットする。
- フェーズ委譲の手順は `/implement-phase` スキルに従う。
- レビューには `.claude/agents/` の各レビュアー(mobile-game-reviewer、ranking-reviewer、balance-reviewer、lab-integration-reviewer)を活用する。

## 絶対要件(外れたら仕様違反)

1. iPhone SE 級の小さい画面でも遊べること
2. HTML・CSS・JavaScript を 1 つの `index.html` にまとめること(分割禁止、外部素材禁止)
3. 永続強化を入れないこと
4. 戦利品回収とレベルアップをゲームの中心にすること
5. 強化は仕様書 §19 の 7 種類からランダム付与にすること(上限到達分は抽選から除外)
6. 30 ウェーブ制(5波ごとにボス)にすること
7. ランキングは到達ウェーブ優先(`ranking_score = 進行度 × 10,000,000 + 表示用スコア`、30波クリアは進行度31)
8. 結果画面下部にランキング(上位10件)を掲載すること
9. ゲーム中のズーム・長押し・スクロール・誤タップを抑えること(CSS と JS の両方で)
10. Supabase へランキング連携すること(リタイア時は送信しない。二重送信防止。内部スコアは画面に出さない)

## Supabase(共通仕様)

- 接続情報・送信値・RPC は `docs/ranking-spec.md` に従う。
- Publishable key は公開 HTML へ入れてよい。service_role key・DBパスワード・秘密鍵は絶対に入れない。
- スコア送信は1回だけ。送信中・成功・失敗を画面に表示する。

## 実験場連携

新作公開時は、ゲーム本体・Supabase `games` 登録・実験場トップ・詳細ランキングページの4点を確認する。
実験場側に `GAMES` 配列がある場合、Supabase 登録だけでは表示されない。詳細は `docs/lab-integration.md`。

## 作業後の確認

作業後は、仕様との不一致、不具合、古い文言、不要コード、スマホ操作、ランキング送信、二重送信、ゲームバランスを確認する。
公開前は `docs/release-checklist.md` を全件確認する。

## Git

- 開発ブランチ: `claude/optimistic-cori-5e5735`
- フェーズ完了ごとにコミットし、`git push -u origin <branch>` でプッシュする。
