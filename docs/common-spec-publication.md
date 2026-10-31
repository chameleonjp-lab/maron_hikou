# マロン飛行: 登録・公開監査と配信手順

確認日: 2026-10-31 UTC。これは全13項目の対応完了を表すPRではありません。

## 対象と現状の証拠

- 稼働Supabase `mlpnjgezrnhdxsxolyzj` の `public.games` に `game_slug=maron_hikou`、`is_active=true` の現在登録を確認。
- 現在登録されている公開先: https://chameleonjp.codeberg.page/maron_hikou/ （HTTP 200）。登録・公開フラグは変更しない。
- GitHub既存リポジトリ: https://github.com/chameleonjp-lab/maron_hikou
- 参照コミット: `db162e229943a63ac66bea888964846ed531f727`。作業開始時に開いているPRは0件。
- 公開先候補のPages API結果: `未確定（Pages API 404 / has_pages=false。リポジトリ名から推測しない）`。
- 現在のPages方式: 未設定。
- 公開ブランチとしてこのPRが対象にする既存default branch: `claude/optimistic-cori-5e5735`。mainへ直接pushしない。
- 実験場詳細: https://chameleonjp-lab.github.io/chameleonjp_lab/ranking.html?game=maron_hikou
- Codebergで取得したHTML SHA-256: `1529e322ec6a5d33e63d8e3406367d5ba956fe25dd3aec9267be0da32d283ef5`。
- GitHub版にはボス攻撃予告、監査用固定シード、結果内訳、以前のバランス修正がある。Codeberg配信と異なる既存差分であり、このPRで採点・難易度を追加変更しない。
- 公開ブラウザ確認はプロキシ証明書エラーで未完了。HTTP到達・コード比較だけでゲーム全体の正常動作とは扱わない。iPhone Safari実機も未確認。

## 共通仕様の追加実装

現在の実装/制約は [common-spec-game.md](common-spec-game.md) を正とする。以下の日本語共有のみの説明は初期PR時点の履歴。

## 初期PRの実装記録

ホームと結果の共有を黒地・白文字の「Xでシェア」に統一し、利用者が投稿確定するXのintentを開く。ポップアップが拒否された場合は本文/URLのコピー用ダイアログを表示し、クリップボード失敗時は手動コピーできる。投稿したとは表示しない。結果は今回の確定値を使用し、名前・推定順位・参加人数を含めない。日本語のみの対応で、15言語化は未完了。

両画面に「ランキング」リンクを追加した。実験場の現在コードが生成する `ranking.html?game=<slug>` を確認して使用し、トップページには移動しない。長文は折り返し、44px以上の操作領域を確保する。既存のget_best_score_rankingにp_limit=30を渡し、プレイ履歴ではなくサーバー集計済み行を最大30件表示する。現行基盤のname-key集計という制約は残る。既存rank_noをそのまま使用し、推測順位を追加しない。

`.github/workflows/pages.yml` はPR作成/更新時に検証だけを実行する。公開ブランチpushでは同じコミットを検証し、成功時だけ同一runの成果物をPagesへ配信する。

`python scripts/prepare-pages.py` はインラインJavaScriptの構文、importmap/JSON、明示した必須ファイル、HTMLから参照されるローカル素材を確認後、許可した実行用ファイルだけを `_site` へコピーする。リポジトリ全体、説明書、ZIP、開発設定、秘密ファイルを公開しない。依存パッケージを追加せず、ゲーム実行時の構成を維持する。

公開権限はdeploy jobだけ（pages:write / id-token:write）。PRから本番公開しない。concurrencyで旧runを取消し、配信直前にも公開ブランチ最新SHAとPages sourceを照合する。保護ルール・環境承認は解除しない。

成果物の `build-info.json` にコミットと各配信ファイルのSHA-256を残し、公開後に実際の更新を確認できるようにした。生成物はgit管理しない。



## 必須の設定と適用順

