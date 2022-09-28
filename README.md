# mecab-segmenter

Segment Japanese sentence into chunks where line-break is appropriate.
Inspired from  [Budou](https://github.com/google/budou).

```sh
make pip

echo "テクノロジーの力であらゆる投資判断を支援する" | python -m src.segmenter
テクノロジーの
力で
あらゆる投資判断を
支援
する

echo "アナリストによる企業分析、ヘッジファンド出身者によるマーケットレビュー、企業IRからの情報など、ここでしか見られない高品質な情報を元に、投資アイデアのシミュレーションや交換ができます。" | python -m src.segmenter
アナリストに
よる
企業分析、
ヘッジファンド出身者に
よる
マーケットレビュー、
企業IRからの
情報など、
ここでしか
見られない
高品質な
情報を
元に、
投資アイデアの
シミュレーションや
交換が
できます。
```
