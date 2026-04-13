# Karukasi — Memorial Video Generator

A full-stack web application that generates animated memorial videos of deceased loved ones using AI voice synthesis and talking photo technology.

## Overview

Users upload a photo and provide text to be spoken. The app generates a realistic talking video using ElevenLabs for voice synthesis and HeyGen's Talking Photo API. A 3-second preview is shown with a paywall; the full video is unlocked after payment via Stripe.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (DB + Storage) · ElevenLabs · HeyGen · Stripe · Resend

---

## Product Flow

1. User fills the creation form: photo, optional voice reference audio or preset voice, narration text, optional tone instructions
2. `POST /api/generate` runs the pipeline async: uploads to Supabase Storage → ElevenLabs TTS → HeyGen Talking Photo registration + video generation
3. Frontend polls `GET /api/jobs/[id]` every 5 seconds; the API lazily checks HeyGen status on each poll
4. Preview video displays with 3-second playback limit and paywall overlay
5. User pays via Stripe Checkout; `POST /api/webhooks/stripe` receives the event and triggers full video generation
6. Full video unlocks — same page, no redirect

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd karukasi
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values — see [Environment Variables](#environment-variables) below.

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Database → SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage** and create a new **public bucket** named `karukasi`
4. Copy your project URL and keys to `.env.local`

### 4. Set up Stripe

1. Create a product in the [Stripe Dashboard](https://dashboard.stripe.com) with a one-time price of R$79
2. Copy the **Price ID** (`price_...`) to `STRIPE_PRICE_ID`
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret printed by the CLI to `STRIPE_WEBHOOK_SECRET`.

In production, register `https://yourdomain.com/api/webhooks/stripe` as a webhook endpoint in the Stripe Dashboard, listening for `checkout.session.completed`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://abc.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key — safe to expose in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **never expose to browser** |
| `ELEVENLABS_API_KEY` | ElevenLabs API key from [elevenlabs.io](https://elevenlabs.io) |
| `HEYGEN_API_KEY` | HeyGen API key from [heygen.com](https://heygen.com) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` for development) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_ID` | Stripe Price ID for the R$79 memorial video product |
| `RESEND_API_KEY` | Resend API key for transactional email (optional for MVP) |
| `NEXT_PUBLIC_APP_URL` | Full public URL of the app (e.g. `https://karukasi.com`) |

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/generate` | Accepts form data, runs full pipeline, returns `{ job_id }` |
| `GET` | `/api/jobs/[id]` | Returns job status; lazily checks HeyGen for video completion |
| `POST` | `/api/checkout` | Creates Stripe Checkout Session; returns `{ url }` |
| `POST` | `/api/webhooks/stripe` | Handles `checkout.session.completed`; triggers full video generation |

---

## HeyGen Integration Notes

The HeyGen [Talking Photo API](https://docs.heygen.com/reference/talking-photo) requires two steps:

1. **Register the photo** — `POST /v2/talking_photo` with the photo URL. Returns a `talking_photo_id`. This is required before video generation.
2. **Generate video** — `POST /v2/video/generate` with the `talking_photo_id` and audio URL. Returns a `video_id`.
3. **Poll for completion** — `GET /v1/video_status.get?video_id={id}`. Karukasi uses lazy polling: each call to `GET /api/jobs/[id]` checks HeyGen status and updates the database automatically.

The video uses a 480×480 square format with the Karukasi brand background color (`#F7F4EF`).

---

## ElevenLabs Integration Notes

Two features are used:

- **Text-to-Speech** — `POST /v1/text-to-speech/{voice_id}` using the `eleven_multilingual_v2` model. Returns MP3 audio.
- **Instant Voice Cloning** — `POST /v1/voices/add` with a multipart form containing an audio sample. Returns a `voice_id`. Used only when the user uploads a voice reference file.

**Preset voices** (when no audio reference is uploaded):

| Gender | Age | Voice | ElevenLabs ID |
|---|---|---|---|
| Feminino | Jovem | Rachel | `21m00Tcm4TlvDq8ikWAM` |
| Feminino | Adulto | Bella | `EXAVITQu4vr4xnSDxMaL` |
| Feminino | Idoso | Dorothy | `ThT5KcBeYPX3keUtsaye` |
| Masculino | Jovem | Adam | `pNInz6obpgDQGcFmaJgB` |
| Masculino | Adulto | Antoni | `ErXwobaYiN019PkySvjV` |
| Masculino | Idoso | Arnold | `VR6AewLTigWG4xSOukaG` |

The generated audio is uploaded to Supabase Storage and reused for both the preview and the full video — ElevenLabs is called only once per job.

---

## Database Schema

The `jobs` table tracks processing state. See `supabase/schema.sql` for the full schema.

**Status flow:** `pending` → `processing_preview` → `preview_ready` → `processing_full` → `completed` | `failed`

No authentication is required. The `job_id` UUID serves as the access token — anyone with the URL can access their result.

---

## Running Tests

```bash
npm test           # run all tests
npm run test:watch # watch mode
npm run test:ci    # CI mode with --passWithNoTests
```

Tests use Jest + React Testing Library. All external API calls (Supabase, ElevenLabs, HeyGen, Stripe) are mocked.
