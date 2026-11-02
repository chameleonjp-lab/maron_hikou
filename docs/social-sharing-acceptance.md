# 固定 SNS サムネイルと共有表示受入

## 変更と範囲
- `assets/social-preview.png` は 1200×630 の固定紹介画像。実ゲームの `drawSmallEnemy` / `drawLargeEnemy` / `drawChestnutLoot` / `drawPlayer` を SVG recorder で描き出し、同じ背景色と弾を紹介用に再構成する。プレイヤーの画面・スコア・個人情報の画像ではない。
- 編集元 SVG / renderer は配信対象外。実行時は従来の単一 index.html と PNG のみ。生成は `node scripts/render-social-preview.cjs` の後、SVG 対応レンダラで PNG 化。生成用ソフトの追加課金・依存導入なし。
- OG/Twitter 画像・寸法・alt と、全15言語の紹介/今回結果に `#マロン飛行 #ゲーム制作` を追加。結果の波・スコア・レベル、名前非掲載を維持する。
- 独立コピーUIは追加しない。Xを開けない時だけ従来のコピーdialogを利用する。
- 採点・30波・強化・匿名/リタイア/監査モード送信条件・保存識別値・音声は変更しない。

## 検証
- 新しい metadata/15言語共有テストは変更前16失敗→変更後16成功。既存を含め67 unit、15言語97文字列、Pages検査を実行。
- `scripts/share-visual.cjs` は全HTTPを interception し、許可したHTML直接応答・ランキング取得mock・X intent mockのみ。その他abort、SW/WS遮断。スコア/開始送信試行0を必須とする。
- 15言語×縦横×home/resultで黒白X、44px、中心hit、全rectのviewport/overflow収容、文言、今回tap由来のfresh intent、blocked時コピー、結果不変を確認。display none / 親opacity0 / 部分clip のnegative対照を含む。画像はスクロールで操作を表示した位置の記録で、一画面への結果全収容を保証するものではない。
- 結果は名前空欄の開始後、波17/スコア184500/レベル8を固定して既存 `endGame(false)` から作る表示fixture。実戦の難易度検証とは区別し、既存 browser-smoke の操作/採点回帰は維持。
- 新browser検査/画像実見は branch CI 終端で確認してから Draft PR に記録。ここで事前に成功扱いにしない。

## 公開・復元
- 正式URL/共有URL `https://chameleonjp.codeberg.page/maron_hikou/` を維持。画像の GitHub URL は既存移行先の準備で、Codeberg反映・実験場切替・本番Xカード表示は別途未確認。
- 当作業branchだけ非本番検証triggerを追加。公開artifact/deployは従来default branch push限定。runner/権限/Pages設定を変更しない。
- 本人iPhone Safariの可聴/可視実機受入は未確認。マージ後は配信commit/PNG応答/縦横共有を確認。元へ戻す場合は今回差分revert PRで行い、利用者の保存情報は削除しない。
- リポジトリの利用不可モデル指定は2026-11-02本人承認により今回担当実装＋別担当独立reviewへ置換。指示ファイル自体は変更しない。
