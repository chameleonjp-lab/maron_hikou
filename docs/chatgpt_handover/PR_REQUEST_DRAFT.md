# PRリクエスト下書き — ChatGPT向け徹底申し送りを追加

> **状態**: 下書きのみ。GitHub上のPull Requestは作成・Openしてはならない。
>
> **レビュー対象ブランチ**: `docs/chatgpt-handover-maron-hikou-20260816`
>
> **比較元ブランチ**: `claude/optimistic-cori-5e5735`

## 提案タイトル

```text
Docs: add comprehensive ChatGPT handover for Maron Hikou
```

## 提案本文

### 概要

マロン飛行を次の担当者（ChatGPTを含む）が安全に改善できるよう、専用の申し送りフォルダ `docs/chatgpt_handover/` を追加します。現行実装の構成、監査で確認したバランス問題、優先実装手順、定量的な受け入れ基準、実機・Supabaseを含むリリースチェックを1か所へ集約しました。

本変更は**ドキュメントと監査証跡のみ**です。`index.html`のゲームロジック、ゲームバランス、ランキング送信先、本番環境設定は変更しません。

### 追加内容

| パス | 内容 |
|---|---|
| `docs/chatgpt_handover/README.md` | 読む順番、非交渉の制約、直近の推奨タスク。 |
| `docs/chatgpt_handover/01_PROJECT_AND_RUNTIME.md` | プロダクト目的、画面遷移、1ファイル実装の構造、重要な定数、ランキング構造。 |
| `docs/chatgpt_handover/02_BALANCE_AUDIT.md` | 敵対的監査の結果、100,000試行の成長・TTK分布、問題の優先順位。 |
| `docs/chatgpt_handover/03_IMPLEMENTATION_PLAYBOOK.md` | 下振れ保護、フレーム独立追従、固定seed、TTK、弾上限、ランキング改善の実装手順。 |
| `docs/chatgpt_handover/04_TEST_RELEASE_CHECKLIST.md` | 自動・実機・Supabase検証とリリース判断のチェックリスト。 |
| `docs/chatgpt_handover/assets/` | 監査チャート。 |
| `docs/chatgpt_handover/data/` | 100,000試行の監査生データ。 |
| `docs/chatgpt_handover/scripts/` | 監査生データを再生成するNodeスクリプト。 |

### 重要な監査所見

- W5前に攻撃強化がゼロの確率は、全敵撃破・全戦利品回収という有利条件でも**49.141%**。
- W30ボスの理論撃破時間はP10〜P90で**24.6〜71.0秒**に分散し、全弾命中の仮定でも46.4秒の開きがある。
- 現追従はフレーム固定のため、同じ操作の追従感が低FPS端末ほど悪化する。
- 競技ランキングでは、乱数の固定化とサーバー側スコア検証が未完了である。

### レビューで確認してほしいこと

- [ ] ドキュメントの優先順位が、プロダクトの現在の公開方針と一致している。
- [ ] 申し送りフォルダの構成が、次の実装担当者にとって十分に発見しやすい。
- [ ] 監査値・受け入れ基準が、今後のバランス改修の基準として妥当である。
- [ ] 競技ランキングの公平性・改ざん対策を先送りにしない方針に同意できる。
- [ ] `index.html`および公開設定に意図しない変更がない。

### 検証

- 申し送り内リンクと相対パスを確認。
- 監査スクリプトをNode.jsで再実行し、JSONが再生成できることを確認。
- 変更対象が`docs/chatgpt_handover/`のみであることを`git diff --check`および`git status`で確認。

## Openしないための手順

この下書きを用意しても、以下を実行してはならない。

```bash
# 実行禁止: GitHub上のPRを作成・Openする
# gh pr create ...
```

レビュー担当者へは、プッシュ済みブランチ名と比較URLのみを共有する。GitHub上でのPR作成・Openは、明示的な承認後に行う。
