import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.notion.so" },
      { protocol: "https", hostname: "www.notion.so" },
      { protocol: "https", hostname: "prod-files-secure.s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "s3.us-west-2.amazonaws.com" },
    ],
  },
  // 記事詳細ページに明示的な Cache-Control を設定する。
  // s-maxage=300: Cloudflare Edge CDN は 300 秒を超えてキャッシュしない
  // stale-while-revalidate=0: 古いキャッシュを提供しない（ISR の stale-while-revalidate を無効化）
  // これにより Notion S3 署名付き画像 URL（有効期限 約 1 時間）が
  // キャッシュ経由で失効した状態で配信されることを防ぐ。
  async headers() {
    return [
      {
        source: "/blog/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=300, stale-while-revalidate=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
