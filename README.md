OHJEET PROJEKTIN ALUSTAMISEEN OMALLE KONEELLE:

1. Tarkista, että homebrew asennettuna (mac). Jos ei katso netistä asennusohjeet terminaaliin (Google: homebrew)
2. Asenna node (brew install node)
3. Aseta git committien käyttämä nimi ja s-posti:
   git config --global user.name "Your Name"
   git config --global user.email "name@domain.example"
4. Yhdistä koneen SSH-avain githubiin (jos ei vielä ole). Netistä tai chatilta löytyy varmaan hyvät ohjeet.
5. git clone git@github.com:Kilppar1/my-area-info.git johonkin sopivaan kansiorakenteeseen.
6. Avaa projekti VSCodessa ja avaa sen sisällä terminaali: Aja (npm install)
7. Nyt pitäisi toimia muokkaaminen ja koodin puskeminen. Gittiä ihan mukava käyttää vscoden käyttöliittymästä vasemmalta.
   Nettisivun voi hostata lokaalisti (npm run dev) ja mennä osoitteeseen (http://localhost:3000)
8. Kun puskee mainiin muutokset ilmestyy vercelin kautta (https://my-area-info.vercel.app)

Bonus vscode extensioneita:

1. Prettier -code formatter (tallentaessa tekee koodista siistimpää)
2. ESLint (Antaa suosituksia javascript koodiin)

Jos haluaa kerrata gittiä niin tämä on ihan hyvä sivu:
https://learngitbranching.js.org

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
