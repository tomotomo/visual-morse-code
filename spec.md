# ソフトウェア仕様・設計書: visual-morse-code

本ドキュメントは、AIコード生成エージェント（GitHub Copilot等）が追加のコンテキストなしに実装を完了できるレベルを目標とした、単一ファイル（Single Page Application）構成のWebアプリケーション設計書である。

---

## 1. システム概要 (System Overview)

`visual-morse-code` は、モールス信号（短点「・」と長点「ー」）をボタン入力し、リアルタイムにデコーダーチャート（ツリー図）上で経路が発光・追跡され、入力が確定すると自動的にテキスト化される視覚的学習・エンターテインメントWebアプリケーションである。

### 主要機能

1. **モールス信号入力機能**: 「・（短点）」「ー（長点）」の2つの物理/画面ボタンによる入力。
2. **リアルタイム・パスハイライト機能**: 添付されたデコーダーチャートをWeb上に再現し、入力中の経路（ノードおよびエッジ）をネオン状に発光させる。
3. **自動文字確定（タイマー駆動）**: 入力後、一定時間（デフォルト: 1000ms）操作がない場合、現在位置の文字を自動確定してテキストボックスに出力。
4. **連続入力・編集機能**: 文字確定後も続けて入力が可能。「Clear」ボタンでテキストを全削除。
5. **レトロ・デザイン**: 1970〜80年代の電子計測器、あるいはCRTモニターを彷彿とさせる、黒背景にオールドグリーンの発光を基調としたUI。

---

## 2. 画面要件・レイアウト (UI/UX Layout)

画面はレスポンシブとし、PC/タブレット双方で操作しやすいよう、単一画面内にすべての要素を効率的に配置する。

```
+-----------------------------------------------------------+
|                  VISUAL MORSE DECODER                     |
+-----------------------------------------------------------+
|                                                           |
|  [ デコーダー・ツリー表示エリア (SVGによる描画) ]           |
|  * 5.1 モールス符号マッピングおよびツリー定義のトポロジーを完全再現 |
|  * 入力状態に合わせてリアルタイムにラインとノードが発光     |
|                                                           |
+-----------------------------------------------------------+
|  [ 現在の入力バッファ: ·-·  ]  [ 確定タイマー残量バー ]      |
+-----------------------------------------------------------+
|  [ 出力テキストボックス ]                                  |
|  >> HELLO WORLD_                                          |
+-----------------------------------------------------------+
|  [ コントロールパネル ]                                    |
|   +------------+   +------------+   +------------------+  |
|   |  ・ (Dot)  |   |  - (Dash)  |   |  Clear (Delete)  |  |
|   +------------+   +------------+   +------------------+  |
+-----------------------------------------------------------+

```

---

## 3. 機能要件詳細 (Functional Requirements)

### 3.1 入力処理

* **「・（Dot）」ボタン**: 現在の入力バッファ（文字列）の末尾に `.` を追加。
* **「ー（Dash）」ボタン**: 現在の入力バッファの末尾に `-` を追加。
* **キーボードショートカット**: 画面ボタンだけでなく、以下のキー入力にも対応する。
* `.` または `F` / `J` キー（押しやすさ考慮）: 短点「・」
* `-` または `D` / `K` キー: 長点「ー」
* `Space` キー: タイマーを待たずに即時文字を確定
* `Escape` または `Backspace` キー: Clear機能



### 3.2 リアルタイム・ハイライト（発光）ロジック

* 初期状態（バッファ空）では、「Start Here」のノードのみが微弱に発光。
* バッファに符号が追加されるたび、Startから該当する現在のノードまでの「経路（ライン）」および「通過したノード（文字）」、そして「現在地のノード」が強力に発光（ネオングリーン）する。
* バッファに対応する文字が存在しない（不適切な組み合わせ、または最大文字長超過）場合は、エラー状態としてバッファ表示が赤く点滅する。

### 3.3 自動確定タイマー

* ボタン押下（またはキー入力）のたびに、既存の確定用タイマー（`setTimeout`）をクリアし、新規にタイマーを始動。
* **タイムアウト時間**: 1000ms（1秒）。
* タイマー作動中は、UI上で視覚的に「確定までの残り時間」をプログレスバー等で表示する。
* タイマーが作動しきると、現在バッファにあるモールス符号に対応する文字を取得し、出力テキストボックスの末尾に追加。その後バッファをクリアし、ツリーのハイライトを初期状態に戻す。

### 3.4 クリア機能

* 「Clear」ボタン押下、または指定キーにより、出力テキストボックスの中身、現在の入力バッファ、タイマーのすべてを完全に初期化する。

---

## 4. 技術スタック・ファイル構成 (Tech Stack & Architecture)

開発の容易性とポータビリティを担保するため、単一のHTMLファイル（インラインCSS, JavaScript）として実装する。

