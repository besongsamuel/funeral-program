# Memorial Website

A config-driven memorial and funeral website built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **AWS Amplify Gen 2** (Cognito, DynamoDB, S3, Lambda, Bedrock).

## Features

- **Public memorial site** with 7 primary navigation sections
- **Fully configurable** content via Amplify Data (DynamoDB)
- **Admin dashboard** at `/admin` for content management and Cognito-based settings
- **Family moderation** at `/moderate` — unlock with a shared 4-character code (no account)
- **AI memorial assistant** powered by Amazon Bedrock with tool-calling over memorial data
- **Mobile responsive** purple-and-white design with scroll animations
- **Demo mode** works without AWS — uses in-memory demo data

## Quick Start (Demo Mode)

```bash
# Requires Node.js 20+ (Amplify Gen 2 / CDK)
yarn install
yarn dev
```

Visit `http://localhost:5173`. Admin login at `/admin` with password `memorial-admin`.

## AWS Amplify Setup

Use the **aftermath** AWS named profile for every sandbox, backend, and hosting deployment in this project (`AWS_PROFILE=aftermath` or `--profile aftermath`).

### Prerequisites

- Node.js 20+ (22 recommended)
- AWS account with Amplify Gen 2 permissions
- Amazon Bedrock model access (Nova Lite or Claude Haiku)

### Deploy Backend

```bash
# Start Amplify sandbox (provisions Cognito, DynamoDB, S3, Lambda)
# Uses the aftermath AWS profile
yarn sandbox
```

This generates `amplify_outputs.json` which the frontend auto-loads.

### Seed Data

After the sandbox is deployed, copy the memorial content from `src/lib/demo-data.ts` into Amplify Data:

```bash
yarn seed
```

The public site then reads that data over the AppSync API key (no sign-in). Keep `yarn sandbox` running, or regenerate `amplify_outputs.json`, so the frontend can reach the backend.

### AI Assistant

After sandbox deploy, set the Lambda Function URL in `.env` if needed (also written to `amplify_outputs.json` as `custom.assistant_url`):

```
VITE_ASSISTANT_URL=https://your-function-url.lambda-url.region.on.aws/
```

### Family moderation code

The `/moderate` page uses a Lambda Function URL (`custom.moderation_url`) and two Amplify secrets:

```bash
# Exactly 4 uppercase alphanumeric characters (A–Z, 0–9), e.g. K7MQ
AWS_PROFILE=aftermath npx ampx sandbox secret set MODERATION_CODE

# Long random string used to sign session tokens
AWS_PROFILE=aftermath npx ampx sandbox secret set MODERATION_SESSION_SECRET
```

Then keep (or restart) `yarn sandbox` so the secrets are applied. Share the site URL `/moderate` and the 4-character code privately with family — it is not linked in the public nav.

Optional local override:

```
VITE_MODERATION_URL=https://your-moderation-function-url.lambda-url.region.on.aws/
```

### Amplify Hosting

Frontend hosting is connected to the `main` branch of this repo. Each push to `main` builds the Vite app and publishes it to Amplify Hosting.

Build settings live in `amplify.yml`:

- Node.js 22
- `yarn install --frozen-lockfile`
- `yarn build`
- Artifact directory: `dist`
- SPA routes rewrite to `index.html`

## Project Structure

```
amplify/
  auth/          Cognito + MemorialAdmin group
  data/          DynamoDB models via AppSync
  storage/       S3 buckets for media
  functions/     memorial-assistant, moderation-gate, tribute-guard
src/
  pages/         Public routes (including /moderate)
  admin/         Dashboard + auth guard
  components/    Layout, AI chat, UI
  lib/           Data service, demo data, types
```

## Navigation

| Route | Page |
|-------|------|
| `/` | Home |
| `/legacy` | Biography + Timeline |
| `/legacy/obituary` | Printable obituary |
| `/funeral` | Program + service details |
| `/funeral/livestream` | Livestream |
| `/gallery` | Photo albums |
| `/share-photos` | Guest photo uploads (moderated) |
| `/memories` | Stories, videos, music |
| `/tributes` | Condolences + guestbook |
| `/family` | Family tree |
| `/donations` | In Their Memory |
| `/moderate` | Family code moderation (private URL) |
| `/admin` | Superuser dashboard |

## Admin Dashboard

- **Profile** — memorial name, tagline, tribute
- **Content** — biography, funeral, gallery, etc.
- **Moderation** — approve/reject tributes and stories (Cognito)
- **Photos** — approve/reject guest photos (Cognito)
- **AI Assistant** — persona, quick questions, knowledge entries
- **Publish** — toggle site visibility

Family members who should only moderate submissions can use `/moderate` with the shared 4-character code instead of creating Cognito accounts.

With Cognito connected, sign in to `/admin` with an account in the `MemorialAdmin` group.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + Framer Motion
- AWS Amplify Gen 2 (Auth, Data, Storage, Functions)
- Amazon Bedrock Converse API
- TanStack React Query
- React Router v6
