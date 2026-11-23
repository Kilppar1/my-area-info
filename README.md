PROJEKTIN ALUSTAMINEN OMALLE KONEELLE:

1. Asenna homebrew
2. Asenna node (brew install node)
3. Aseta git committien käyttämä nimi ja s-posti:
   git config --global user.name "Your Name"
   git config --global user.email "name@domain.example"
4. Yhdistä koneen SSH-avain GitHubiin (jos ei vielä ole).
5. git clone git@github.com:Kilppar1/my-area-info.git
6. Avaa projekti VSCodessa ja avaa sen sisällä terminaali: npm install
7. npm run dev (http://localhost:3000)
8. Vercel: (https://my-area-info.vercel.app)
9. Ensimmäisellä kerralla kun tekee git pull saattaa joutua asettamaan: git config pull.rebase false

Käytetyt VSCode extensionit:

1. Prettier -code formatter
2. ESLint

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
