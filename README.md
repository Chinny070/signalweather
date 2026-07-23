# SignalWeather

**The on-chain trust climate for internet communities.**

SignalWeather is a GenLayer-powered trust-climate registry that turns independently verifiable public governance evidence into a shared on-chain operational posture.

## Product Thesis

For every assessment period (trust epoch), the contract independently fetches public evidence from approved community and governance sources. GenLayer validators then judge whether the community's trust climate is stable, strengthening, strained, eroding, fragile, critical, or inconclusive. The accepted result becomes an on-chain operational posture that governance teams, treasury operators and community tooling can rely on.

## Why GenLayer Is Necessary

The underlying evidence may be factual, but the final question is subjective: does this combination of participation decline, unresolved conflict, procedural inconsistency and contributor behaviour indicate a stable or fragile trust climate?

- A normal deterministic contract cannot interpret ambiguous social evidence
- A single off-chain LLM could answer, but no affected party should have to trust one model or operator
- GenLayer validators independently fetch the same sources, independently assess, and reach consensus on stable decision fields

## Architecture

```
┌─────────────┐      ┌──────────────────────┐      ┌───────────────┐
│  Next.js 15  │─────▶│  genlayer-js@1.1.8   │─────▶│  StudioNet    │
│  App Router  │      │  Read/Write Client   │      │  Chain 61999  │
└─────────────┘      └──────────────────────┘      └───────┬───────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │ SignalWeather    │
                                                  │ Registry         │
                                                  │ (Intelligent     │
                                                  │  Contract)       │
                                                  └─────────────────┘
```

**No backend.** All canonical state lives in the GenLayer contract. No Supabase, Firebase, Express, database, cron, private API, or indexer.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Contract | Python, GenLayer Intelligent Contract |
| SDK | `genlayer-js@1.1.8` (pinned) |
| Network | GenLayer StudioNet, Chain ID `61999` |
| RPC | `https://studio.genlayer.com/api` |
| Explorer | `https://explorer-studio.genlayer.com` |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |

## Setup

```bash
# Clone
git clone <repo-url>
cd signalweather

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS after deploying the contract

# Run development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=<deployed-address>
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
```

## Contract Methods

### Write Methods

| Method | Description |
|--------|-------------|
| `register_community` | Register a new community with source policy |
| `add_source` | Add a public evidence source URL |
| `disable_source` | Disable a source (historical references preserved) |
| `create_source_set` | Create an immutable versioned source manifest |
| `open_epoch` | Open a new trust epoch with frozen source set |
| `request_assessment` | Trigger validator consensus assessment |
| `open_challenge` | Challenge a verdict with new evidence |
| `request_reassessment` | Run reassessment on challenged epoch |
| `update_policy` | Create new climate-to-posture policy version |
| `record_override` | Record an operational override with reason |

### Read Methods

| Method | Description |
|--------|-------------|
| `get_community` | Community record |
| `get_all_communities` | All registered communities |
| `get_source` | Source record |
| `get_source_set` | Source set manifest |
| `get_epoch` | Epoch record |
| `get_epoch_verdict` | Accepted verdict for an epoch |
| `get_current_climate` | Current climate state |
| `get_current_posture` | Current operational posture |
| `get_challenge` | Challenge record |
| `get_policy` | Posture policy version |
| `get_counts` | Registry-wide counters |

## Assessment Flow

1. Community owner registers sources (public URLs)
2. Owner creates an immutable source set (min 3 sources, 2 types)
3. Owner opens an epoch with frozen source set and time window
4. `request_assessment` triggers GenLayer consensus:
   - Leader fetches all sources via `gl.nondet.web.get()`
   - Leader runs fixed assessment prompt on bounded evidence
   - Each validator independently re-fetches and re-assesses
   - Validators compare stable fields: climate, direction, dimension states, coverage, risk flags
   - Majority agreement → accepted verdict stored on-chain
5. Posture is deterministically mapped from climate via registered policy
6. Anyone can challenge with new public evidence URLs

## Trust Dimensions

- **Participation Health** — Is meaningful participation broadening or collapsing?
- **Conflict Temperature** — Are disagreements focused on issues or becoming personal?
- **Resolution Reliability** — Are disputes reaching documented outcomes?
- **Governance Legitimacy** — Are processes being followed consistently?
- **Contributor Continuity** — Are recognised contributors disengaging?
- **Narrative Coherence** — Do official statements and observed actions align?

## Climate States

| Climate | Description |
|---------|-------------|
| Stable | Healthy participation, functioning resolution |
| Strengthening | Improving across multiple dimensions vs previous epoch |
| Strained | Material warnings; core processes still function |
| Eroding | Multiple dimensions weakening |
| Fragile | One more conflict could trigger breakdown |
| Critical | Broad loss of confidence or governance paralysis |
| Inconclusive | Evidence insufficient for defensible verdict |

## Evidence Source Requirements

Validators can only verify evidence they can independently access:

**Supported:** Discourse forums, Snapshot/Tally proposals, GitHub issues/discussions/PRs, public incident reports, postmortems, status pages, transparency reports, public transcripts, official statements.

**Not independently verifiable:** Screenshots, Discord messages, Telegram logs, paywalled pages, login-protected URLs, frontend-generated metrics.

## Known Limitations

- Contract address must be set after deployment
- Assessment requires real validator consensus on StudioNet (takes time)
- Web sources that go down during consensus may cause `INCONCLUSIVE` verdicts
- Evidence fetching is bounded to prevent abuse (8KB per source, 20 sources max)
- No economic spam prevention in MVP (bonds planned for iteration 2)

## Demonstration Flow

1. Connect MetaMask wallet to StudioNet (Chain ID 61999)
2. Register a community at `/register`
3. Add 3+ public governance sources at `/manage/[id]/sources`
4. Create a source set from active sources
5. Open an epoch at `/manage/[id]/epochs/new`
6. Request assessment — wait for validator consensus
7. View verdict at `/community/[id]/epoch/[epochId]`
8. Optionally challenge with new evidence

## Repository Structure

```
signalweather/
  app/                    # Next.js App Router pages
  components/             # React components
    climate/              # Climate field, badges, cross-section, etc.
    wallet/               # Wallet provider and button
    layout/               # Header, navigation
    tx/                   # Transaction status display
  lib/
    genlayer/             # SDK client, network, types
    contract/             # Typed contract wrappers
    formatting/           # Climate labels, colors, formatters
  contracts/
    signal_weather.py     # GenLayer Intelligent Contract
  docs/                   # Specification documents
  public/                 # Static assets
  .env.example            # Environment template
```