* **言語**: HTML5, CSS3, JavaScript (ES6+)
* **外部ライブラリ**: 使用しない（純粋なVanilla JSおよび標準Web APIのみで実装）。
* **グラフィック描画**: **SVG (Scalable Vector Graphics)** をHTML内に埋め込み、DOM操作でクラスを切り替えることで発光アニメーションを制御する。

---

## 5. データ構造 (Data Structures)

デコーダーチャートを動的に構築、または探索・ハイライトするために、ツリー構造を表現するJSONオブジェクトを定義する。画像にあるアルファベットに加え、仕様要件である「数字」を5階層目に拡張して定義する。

### 5.1 モールス符号マッピングおよびツリー定義

```javascript
const morseTree = {
    id: "START", label: "★", type: "root", x: 400, y: 100,
    dot: {
        id: "E", label: "E", type: "dot", x: 300, y: 100,
        dot: {
            id: "I", label: "I", type: "dot", x: 200, y: 100,
            dot: {
                id: "S", label: "S", type: "dot", x: 120, y: 100, // 【リバランス】140 → 120 へ左シフト
                dot: { 
                    id: "H", label: "H", type: "dot", x: 70, y: 100, // 【連動修正】90 → 70
                    dot: { id: "5", label: "5", type: "dot", x: 20, y: 100 }, // 【連動修正】50 → 20
                    dash: { id: "4", label: "4", type: "dash", x: 70, y: 160 } // 【連動修正】90 → 70
                },
                dash: { id: "V", label: "V", type: "dash", x: 120, y: 240, dash: { id: "3", label: "3", type: "dash", x: 120, y: 320 } } // 【連動修正】140 → 120
            },
            dash: {
                id: "U", label: "U", type: "dash", x: 200, y: 180,
                dot: { id: "F", label: "F", type: "dot", x: 160, y: 180 }, // 【本丸修正】170 → 160 で左右に40pxずつの完璧なマージンを確保
                dash: { id: "_U", label: "", type: "dash", x: 200, y: 260, dash: { id: "2", label: "2", type: "dash", x: 200, y: 320 } }
            }
        },
        dash: {
            id: "A", label: "A", type: "dash", x: 300, y: 200,
            dot: {
                id: "R", label: "R", type: "dot", x: 340, y: 240,
                dot: { id: "L", label: "L", type: "dot", x: 340, y: 300 } 
            },
            dash: {
                id: "W", label: "W", type: "dash", x: 300, y: 340,
                dot: { id: "P", label: "P", type: "dot", x: 240, y: 340 },
                dash: {
                    id: "J", label: "J", type: "dash", x: 300, y: 440,
                    dash: { id: "1", label: "1", type: "dash", x: 300, y: 520 }
                }
            }
        }
    },
    dash: {
        id: "T", label: "T", type: "dash", x: 500, y: 100,
        dot: {
            id: "N", label: "N", type: "dot", x: 500, y: 200,
            dot: {
                id: "D", label: "D", type: "dot", x: 500, y: 340,
                dot: { id: "B", label: "B", type: "dot", x: 500, y: 440, dot: { id: "6", label: "6", type: "dot", x: 500, y: 520 } },
                dash: { id: "X", label: "X", type: "dash", x: 560, y: 340 }
            },
            dash: {
                id: "K", label: "K", type: "dash", x: 460, y: 240,
                dot: { id: "C", label: "C", type: "dot", x: 460, y: 300 }, 
                dash: { id: "Y", label: "Y", type: "dash", x: 410, y: 240 } 
            }
        },
        dash: {
            id: "M", label: "M", type: "dash", x: 600, y: 100,
            dot: {
                id: "G", label: "G", type: "dot", x: 600, y: 180,
                dot: { id: "Z", label: "Z", type: "dot", x: 600, y: 260, dot: { id: "7", label: "7", type: "dot", x: 600, y: 320 } },
                dash: { id: "Q", label: "Q", type: "dash", x: 660, y: 180 }
            },
            dash: {
                id: "O", label: "O", type: "dash", x: 700, y: 100,
                dot: { id: "_O1", label: "", type: "dot", x: 700, y: 180, dot: { id: "8", label: "8", type: "dot", x: 700, y: 240 } },
                dash: {
                    id: "_O2", label: "", type: "dash", x: 780, y: 100,
                    dot: { id: "9", label: "9", type: "dot", x: 780, y: 180 },
                    dash: { id: "0", label: "0", type: "dash", x: 840, y: 100 }
                }
            }
        }
    }
};

```

*※注: 座標 `x`, `y` は添付画像のレイアウト・トポロジーを基準に、5階層目の数字（1〜0）を破綻なくマッピングできるように拡張したサンプル値である。実装時に適宜調整すること。*

---

