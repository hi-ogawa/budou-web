# mecab-segmenter

Segment Japanese sentence into chunks where line-break is appropriate.
Inspired from [Budou](https://github.com/google/budou).

```sh
# install dependency
make pip

# test as cli
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

# run flask server
make dev

# test with curl
curl http://127.0.0.1:5000/segment --data-binary 'テクノロジーの力であらゆる投資判断を支援する'
{"details":[{"label":"普通名詞","pos":"名詞","token":"テクノロジー"},{"label":"格助詞","pos":"助詞","token":"の"},{"label":"普通名詞","pos":"名詞","token":"力"},{"label":"格助詞","pos":"助詞","token":"で"},{"label":null,"pos":"連体詞","token":"あらゆる"},{"label":"普通名詞","pos":"名詞","token":"投資"},{"label":"普通名詞","pos":"名詞","token":"判断"},{"label":"格助詞","pos":"助詞","token":"を"},{"label":"普通名詞","pos":"名詞","token":"支援"},{"label":"非自立可能","pos":"動詞","token":"する"}],"result":["テクノロジーの","力で","あらゆる投資判断を","支援","する"]}

# deploy
make deploy/production
curl https://mecab-hiro18181.vercel.app/segment --data-binary 'テクノロジーの力であらゆる投資判断を支援する'
```
