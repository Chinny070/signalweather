# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SignalWeather — a source-grounded, validator-consensus trust-climate registry built on GenLayer. The contract independently fetches public governance evidence, GenLayer validators assess bounded trust dimensions, and consensus produces an on-chain operational posture. There is no backend; all canonical state lives in the Intelligent Contract.

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (primitives only)
- **Contract**: Python, GenLayer Intelligent Contract (`contracts/signal_weather.py`)
- **SDK**: `genlayer-js@1.1.8` (pinned exact version)
- **Network**: GenLayer StudioNet, chain ID `61999`, RPC `https://studio.genlayer.com/api`
- **Animation**: Framer Motion (restrained, functional only)
- **Forms**: React Hook Form + Zod
- **Wallet**: Injected EVM wallet (no private key handling)

## Commands

```bash
npm install                  # install dependencies
npm run dev                  # start dev server (turbopack)
npm run build                # production build
npm run lint                 # lint
npx tsc --noEmit             # typecheck
```

## Architecture

### No backend rule

No Supabase, Firebase, Express, database, cron, private API, off-chain AI API, or indexer. The GenLayer contract is the sole source of truth. Local storage holds only UI preferences and unfinished form drafts.

### Contract design (`contracts/signal_weather.py`)

The contract uses `gl.vm.run_nondet_unsafe` with a custom leader/validator pair — not `prompt_non_comparative`. The leader fetches all registered source URLs via `gl.nondet.web.get()`, builds an evidence packet, runs a fixed assessment prompt, and returns canonical JSON. Each validator independently re-fetches, re-assesses, then compares **substantive fields** against the leader (climate, direction, posture, dimension states, coverage band, risk flags). LLM output is never compared with `strict_eq`. Prose differences are tolerated; structural disagreement on stable fields causes rejection.

Storage uses scalar counters + `TreeMap` fields with JSON strings for bounded nested records. No storage writes inside nondeterministic functions. No unsupported dynamic storage initialisation.

### Frontend data flow

All reads use `genlayer-js` read methods against the contract. All writes go through wallet-signed transactions with a full lifecycle UI: preparing → wallet confirmation → submitted → pending consensus → accepted/undetermined → explorer link. Never show "complete" after wallet submission alone.

### Route structure

Public: `/`, `/climates`, `/community/[communityId]`, `/community/[communityId]/epoch/[epochId]`, `/community/[communityId]/sources`, `/community/[communityId]/history`, `/community/[communityId]/policy`, `/assessment/[transactionHash]`, `/compare`, `/methodology`

Wallet-required: `/register`, `/manage/[communityId]`, `/manage/[communityId]/sources`, `/manage/[communityId]/epochs/new`, `/manage/[communityId]/challenge/[epochId]`

## Design system

### Palette

- Base: Obsidian Atmosphere `#080B10`, Deep Pressure `#101722`, Instrument Slate `#182231`, Fog Surface `#DDE4EA`, Cold White `#F5F8FA`
- Climate signals: Stable Cyan `#42D6C6`, Strengthening Blue `#5D8CFF`, Strained Amber `#E6A84A`, Eroding Vermilion `#F06A4F`, Fragile Magenta `#D35CFF`, Critical Red `#FF3B4E`, Inconclusive Grey `#82909D`
- Utility: Evidence Green `#6FE3A1`, Challenge Gold `#F3C969`, Consensus Violet `#8B7CFF`

### Typography

- Display: Instrument Serif (or similar editorial high-contrast serif)
- Interface: Geist Sans
- Data/hashes: IBM Plex Mono
- Do NOT use Inter as the primary brand font.

### Shape language

Atmospheric governance instrument aesthetic: long horizontal bands, clipped corners, inset measurement tracks, fine-grid backgrounds, thin crosshair dividers, minimal radius. No pill buttons, no glassmorphism, no generic rounded cards.

## Contract enums (canonical lowercase strings)

- **Climate**: stable, strengthening, strained, eroding, fragile, critical, inconclusive
- **Direction**: improving, unchanged, worsening, volatile, unknown
- **Posture**: normal, observe, heightened_review, cooldown, emergency
- **Coverage**: strong, adequate, thin, failed
- **Epoch status**: draft, collecting, assessment_pending, accepted, undetermined, challenged, reassessment_pending, superseded

## Critical rules

- The frontend NEVER calculates, invents, or overrides a climate verdict — only the contract via validator consensus
- Source sets are immutable once used by an epoch
- Fetched web content is untrusted data; prompts must include injection defences
- Source URLs: HTTPS only, no localhost/loopback/private IPs, bounded length
- User descriptions are context only, never proof
- `failed` evidence coverage forces `climate: inconclusive`
- `strengthening` requires defensible improvement vs previous epoch, not just acceptable current state
- First epoch uses `direction: unknown` with no comparative claims
- No fabricated community results in production
- Clearly separate preview, pending, accepted, and final states in the UI

## Environment variables

```
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
```
