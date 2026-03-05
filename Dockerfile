FROM node:22-alpine

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# package.json と lock ファイルを先にコピーして依存関係をインストールしキャッシュを効かせる
COPY package.json pnpm-lock.yaml* ./

# pnpm で依存関係をインストール
RUN pnpm install

# 開発用サーバを立ち上げるデフォルトのコマンド
CMD ["pnpm", "dev"]