1. 先に [実験場PR43](https://github.com/chameleonjp-lab/chameleonjp_lab/pull/43) のreceipt SQLを適用/読み戻す。本番未適用で旧RPCへフォールバックしない。その後このPRを確認する。マージ前に Settings → Pages → Build and deployment → Source を **GitHub Actions** にする。既存legacy公開との二重配信を防ぐため、先に切り替える。権限がない場合は管理者が設定する。このPRは設定を変更しない。
2. Settings → Environments → github-pages で `claude/optimistic-cori-5e5735` からの公開が許可されていることを確認する。既存承認ルールは保持する。
3. PRの検証成功を確認後、利用者が `claude/optimistic-cori-5e5735` へマージする。初回に限らず、その後の同ブランチへのマージも同じ流れで検証・配信される。
4. Actionsのdeploy成功後に返された**実際の** page_url を確認する。`build-info.json` のcommitがマージコミットと一致すること、ホーム/開始/結果、CSV・演出素材、ランキング読取、共有先を確認する。テストスコアを本番へ大量送信しない。
5. GitHubページでゲームの正常動作を確認した後に、正式URL定義・OG/canonical/共有文を更新する関連PRと、実験場DB `games.game_url/share_text` の更新を適用する。URLの推測、確認前の強制リダイレクト、登録変更はしない。今回はこの切替を実施していない。
6. DB変更時は対象行の旧URL/share_textを控え、対象slugと旧値を条件に更新して競合を防ぎ、selectで読み戻す。元の値へ同じ条件付き更新で戻せるようにする。実験場内の固定予備データだけ変更して完了としない。

## 記録の維持と移行制約

DB、スコア、参加者、game_slug、モード、ランキング規則、localStorageキーを変更しない。既存記録は削除・再作成しない。
CodebergとGitHubは別originなのでlocalStorage（名前・自己ベスト・設定）は自動で移動しない。旧originの保存を残し、必要なキーだけJSONとして本人が書き出し、GitHub側で型・サイズを検証して取り込む移行UIを別途用意する案がある。未実装のため引継ぎ完了とは報告しない。
共通DBは表示名由来のnormalized_nameで参加者を識別しており、同名の別人を分離できない。名前変更で別参加者になる既存制約は未解決。独立ID導入・旧記録の所有確認を伴う共通契約変更が必要で、名前だけで既存記録を自動移管しない。

## 現在の対応表

[common-spec-game.md](common-spec-game.md) に一本化。下記は初期PRの公開境界検証履歴。最新の15言語/任意名/音/永続送信検証は同文書を参照。

## 検証・復旧

実行: `python scripts/test-pages.py`（許可ファイルだけの公開、欠落素材、構文不正、importmap不正、秘密ファイル/キー検出の6件）、`python scripts/prepare-pages.py`、`git diff --check`。
加えて生成成果物をローカルHTTP配信し、Chromiumの402×874でホーム表示・JavaScript例外0件・横はみ出しなしを確認した。Supabaseへの全通信を遮断しており、本番への記録送信はない。ホーム確認のみで全プレイの動作保証ではない。追加で4ゲームのホーム共有、ポップアップ拒否時コピー表示、日本語/記号/改行のintent往復、詳細URLを確認。マロン飛行・尊厳2・うちかえるの結果ハンドラは固定した結果値によるブラウザ検証で、自己ベストではなく今回の123点が共有されることを確認。翻訳の自然さ、音の聞こえ方、iPhone Safari、配信成功は未確認。

iPhoneでの公開後確認: 縦/横でホームから開始→結果まで進み、下端が隠れないこと、キーボード変換確定で誤開始しないこと、名前なし操作、Xからの復帰、再読込した音設定を確認する。今回未実装の要件は合格扱いにしない。

公開後の問題は変更をrevertするPRを作成し、同じ検証を通した成果物で戻す。旧Actions runを手動再実行して最新公開を上書きしない。GitHub導線を切替済みなら先に記録しておいた旧Codeberg URLへ戻す。保存情報・スコアは消去しない。

追加検証: `node scripts/share.test.mjs` の4件が成功。ポップアップ拒否、コピー成功/失敗、意図したX URLと記号/改行の保持を検証。ローカルChromiumで35件の模擬集計済み行（同じ表示名も含む）を渡し、4ゲームとも30行を表示した。トレメシは模擬Supabaseクライアントでp_limit=30も確認した。本番へ送信していない。
