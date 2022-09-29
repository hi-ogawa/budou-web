# app

```sh
# development
pnpm i
npm run dev

# deploy
vercel --version # Vercel CLI 25.2.3
vercel projects add line-break-segmenter-hiro18181
vercel link -p line-break-segmenter-hiro18181
npm run deploy:production

# test
curl http://localhost:3333/api/segment --data-binary 'テクノロジーの力であらゆる投資判断を支援する'
curl https://line-break-segmenter-hiro18181-hiogawa.vercel.app/api/segment --data-binary 'テクノロジーの力であらゆる投資判断を支援する'
```
