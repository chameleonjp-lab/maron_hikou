# スマホ操作対策チェックリスト

## 1. viewport

`index.html` には、スマホ向けのviewport設定を入れる。

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

ピンチズームを禁止する場合は、ゲーム仕様に理由を書く。

## 2. 横スクロール

- `html, body { overflow-x: hidden; }`
- 画面幅を超える固定幅を使わない
- `100vw` の使いすぎに注意する

## 3. 長押しと選択

ゲーム中の操作領域では、次を検討する。

```css
.game-area {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: none;
}
```

ただし、リンクや入力欄まで押せなくしない。

## 4. タップ操作

- 連打時に二重送信しない
- ボタンは指で押しやすくする
- 画面下部のボタンがブラウザUIに隠れないようにする
- `safe-area-inset-bottom` を必要に応じて使う

## 5. ゲーム中スクロール

ゲーム中にページ全体が動くと遊びにくい。
ゲーム領域では `touchmove` の扱いを確認する。

## 6. 2本指操作

2本指操作を使うゲームでは、誤作動を防ぐ。
使わないゲームでは、2本指操作時の挙動を確認する。

## 7. 実機確認

最低限、次を確認する。

- iPhone SE級サイズ
- iPhone 17 Pro
- iPhone 11 Pro
- iPad Pro 2018
