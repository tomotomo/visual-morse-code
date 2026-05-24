# Visual Morse Decoder

レトロ調の単一ページWebアプリで、モールス信号を視覚的に学習・練習できます。

## 概要

Visual Morse Decoder は、ボタンまたはキーボード入力で短点・長点を入力し、モールスツリー上の現在経路をリアルタイムにハイライトします。一定時間操作がないと、自動で文字を確定して出力します。

## 主な機能

- ボタン・キーボード入力による短点／長点の入力
- SVGベースのモールスツリーのリアルタイムハイライト
- 自動確定タイマーと進捗表示
- 入力・出力のクリア
- PC、タブレット、モバイル向けのレスポンシブ対応

## 開発プロセス

- [spec.md](spec.md) は Gemini 3.5 Flash で生成しました。
- [index.html](index.html) のコードは GitHub Copilot で生成しました。
- 人間は軽微なコード修正とUI調整のみを行いました。

## ローカルでの実行

このアプリは ES modules を使うため、ローカルサーバー経由で開くのが推奨です。[index.html](index.html) をブラウザで直接開くと、読み込みエラーが発生する場合があります。

### 推奨手順

1. Python でローカルサーバーを起動します。

```bash
python3 -m http.server 8000
```

2. ブラウザで次のURLを開きます。

```text
http://localhost:8000/
```

### 代替手段

別のローカルサーバーを使う場合も、同じく `http://localhost:8000/` の形式で開いてください。

## プロジェクトファイル

- [index.html](index.html) — UI、SVG描画、スタイル、操作ロジック
- [spec.md](spec.md) — 製品仕様および実装ガイダンス
- [adr01.md](adr01.md) — レスポンシブ設計のレビューと改善案

## ライセンス

このプロジェクトは MIT License の下で公開されています。

## 備考

このアプリは HTML、CSS、Vanilla JavaScript の単一ファイル静的Webアプリとして実装されています。

## 謝辞

本プロジェクトは、Dave Nathanson 氏（アマチュア無線のコールサイン: KG6ZJO）の「Morse Code Recieve Decoder Chart(a-z)」からインスピレーションを得て作成しました。視覚的な構造とモールス対応関係を考える上で、大変参考になりました。

情報のソース: https://www.reddit.com/r/codes/comments/jvmtdk/morse_code_chart_very_useful_resource/?tl=ja