## 6. 主要ロジック・アルゴリズム (Core Logic & Algorithms)

### 6.1 ツリー探索とハイライトロジック

入力バッファ（例： `.-.`）をパースし、ツリー構造をルートから探索する。

```javascript
let currentPath = ""; // 入力中のモールス文字列バッファ

function updateVisualization() {
    // 1. すべてのノード、エッジのハイライトクラス (.active) を一端削除
    document.querySelectorAll('.node, .edge').forEach(el => el.classList.remove('active'));
    
    // 2. ルートをアクティブにする
    document.getElementById('node-START').classList.add('active');
    
    let currentNode = morseTree;
    let valid = true;
    
    // 3. 入力バッファを一文字ずつ辿る
    for (let i = 0; i < currentPath.length; i++) {
        const symbol = currentPath[i];
        const nextNode = symbol === '.' ? currentNode.dot : currentNode.dash;
        
        if (nextNode) {
            // エッジ（線）のIDを "edge-[親ID]-[子ID]" と定義してハイライト
            const edgeId = `edge-${currentNode.id}-${nextNode.id}`;
            const edgeEl = document.getElementById(edgeId);
            if (edgeEl) edgeEl.classList.add('active');
            
            // ノードをハイライト
            const nodeEl = document.getElementById(`node-${nextNode.id}`);
            if (nodeEl) nodeEl.classList.add('active');
            
            currentNode = nextNode;
        } else {
            valid = false;
            break;
        }
    }
    
    // 4. 不正な入力（ツリーに存在しないパス）の場合の処理
    const inputDisplay = document.getElementById('input-buffer');
    if (!valid) {
        inputDisplay.classList.add('error');
    } else {
        inputDisplay.classList.remove('error');
    }
}

```

---

## 7. スタイリング・デザインガイドライン (Styling & Design Guidelines)

「レトロ・電子計測器」テーマを実現するための、具体的なCSSプロパティ指針。

### 7.1 カラーパレット

* **背景色 (`background-color`)**: `#0a0f0d` (極めて深い黒緑)
* **ベーステキスト / 非アクティブ要素**: `#1b4332` (沈んだダークグリーン)
* **アクティブ・発光色 (`color`, `stroke`, `fill`)**: `#52b788` または `#00ff88` (鮮烈なネオングリーン)
* **警告・エラー色**: `#ff3333` (ネオンレッド)

### 7.2 特殊エフェクト (レトロギミック)

1. **CRT走査線エフェクト**: 画面全体、あるいは出力テキストボックスに、微細なグラデーションのオーバーレイをかけ、昔のブラウン管モニターを再現する。
2. **ブルーム（発光）効果**: `.active` クラスが付与された要素に対し、`box-shadow` や SVGの `filter="url(#glow)"` （`feGaussianBlur`）を適用し、眩しい光を表現する。

```css
/* 発光エフェクトのCSS例 */
.node {
    fill: #0a0f0d;
    stroke: #1b4332;
    stroke-width: 3px;
    transition: all 0.2s ease;
}

.node.active {
    stroke: #00ff88;
    fill: #00ff88;
    filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.8));
}

.edge {
    stroke: #1b4332;
    stroke-width: 2px;
    fill: none;
    transition: all 0.2s ease;
}

.edge.active {
    stroke: #00ff88;
    stroke-width: 4px;
    filter: drop-shadow(0 0 6px rgba(0, 255, 136, 0.6));
}

/* タイマープログレスバーのレトロ表現 */
.progress-bar {
    width: 100%;
    height: 4px;
    background-color: #1b4332;
}
.progress-fill {
    height: 100%;
    background-color: #00ff88;
    width: 0%;
    transition: width 1s linear;
}

```

---

## 8. AIエージェントへの実装指示手順 (Implementation Steps for Copilot)

1. **基本HTML構造の構築**: 上記レイアウトに準拠した基本構造、出力用 `<textarea>`、ボタン3種、およびSVG描画エリアを定義せよ。
2. **SVG生成ロジックの実装**: `morseTree` データ構造を再帰的に走査し、初期化時にすべてのノード（`circle` または `rect`）と、それらを繋ぐエッジ（`line` または `path`）を動的にSVG内へ描画するスクリプトを作成せよ。その際、長点（dash）の経路には添付画像のように太いバー（`rect`）の視覚表現を挟むこと。
3. **イベントハンドラの実装**: ボタン、およびキーボードの入力を検知し、`currentPath` バッファを更新するロジックを組め。
4. **タイマー制御と確定ロジックの実装**: 入力毎にタイマーをリセットし、1000ms後に `currentPath` を文字にデコードしてテキストエリアに追記する仕組みを完成させよ。
5. **CSSのブラッシュアップ**: 前述のレトロなカラーパレットと発光エフェクトを適用し、極めてビジュアルクティの高いUIに仕上げよ。
