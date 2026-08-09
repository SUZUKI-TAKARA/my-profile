# Week11 AIと考えたログ

## Part 1：AIと考えた1セッション

### テーマ
ジャバスクリプトのコードについて

### 送った指示（良いプロンプトの型）

目的:buttonを押したときに動作するようにコードを書きたい
前提:buttonが動作するようにどこに何を書いたらよいのか、どの順序で書いたらよいのかがよくわからない。
見てほしい観点:今かけているコードの正誤と、どこからIDなどを引っ張ってくるべきか
制約:答えは完全には教えないでほしい。しかしわかりやすく答えにたどりつけるように考え方の道筋を教えてほしい。また書くコードがどのような役割を持つのかも詳しく教えてほしい。
出力形式:コードを書きつつ、その説明の併記するように出力してほしい。

### 返ってきた出力（要約）

もちろんです。今のコードは**かなりいいところまでできています**。
特に、

* `calcBmi()` を作って計算部分を分離している
* `getJudgment()` を作って判定部分を分離している
* `button.addEventListener("click", ...)` でボタンを監視している
* `input` の値を `.value` から取得している
* `Number()` で数値に変換している
* 入力値のチェックもしている

ここまでは正しいです。

今足りないのは、かなりシンプルに言うと、

> **「計算したBMI」と「判定結果」を、最後にHTMLのどこへ表示するか**

です。

完全な答えは出さずに、**どこから何を持ってきて、どの順番で処理するのか**を整理してみましょう。

---

# まず、buttonを押したときに何が起きるのか

今回やりたい処理を日本語にすると、こうです。

```text
① 「計算する」ボタンを押す
        ↓
② 身長をHTMLから取得
        ↓
③ 体重をHTMLから取得
        ↓
④ 入力値が正しいか確認
        ↓
⑤ BMIを計算
        ↓
⑥ BMIから「痩せ型・普通・肥満」を判定
        ↓
⑦ 計算結果をHTMLに表示
```

実は、あなたのコードは①〜⑤の途中までできています。

---

# ① ボタンを押したことを検知する

ここはあなたがすでに書けています。

```js
const button = document.querySelector("#calcBtn")
```

HTMLを見ると、

```html
<button id="calcBtn">
    計算する
</button>
```

となっていますよね。

つまり、

```js
document.querySelector("#calcBtn")
```

は、

> HTMLの中から `id="calcBtn"` を持っている要素を探してください

という意味です。

そして、

```js
button.addEventListener("click", () => {
    
});
```

で、

> `button` がクリックされたら、この `{ }` の中の処理を実行してください

となります。

つまり、

```js
button.addEventListener("click", () => {
    // ボタンを押した後にやりたい処理
});
```

この中が**今回のメイン処理を書く場所**です。

---

# ② 身長をどこから持ってくる？

ここもできています。

HTMLを見ると、

```html
<input id="height" type="number">
```

となっています。

だから、

```js
document.querySelector("#height")
```

でこのinputを取得できます。

そして、

```js
.value
```

をつけると、**inputに入力されている値**を取得できます。

なので、

```js
document.querySelector("#height").value
```

は、

> `id="height"` のinputに現在入力されている値

です。

あなたはそれを、

```js
const height = Number(document.querySelector("#height").value);
```

としているので、これもOKです。

---

# ③ 体重も同じ

HTMLでは、

```html
<input type="number" id="weight">
```

ですね。

したがって、

```js
document.querySelector("#weight").value
```

で体重の入力値を取得できます。

あなたの、

```js
const weight = Number(document.querySelector("#weight").value);
```

も正しいです。

---

# ここで「IDはどこから持ってくるの？」を整理

ここは今後かなり重要なので覚えておいてください。

HTMLに、

```html
<input id="height">
```

と書いたなら、JavaScriptでは、

```js
document.querySelector("#height")
```

で取得します。

---

### HTML → JavaScript

```html
<input id="height">
```

↓

```js
document.querySelector("#height")
```

---

例えば、

```html
<p id="result">計算結果</p>
```

なら、

```js
const result = document.querySelector("#result");
```

です。

だからあなたの、

```js
const result = document.querySelector("#result")
```

も正しいです。

---

# ④ 入力値をチェックする

ここもあなたはできています。

```js
if(height <= 0 || weight <= 0) {

    result.textContent = "身長体重を入力してください";
    return;
}
```

この意味は、

```text
身長が0以下
または
体重が0以下
```

なら、

```js
result.textContent = "身長体重を入力してください";
```

として、HTMLの

```html
<p id="result">計算結果</p>
```

を書き換えています。

