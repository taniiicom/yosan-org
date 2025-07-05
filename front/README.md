This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Firebase / Firestore 設定

このアプリではユーザー認証とデータ保存に Firebase を使用します。実行前に次の手順を行ってください。

1. Firebase プロジェクトを作成し、Authentication で **Google** と **Twitter** のログイン方法を有効化します。
2. Cloud Firestore を有効化して `budgets` コレクションを作成します。
3. セキュリティルールを以下のように設定します。

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /budgets/{id} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

4. プロジェクトルートの `.env.example` を `.env` にコピーします。
5. Firebase コンソールの **プロジェクト設定** → **全般** で Web アプリを登録し、表示される **Firebase SDK snippet** の `config` オブジェクトから各種キーを取得して `.env` に記入します。これらの API キーは公開されても問題ありませんが、Firestore のルールで適切にアクセス制限を行ってください。
