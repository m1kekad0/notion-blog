---
description: .gitmessage テンプレートを使用して変更をコミットします
---

1. 現在の**ステージング済み（Staged）**の変更内容のみを確認します。未ステージングの変更は無視してください。
```bash
git diff --cached
```

2. `.gitmessage` ファイルの内容を読み取り、テンプレートと規約を確認します。
// turbo
3. **ステージングされた変更内容のみを対象に**、テンプレートに従ってコミットメッセージを50文字以内で生成し、コミットを実行します。
   `<type>(<scope>): <subject>`
   
   - type: feat, fix, docs, style, refactor, perf, test, chore
   - scope: 変更範囲（例: app, vercel, config等）
   - subject: 変更の要約（日本語）

```bash
git commit -m "生成されたメッセージ"
```