`textContent` は、

> HTML要素の中に入っている文字を書き換える

ためのものです。

例えば、

```js
result.textContent = "こんにちは";
```

なら、

```html
<p id="result">こんにちは</p>
```

のような状態になります。

---

# ⑤ BMIを計算する

ここもできています。

あなたが作った、

```js
function calcBmi (height, weight)  {
    const heightM = height / 100;
    return weight / (heightM * heightM);
}
```

は、

```text
cm → mに変換
↓
BMIを計算
↓
計算結果を返す
```

という関数です。

そして、

```js
const bmi = calcBmi(height,weight);
```

によって、

```text
height
weight
 ↓
calcBmi()
 ↓
BMI
 ↓
bmiという変数に保存
```

となっています。

ここもOKです。

---

# では、今どこで止まっている？

ここです。

```js
const bmi = calcBmi(height,weight);

});
```

つまり現在、

```text
身長取得
↓
体重取得
↓
入力チェック
↓
BMI計算
↓
終了
```

になっています。

せっかく、

```js
const bmi = calcBmi(height,weight);
```

でBMIを計算したのに、

**そのBMIをどこにも表示していません。**

さらに、せっかく作った

```js
function getJudgment (bmi) {
    if (bmi < 18.5){
        return "痩せ型";
    } else if (bmi < 25){
        return "普通";
    } else {
        return "肥満";
    }
}
```

も、まだ呼び出していません。

---

# ここから自分で考えてみよう

今、

```js
const bmi = calcBmi(height,weight);
```

までできています。

次にやることは、

> 「このBMIを `getJudgment()` に渡したらどうなる？」

です。

あなたが作った関数は、

```js
function getJudgment (bmi) {
    ...
}
```

ですよね。

つまり、この関数は**BMIを受け取る関数**です。

そこで、

```js
const judgment = ???;
```

という形で、

**「getJudgmentに今計算したbmiを渡して、その結果をjudgmentに保存する」**

という処理を考えてみてください。

ヒントは、

```js
getJudgment(？？？)
```

の `？？？` に何を入れればいいか、です。

---

# ⑥ 判定結果を表示する

ここが最後のポイントです。

HTMLにはすでに、

```html
<p id="result" class="...">
    計算結果
</p>
```

があります。

そしてJavaScriptですでに、

```js
const result = document.querySelector("#result")
```

として取得しています。

ということは、

```js
result.textContent = ???;
```

を使えば、ここに結果を表示できます。

例えば、

```js
result.textContent = "何かの文字";
```

とすれば、

```html
<p id="result">
    何かの文字
</p>
```

という状態になります。

---

# 「BMI」と「判定」の2つをどう表示する？

ここは自分で考えてほしい部分です。

最終的には例えば、

```text
BMI：22.5
判定：普通
```

のようにしたいですよね。

そのためには、

```js
result.textContent = ???;
```

の `???` に、

**BMIの値と判定結果の両方を組み合わせた文字列**

を入れることになります。

ここではヒントとして、

```js
`BMI：${bmi}`
```

という書き方を調べてみてください。

これはJavaScriptの**テンプレートリテラル**という書き方です。

---

# 今のコードを「完成直前」にすると

あえて最後の答えは埋めずに、流れだけ示すとこうなります。

```js
function calcBmi(height, weight) {
    const heightM = height / 100;
    return weight / (heightM * heightM);
}

function getJudgment(bmi) {
    if (bmi < 18.5) {
        return "痩せ型";
    } else if (bmi < 25) {
        return "普通";
    } else {
        return "肥満";
    }
}

// HTMLから要素を取得
const button = document.querySelector("#calcBtn");
const result = document.querySelector("#result");

// ボタンをクリックしたとき
button.addEventListener("click", () => {

    // ① 身長を取得
    const height = Number(
        document.querySelector("#height").value
    );

    // ② 体重を取得
    const weight = Number(
        document.querySelector("#weight").value
    );

    // ③ 入力チェック
    if (height <= 0 || weight <= 0) {
        result.textContent = "身長体重を入力してください";
        return;
    }

    // ④ BMIを計算
    const bmi = calcBmi(height, weight);

    // ⑤ BMIから判定を取得
    const judgment = /* ここを考える */;


    // ⑥ 結果をHTMLに表示
    result.textContent = /* ここを考える */;

});
```

あなたが考えるべきところは、実質この2か所です。

---

## 考えるポイント①

```js
const judgment = /* ここ */;
```

`getJudgment()` は何を受け取る関数でしたか？

```js
function getJudgment(bmi)
```

なので、

```js
getJudgment(？？？)
```

