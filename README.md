This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Requirements

- **Node.js >= 22.12.0** (Electron 44 and concurrently 10 require this baseline; `pnpm` with `engine-strict` will fail on older versions)
- pnpm workspace (`pnpm-lock.yaml`)

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

## Docker

Build and run the production container:

```bash
docker build -t blitz-renderer .
docker run -d --rm -p 7070:7070 --name blitz-renderer blitz-renderer
```

The `-d` flag runs the container in detached mode (background), so you can continue using your terminal.

To stop the container:
```bash
docker stop blitz-renderer
```

To view logs:
```bash
docker logs blitz-renderer
```

Or with Compose (also runs in detached mode):
```bash
docker compose up -d --build
```

Access the app at [http://localhost:7070](http://localhost:7070)

## Electron App Builds

The web app and Electron app are separate flows. Existing web scripts (`npm run dev`, `npm run build`, `npm run start`) still work as-is.

### Electron development

```bash
npm run electron:dev
```

This runs Next.js in dev mode and launches Electron against `http://127.0.0.1:3000`.

### Windows x86-64 build (unpacked app folder)

```bash
npm run electron:build:win
```

This generates:
- `build/icons/icon.ico` and `build/icons/icon.png`
- a production Next.js build
- `dist-electron/win-unpacked/Blitz Renderer.exe` (Windows x64 app)

### Windows x86-64 installer/distributable

```bash
npm run electron:dist:win
```

This generates installer artifacts in `dist-electron/` (for example NSIS and portable `.exe` outputs).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
