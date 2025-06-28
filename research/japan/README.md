## データ抽出の方法

1. reference から取得

- https://www.mof.go.jp/policy/budget/budger_workflow/budget/fy2025/fy2025.html
  - 予算成立 > 令和 7 年 3 月 31 日 令和 7 年度予算（衆議院修正+参議院修正後）
- https://www.bb.mof.go.jp/archive/reiwa7.html

  - 予算書関連情報 > 令和 7 年度予算書関連情報 > 当初予算 [第 217 回(常会)] > 一般会計 > 第 217 回（常会）成立（衆議院及び参議院修正後） > xml

- https://www.bb.mof.go.jp/server/2025/html/202511001Main.html

  - (左上) 全画面表示

- https://www.bb.mof.go.jp/server/2025/xml/202511001000041a.xml#p41

  - (右クリック) > Save As... > shift_jis.xml

- license: https://www.bb.mof.go.jp/terms/

2. shift_jis -> utf8 変換

```bash
brew install nkf          # 未導入なら
nkf -g shift_jis.xml      # 推定文字コードを確認
nkf -w --fb-skip shift_jis.xml > utf8.xml
sed -i '' '1s/Shift_JIS/UTF-8/I' utf8.xml
```

```md
`charset=unknown-8bit` と出る場合, ファイル内に **Shift_JIS の範囲外 (CP932 専用絵文字や制御コードなど)** が混じっている可能性が高いです.
以下では, まず原因バイトを特定し, 安全に UTF-8 化する手順を示します.

---

## 1. nkf で自動判定 → 変換

'''bash
brew install nkf # 未導入なら
nkf -g shift_jis.xml # 推定文字コードを確認
nkf -w --fb-skip shift_jis.xml > utf8.xml
'''

- `-g` は推定表示だけ
- `-w` が UTF-8 出力
- `--fb-skip` で「化けたバイト」を捨てる
- 完全性が重要なら, 後述 2-B で場所を特定して修正

---

## 2. iconv を使いたい場合

### 2-A. まず CP932 を明示指定

'''bash
iconv -f cp932 -t utf-8 shift_jis.xml > utf8.xml
'''

macOS の iconv は `shift_jis` より `cp932` の方が当たりやすいです. それでも `Illegal byte sequence` なら 2-B へ.

### 2-B. 不正バイト位置を洗い出す

'''bash
perl -MEncode -ne '
eval { decode("cp932", $_, Encode::FB_CROAK) };
  if ($@) { print "$ARGV:$.:$@\n" }
' shift_jis.xml
'''

- 行番号と原因を表示
- 出力された行をエディタで開き,

  - 0x00–0x1F など制御文字を削除
  - CP932 拡張絵文字を実体参照 `&#xE63E;` に書き換え

修正後, 再度 2-A を実行.

---

## 3. XML 宣言を書き換える

'''bash
sed -i '' '1s/Shift_JIS/UTF-8/I' utf8.xml
'''

- macOS の `-i ''` はインプレース
- `/I` で大文字小文字両対応

---

## 4. 最終チェック項目

- 外部 DTD や XSL に `encoding="Shift_JIS"` が残っていないか
- 改行コードが CRLF のままなら `dos2unix utf8.xml`
- ファイルを VS Code などで開き, 文字化けが無いことを確認

---

### ワンライナーで済ませる場合

'''bash
nkf -w --fb-skip shift_jis.xml | \
sed '1s/Shift_JIS/UTF-8/I' > utf8.xml
'''

これでほとんどの Shift_JIS 系 XML は安全に UTF-8 へ変換できます.
```

3. xml -> json 変換

LLM で変換

- prompt

```txt
- 添付の歳出データを正しく json ファイルにしてください
- json は，所管 → 組織 → 項 → 金額(千円) の順のネスト形式にしてください
```

e.g.

![](./media/img0.png)

```md
要求に基づき, 所管 → 組織 → 項 → 金額(千円) の順に入れ子にした json を生成しました.
完成したファイルは次のリンクからダウンロードできます.

[saishutsu_2025.json をダウンロード](sandbox:/mnt/data/saishutsu_2025.json)

組織が存在しない行は, 組織キーを空文字列 "" にしています.
内容の冒頭をご参考までに抜粋します.

'''json
{
"皇室費": {
"": {
"内廷費": 324000,
"宮廷費": 10812228,
"皇族費": 235765,
"計": 11371993
}
},
"国会": {
"衆議院": {
"衆議院": 65938926,
"衆議院施設費": 2167353,
"衆議院予備経費": 7000,
"計": 68113279
},
"参議院": {
"参議院": 41667748,
"参議院施設費": 1065200,
"参議院予備経費": 5000,
"計": 42737948
},
"国立国会図書館": {
"国立国会図書館": 19315137,
"国立国会図書館施設費": 1110563,
"計": 20425700
},
"裁判官訴追委員会": {
"裁判官訴追委員会": 140916
},
"裁判官弾劾裁判所": {
"裁判官弾劾裁判所": 120389
}
},
...
}
'''

ご確認ください. 不備や追加のご要望がありましたら, いつでもお知らせください.
```

4. a
