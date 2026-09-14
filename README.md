# Memorial Website

A config-driven memorial and funeral website built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **AWS Amplify Gen 2** (Cognito, DynamoDB, S3, Lambda, Bedrock).

## Features

- **Public memorial site** with 7 primary navigation sections
- **Fully configurable** content via Amplify Data (DynamoDB)
- **Admin dashboard** at `/admin` for moderation, publishing, and AI settings
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

```bash
yarn seed
```

Follow the script output to create records in your Amplify Data tables matching `src/lib/demo-data.ts`.

### AI Assistant

After sandbox deploy, set the Lambda Function URL in `.env`:

```
VITE_ASSISTANT_URL=https://your-function-url.lambda-url.region.on.aws/
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
  functions/     memorial-assistant (Bedrock), tribute-guard
src/
  pages/         Public routes
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
| `/memories` | Stories, videos, music |
| `/tributes` | Condolences + guestbook |
| `/family` | Family tree |
| `/donations` | In Their Memory |
| `/admin` | Superuser dashboard |

## Admin Dashboard

- **Profile** — memorial name, tagline, tribute
- **Moderation** — approve/reject tributes and stories
- **AI Assistant** — persona, quick questions, knowledge entries
- **Publish** — toggle site visibility

With Cognito connected, sign in with an admin account in the `MemorialAdmin` group.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + Framer Motion
- AWS Amplify Gen 2 (Auth, Data, Storage, Functions)
- Amazon Bedrock Converse API
- TanStack React Query
- React Router v6