の `？？？` には何を入れるべきでしょう？

**今計算したBMIは、どの変数に入っていますか？**

---

## 考えるポイント②

```js
result.textContent = /* ここ */;
```

ここでは、

```text
BMI：○○
判定：○○
```

という文字を作って入れればOKです。

そのとき、

```js
bmi
```

と

```js
judgment
```

の2つを使うことになります。

---

# ちなみに、今のコードで1つだけ直しておきたいこと

ここです。

```js
const button = document.querySelector("#calcBtn")
const result = document.querySelector("#result")
```

文法上は動きますが、個人的には、

```js
const button = document.querySelector("#calcBtn");
const result = document.querySelector("#result");
```

のように `;` を付ける書き方をおすすめします。

ただし、**セミコロンがないことが今回の動かない原因ではありません。**

---

## 全体を図にするとこうです

```text
HTML
│
├─ id="height" ─────→ 身長を取得
│
├─ id="weight" ─────→ 体重を取得
│
├─ id="calcBtn" ────→ ボタンが押されたことを検知
│
└─ id="result" ─────→ 結果を表示
                       ↑
                       │
              JavaScriptで書き換える
                       ↑
                       │
              BMIを計算 → 判定する
```

なので、**「IDをどこから持ってくるのか」**については、

> JavaScript側でIDを勝手に作るのではなく、**HTMLに自分で付けた `id` をJavaScriptの `querySelector("#ID名")` で取得する**

と考えるとかなり分かりやすいです。

そして今回のコードの順番は、

```text
HTMLでIDを付ける
 ↓
JSでHTML要素を取得
 ↓
クリックイベントを設定
 ↓
入力値を取得
 ↓
入力チェック
 ↓
計算
 ↓
判定
 ↓
resultを書き換える
```

です。

**まずは上の「完成直前コード」の `⑤` と `⑥` の2か所を自分で埋めてみてください。**
そこまでできれば、今回のBMI計算ボタンはほぼ完成です。


### "なぜ"を聞いた記録

- 聞いたこと:uttonが動作するようにどこに何を書いたらよいのか、どの順序で書いたらよいのかがよくわからない。
- 返ってきた説明（要約）:今回のコードは、BMI計算の基本的な構造ができています。`querySelector()`でHTMLのIDを指定して要素を取得し、`addEventListener("click", ...)`でボタンが押されたときの処理を書きます。処理の順番は、①身長・体重を`.value`で取得、②`Number()`で数値化、③入力値をチェック、④`calcBmi()`でBMIを計算、⑤`getJudgment()`にBMIを渡して「痩せ型・普通・肥満」を判定、⑥`result.textContent`で結果をHTMLに表示、です。現在のコードは①〜④までほぼ完成しています。残っているのは、計算した`bmi`を`getJudgment(bmi)`に渡して判定結果を変数に保存することと、`result.textContent`を使ってBMIと判定結果を表示することです。IDはHTML側で付けたものをJavaScriptから`#ID名`で取得します。

- 聞く前は分からなかったが、聞いて分かったこと:`BMI：${bmi}`→JavaScriptのテンプレートリテラルという書き方。

### 出力の4分類

| 分類 　　| 内容 　　　　　　　　　　　　　　　　　　　　　　　　　|判断理由 |

| 採用する |const button = document.querySelector("#calcBtn")
　　　　　　const result = document.querySelector("#result")　　| 必要なIDを取得するために必要だ　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　から
| 保留する | JavaScriptのテンプレートリテラルという書き方。　　　　|カリキュラムの中に書いていない書　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　き方であるから |
| 採用しない | |<input id="height" type="number" required> 　　|今回はJavascriptの中でかくにんし　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　ているから
| 要確認 　| JavaScriptのテンプレートリテラルという書き方。　　　　|カリキュラムの中に書いていない書　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　き方であるから | |

---

## Part 2：流された場面の振り返り

WEEK6のPOSSE課題においてscript内に書く内容がわからないときにAIに聞いてなんとなく流してしまった。

---

## Part 3：今後のAI利用方針

### Week11で気づいたこと

今回のWEEKではどのようにＡＩに聞くべきか詳しく学ぶことができた。ＡＩに投げることが今までも何度かあったが、その時は理解したと思っていても、深い理解になったいないことを今回改めて気が付くことができた。ＡＩに投げること自体は悪ではないので、使い方を考えて活用していきたい。
### 自分のAI利用ルール

具体的にプロンプトを書く。
答えだけ聞くような質問の仕方はしない。
コードを一つ一つ言葉で解説できるレベルまで学習する。