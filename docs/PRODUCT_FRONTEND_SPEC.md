# SIGNALWEATHER
## Product, Frontend, UX and Build Specification

**Working name:** SignalWeather  
**Tagline:** The on-chain trust climate for internet communities.  
**Build:** Frontend + GenLayer Intelligent Contract only  
**Frontend SDK:** `genlayer-js@1.1.8`  
**Network:** GenLayer StudioNet  
**Chain ID:** `61999`  
**RPC:** `https://studio.genlayer.com/api`  
**Explorer:** `https://explorer-studio.genlayer.com`

---

# 1. The corrected product thesis

SignalWeather is not an AI sentiment analyser and not a dashboard that asks an LLM whether a community “feels healthy.”

It is a source-grounded, validator-consensus trust registry.

For every assessment period, called a **trust epoch**, the contract independently fetches public evidence from approved community and governance sources. GenLayer validators then judge whether the community’s trust climate is:

- stable
- strengthening
- strained
- eroding
- fragile
- critical
- inconclusive

The accepted result becomes an on-chain operational posture that can be relied on by governance teams, treasury operators and community tooling.

SignalWeather answers:

> Based on independently fetched public evidence, is this community socially stable enough to continue normal operations, or are there signs that higher-risk actions should be slowed down, reviewed or temporarily gated?

This is materially stronger than a generic AI app because the result is:

- derived inside the Intelligent Contract
- grounded in independently fetched public sources
- independently reproduced by validators
- stored as shared on-chain state
- connected to an operational consequence
- challengeable through new evidence and re-assessment

---

# 2. Why this is a serious GenLayer project

The team feedback rules out several weak versions of this concept.

## Weak version that must not be built

A weak implementation would:

1. let a user paste messages
2. ask an LLM to score trust
3. check that the answer is valid JSON
4. store the result
5. display a colourful chart

That version would fail because:

- the contract judges user-submitted text alone
- validators do not verify the underlying evidence
- JSON validation proves format, not truth
- the product is effectively an off-chain AI dashboard
- no meaningful on-chain consequence follows the verdict
- the trust score can be manipulated by selective message submission

## Serious version

SignalWeather must instead:

1. register a community and its approved public source set
2. define a fixed epoch window
3. fetch the same evidence independently inside validator execution
4. derive source-level observations
5. make a bounded subjective judgment
6. compare independent validator decisions on stable fields
7. publish a canonical trust-climate verdict
8. update a contract-owned operational posture
9. preserve source references and evidence findings
10. permit a source-grounded challenge or reassessment

This gives GenLayer a real job: reaching a neutral, shared judgment about ambiguous social evidence that ordinary deterministic contracts cannot evaluate.

---

# 3. Target users

## Primary users

- protocol governance leads
- DAO operations teams
- community managers
- treasury signers
- ecosystem foundations
- delegate coordinators
- security councils
- grant programme operators

## Secondary users

- delegates
- contributors
- token holders
- risk analysts
- ecosystem partners
- governance tooling providers

---

# 4. Product scope

SignalWeather is a **trust-climate adjudication layer**, not a social listening suite.

## In scope

- public source registration
- trust epoch creation
- contract-side web evidence fetching
- multi-source evidence assessment
- trust-state consensus
- source coverage reporting
- confidence and disagreement reporting
- longitudinal epoch comparison
- on-chain operational posture
- challenge and reassessment flow
- public audit trail
- protocol policy configuration
- explorer-linked transaction history

## Out of scope for the MVP

- private Discord or Telegram scraping
- storing private community messages
- general-purpose AI chat
- personalised community advice
- autonomous moderation
- removing users or censoring content
- predicting token prices
- executing treasury transfers
- claiming that a trust verdict is objective fact
- using frontend-generated summaries as settlement evidence
- a separate backend, database or indexer

---

# 5. Evidence model

The contract can only verify evidence that validators can independently access.

## Recommended public sources

### Governance forums

- Discourse topic URLs
- Discourse category JSON endpoints
- proposal discussion pages
- temperature-check threads
- public RFC threads

### Governance systems

- Snapshot proposal pages or public API endpoints
- Tally proposal pages or public APIs
- public voting result pages
- delegation and participation pages

### Development and operations

- GitHub issues
- GitHub discussions
- GitHub pull requests
- public incident reports
- public postmortems
- public status pages

### Community accountability

- public conflict-resolution threads
- public moderation notices
- public transparency reports
- public community calls with transcripts
- public contributor reports

## Unsupported or weak evidence

The UI must warn users that the following are not independently verifiable by the contract:

- screenshots without a stable public URL
- copied Discord messages
- pasted chat logs
- private Telegram messages
- text summaries written by the submitter
- inaccessible documents
- paywalled pages
- login-protected URLs
- temporary signed URLs
- frontend-calculated metrics without a source

These may be used as context in later versions, but they must not determine the canonical verdict.

---

# 6. Trust epoch

A trust epoch is a bounded assessment period.

Example:

- community: Protocol Alpha
- epoch: 2026-Q3-W02
- start: 6 July 2026
- end: 12 July 2026
- source set version: 4
- previous epoch: 2026-Q3-W01
- assessment policy: standard_governance_v1

Each epoch has:

- an immutable time window
- a frozen source set
- a previous accepted epoch
- an assessment policy
- an assessment status
- a final verdict
- an operational posture
- an evidence coverage result
- a challenge state

The frontend must not permit source replacement after assessment begins.

---

# 7. Trust dimensions

The contract should not ask validators for one vague “trust score.”

Validators assess bounded dimensions.

## 7.1 Participation health

Questions:

- Is meaningful participation broadening or collapsing?
- Are the same few actors dominating all decisions?
- Are proposal discussions receiving substantive engagement?
- Is voter participation materially changing relative to recent epochs?

Possible state:

- improving
- healthy
- weakening
- severely_weak
- unknown

## 7.2 Conflict temperature

Questions:

- Are disagreements focused on issues or becoming personal?
- Are unresolved conflicts recurring across threads?
- Are accusations of bad faith becoming more frequent?
- Are disputes being escalated without resolution?

Possible state:

- low
- manageable
- elevated
- severe
- unknown

## 7.3 Resolution reliability

Questions:

- Are disputes reaching documented outcomes?
- Are commitments followed by visible action?
- Are explanations given when decisions change?
- Are unresolved matters accumulating?

Possible state:

- strong
- adequate
- weak
- broken
- unknown

## 7.4 Governance legitimacy

Questions:

- Are processes being followed consistently?
- Are major decisions being made through expected channels?
- Are material objections acknowledged?
- Are voting outcomes being respected?

Possible state:

- strong
- acceptable
- contested
- compromised
- unknown

## 7.5 Contributor continuity

Questions:

- Are recognised contributors disengaging?
- Are key working groups becoming inactive?
- Is contributor turnover increasing?
- Is activity recovering after a disruption?

Possible state:

- strengthening
- stable
- declining
- disrupted
- unknown

## 7.6 Narrative coherence

Questions:

- Do official statements and observed actions align?
- Are different leadership groups communicating contradictory positions?
- Is there increasing confusion around priorities, rules or commitments?

Possible state:

- coherent
- mostly_coherent
- fragmented
- contradictory
- unknown

---

# 8. Canonical climate states

The final climate is not a mathematical average. It is a bounded judgment derived from all dimensions and source quality.

## STABLE

Evidence indicates healthy participation, manageable disagreement and functioning resolution processes.

## STRENGTHENING

Trust conditions are improving across multiple dimensions relative to the previous accepted epoch.

## STRAINED

There are material warning signs, but core governance and resolution processes still function.

## ERODING

Multiple dimensions are weakening and confidence in process or leadership is visibly declining.

## FRAGILE

The community still operates, but one additional material conflict or failure could trigger a wider breakdown.

## CRITICAL

Evidence indicates broad loss of confidence, governance legitimacy failure, unresolved severe conflict or operational paralysis.

## INCONCLUSIVE

Evidence coverage is insufficient, inaccessible, contradictory or too narrow for a defensible verdict.

---

# 9. Operational posture

The verdict must have a consequence beyond a visual badge.

Each community registers a deterministic policy mapping from climate state to operational posture.

## NORMAL

- ordinary governance cadence
- no additional review flag
- ordinary treasury workflow

## OBSERVE

- highlight active risks
- recommend additional monitoring
- no automatic gating

## HEIGHTENED_REVIEW

- flag high-value proposals
- recommend longer discussion windows
- require explicit acknowledgement of trust risk in the UI

## COOLDOWN

- mark treasury and irreversible governance actions as socially high-risk
- advise temporary delay
- require an explicit override reason before the frontend allows a proposal execution workflow to continue

## EMERGENCY

- mark the community as socially unstable
- require manual council review
- display a prominent warning on all registered high-risk operations

The contract stores:

- current climate
- current posture
- posture start epoch
- whether an override is permitted
- required override reason
- policy version

The frontend can enforce the registered posture for all actions within SignalWeather. External governance adapters can read the same contract state.

SignalWeather does not seize treasury funds or automatically suspend a DAO. It creates a neutral, contract-owned risk state that governance systems can choose to respect.

---

# 10. Core user flows

## 10.1 Register a community

1. Connect wallet.
2. Select **Register Community**.
3. Enter:
   - community name
   - short identifier
   - public description
   - governance URL
   - source policy
4. Add initial sources.
5. Select climate-to-posture mapping.
6. Review immutability warnings.
7. Submit registration transaction.
8. Track pending, accepted and final states.
9. Open community command centre.

## 10.2 Add a source

1. Select a source type.
2. Enter a public URL.
3. Frontend performs a non-authoritative availability preview.
4. User sees:
   - source type
   - expected content
   - accessibility warning
   - whether the URL is likely stable
5. Submit on-chain.
6. Source becomes active only after contract validation or administrator approval, depending on policy.

The preview must be labelled:

> Frontend preview only. Validators will independently fetch this source during assessment.

## 10.3 Open an epoch

1. Select date window.
2. Select the active source-set version.
3. Select previous comparison epoch.
4. Show minimum source requirements.
5. Confirm that sources become frozen.
6. Submit `open_epoch`.
7. Epoch enters `collecting`.

## 10.4 Request assessment

1. Show source manifest.
2. Show inaccessible-source warnings discovered by previews.
3. Confirm assessment policy.
4. Submit `request_assessment`.
5. Transaction enters GenLayer consensus.
6. Frontend displays:
   - submitted
   - pending
   - proposing
   - validating
   - accepted
   - final
   - undetermined
7. On acceptance, the climate and posture update.

## 10.5 Review a verdict

The verdict page shows:

- canonical climate
- operational posture
- transition from previous epoch
- confidence band
- evidence coverage
- dimension findings
- source-aligned findings
- dissent or ambiguity notes
- contract transaction
- explorer link
- assessment policy version
- source-set version

## 10.6 Challenge a verdict

A challenge cannot be “I disagree.”

The challenger must provide:

- challenge basis
- one or more new public evidence URLs
- explanation of materiality
- disputed dimension
- requested reassessment scope

Allowed challenge bases:

- omitted_material_evidence
- source_misread
- time_window_error
- source_became_inaccessible
- finding_not_supported
- climate_transition_misclassified
- conflict_of_evidence

The contract independently fetches the challenge evidence and runs a new assessment.

---

# 11. Information architecture

## Public routes

- `/`
- `/climates`
- `/community/[communityId]`
- `/community/[communityId]/epoch/[epochId]`
- `/community/[communityId]/sources`
- `/community/[communityId]/history`
- `/community/[communityId]/policy`
- `/assessment/[transactionHash]`
- `/compare`
- `/methodology`

## Wallet routes

- `/register`
- `/manage/[communityId]`
- `/manage/[communityId]/sources`
- `/manage/[communityId]/epochs/new`
- `/manage/[communityId]/challenge/[epochId]`

---

# 12. Banger UI direction

## Visual concept: atmospheric governance instrument

The interface should feel like a hybrid of:

- a meteorological command centre
- a seismic monitoring station
- a governance war room
- an institutional risk terminal

It must not look like:

- a generic crypto dashboard
- a collection of rounded cards
- a purple gradient AI app
- a weather app with cloud icons
- a basic analytics admin panel

## Primary visual metaphor

Trust is rendered as an atmospheric field.

The main screen contains a large **Climate Field** rather than a conventional line chart.

It visualises:

- pressure: unresolved governance stress
- turbulence: conflict intensity
- visibility: evidence coverage
- temperature: participation energy
- wind direction: direction of trust change
- storm cells: concentrated risk clusters
- fronts: transitions between trust states

These metaphors are visual only. The underlying verdict fields retain precise governance meanings.

---

# 13. Design system

## Palette

### Base

- Obsidian Atmosphere: `#080B10`
- Deep Pressure: `#101722`
- Instrument Slate: `#182231`
- Fog Surface: `#DDE4EA`
- Cold White: `#F5F8FA`

### Climate signals

- Stable Cyan: `#42D6C6`
- Strengthening Blue: `#5D8CFF`
- Strained Amber: `#E6A84A`
- Eroding Vermilion: `#F06A4F`
- Fragile Magenta: `#D35CFF`
- Critical Red: `#FF3B4E`
- Inconclusive Grey: `#82909D`

### Utility

- Evidence Green: `#6FE3A1`
- Challenge Gold: `#F3C969`
- Consensus Violet: `#8B7CFF`

## Typography

Use a three-font system:

- Display: **Instrument Serif** or a similarly editorial high-contrast serif
- Interface: **Geist Sans**
- Data and hashes: **IBM Plex Mono**

Do not use Inter as the primary brand font.

## Shape language

- long horizontal instrument bands
- clipped corners
- inset measurement tracks
- fine-grid backgrounds
- thin crosshair dividers
- compressed data labels
- minimal radius
- no oversized pill buttons
- no floating glassmorphism cards

---

# 14. Signature components

## 14.1 Climate Field

A full-width animated field showing the current state and transition.

It includes:

- current climate wordmark
- current posture
- transition vector
- epoch date
- evidence visibility
- consensus state
- a subtle particle field responding to climate severity

Animation must be restrained and functional.

## 14.2 Pressure Ribbon

A continuous horizontal ribbon of recent epochs.

Each epoch is represented by:

- climate state
- direction
- confidence
- source coverage
- challenge marker

Hover reveals the epoch summary.

## 14.3 Source Radar

A radial or orbital source map grouped by:

- governance
- participation
- conflict
- resolution
- contributor activity
- official communication

Each node shows:

- fetched
- failed
- stale
- duplicate
- relevant
- low-signal

## 14.4 Consensus Chamber

A transaction-status visualisation that explains:

- leader assessment
- validator verification
- accepted decision fields
- finality status
- challenge availability

Do not fabricate validator identities or individual model outputs if the network does not expose them.

## 14.5 Trust Cross-Section

A vertical layer view showing each dimension and its evidence-supported finding.

It should feel like a geological or atmospheric cross-section, not six score cards.

## 14.6 Operational Gate

A high-visibility panel displaying:

- active posture
- affected action categories
- override rules
- reason requirement
- policy version

## 14.7 Evidence Ledger

Every material finding must link back to one or more fetched sources.

Each row contains:

- source type
- source URL
- source title if available
- observation
- affected dimension
- support direction
- retrieval status
- epoch window fit

---

# 15. Landing page structure

## Hero

Headline:

> Know when trust changes before governance breaks.

Subheading:

> SignalWeather uses GenLayer validators to independently inspect public governance evidence and reach consensus on whether a community is stable, strained, eroding or approaching a critical trust event.

Primary action:

- Explore climates

Secondary action:

- Register a community

The hero visual is a live atmospheric field built from real accepted epoch data.

## Section: The failure before the failure

Explain that visible crises usually follow earlier signals:

- participation collapse
- repeated unresolved conflict
- contradictory leadership communication
- process bypass
- contributor exits
- declining confidence in resolution

## Section: Not sentiment analysis

Show a direct comparison:

| Ordinary social analytics | SignalWeather |
|---|---|
| centralised model | validator consensus |
| scraped mentions | registered public evidence |
| opaque score | source-aligned findings |
| no shared state | on-chain climate registry |
| no consequence | operational posture |
| not challengeable | source-grounded reassessment |

## Section: How a climate is formed

1. Register sources.
2. Freeze an epoch.
3. Validators fetch independently.
4. Validators assess bounded dimensions.
5. Consensus sets climate and posture.
6. Anyone can audit the evidence trail.

## Section: Current climate board

Show real registered communities only. Never populate production with fabricated protocol verdicts.

---

# 16. Community command centre

The page must not be a grid of generic cards.

## Layout

### Top command strip

- community
- current epoch
- climate
- posture
- finality
- latest transaction

### Main left field

- Climate Field
- recent epoch transition
- pressure ribbon

### Right instrument rail

- evidence coverage
- source failures
- challenge window
- source-set version
- policy version

### Lower cross-section

- six trust dimensions
- source-aligned findings
- unresolved contradictions

### Bottom operational rail

- active restrictions
- override rules
- integration read method
- last posture change

---

# 17. GenLayer frontend integration

## Package

```bash
npm install genlayer-js@1.1.8
```

Pin the exact version in `package.json`.

## Environment variables

```env
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
```

## Wallet model

Use an injected EVM wallet for the MVP.

Required UX:

- connect wallet
- show connected address
- detect wrong network
- switch to StudioNet where supported
- explain signature and transaction steps
- never request or generate private keys in the browser
- never store seed phrases
- never fake a successful transaction

## Contract reads

Use `genlayer-js` read methods for:

- community record
- active source set
- epoch details
- latest verdict
- operational posture
- challenge state
- assessment policy
- paginated IDs or counts exposed by the contract

Do not substitute raw `ethers` `eth_call` for GenLayer-specific reads where `genlayer-js` is required.

## Contract writes

Required writes:

- `register_community`
- `add_source`
- `disable_source`
- `create_source_set`
- `open_epoch`
- `request_assessment`
- `open_challenge`
- `request_reassessment`
- `update_policy`
- `record_override`

Exact method names may follow the final contract implementation.

## Transaction UX

Every transaction must show:

1. preparing
2. wallet confirmation
3. submitted
4. pending consensus
5. accepted or undetermined
6. finality state if exposed
7. explorer link

Do not show “complete” immediately after wallet submission.

---

# 18. Frontend architecture

## Stack

- Next.js 15 stable
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui only for primitives
- `genlayer-js@1.1.8`
- viem only where compatible and necessary
- Framer Motion for restrained instrument animation
- Zod for frontend form validation
- React Hook Form

## No backend rule

The application must not require:

- Supabase
- Firebase
- Cloudflare Workers
- Express
- a database
- a cron job
- a private API
- an off-chain AI API
- an indexing service

All canonical records come from the GenLayer contract.

Local storage may retain only non-sensitive UI preferences and unfinished form drafts.

---

# 19. State and data rules

## Source of truth

The Intelligent Contract is the sole source of truth for:

- registered communities
- source manifests
- source-set versions
- epochs
- climate verdicts
- operational postures
- challenge records
- override records
- methodology versions

## Frontend-only state

- selected filters
- visual display preferences
- unsubmitted form drafts
- temporary source availability previews
- chart interpolation

## Forbidden frontend behaviour

- calculating the final climate
- changing a climate label
- inventing evidence findings
- presenting a source preview as validator evidence
- hiding inaccessible sources
- presenting pending assessments as accepted
- using mocked verdicts after production deployment

---

# 20. Error and edge-case UX

Handle:

- wallet rejection
- wrong network
- insufficient balance
- duplicate source URL
- unsupported scheme
- inaccessible source
- source outside epoch window
- epoch with insufficient source diversity
- assessment already requested
- undetermined consensus
- challenge window closed
- duplicate challenge evidence
- contract read failure
- source-set version mismatch
- malformed contract return
- transaction accepted but not final

Each error must say what happened and what the user can do next.

---

# 21. Accessibility

- WCAG AA contrast
- reduced-motion mode
- keyboard navigation
- non-colour climate labels
- text equivalents for atmospheric visualisations
- screen-reader descriptions for trends
- focus-visible states
- no essential information conveyed by animation alone

---

# 22. Repository expectations

The submission must include the full source repository.

## Required repository structure

```text
signalweather/
  app/
  components/
  lib/
    genlayer/
    contract/
    formatting/
  public/
  contracts/
    signal_weather.py
  docs/
    PRODUCT_FRONTEND_SPEC.md
    CONTRACT_SPEC.md
    METHODOLOGY.md
  tests/
  README.md
  package.json
  .env.example
```

## README must include

- product thesis
- why GenLayer is necessary
- architecture
- StudioNet configuration
- exact SDK version
- deployed contract address
- explorer link
- setup steps
- contract methods
- test instructions
- known limitations
- evidence-source requirements
- screenshots
- demonstration flow

---

# 23. Meaningful iteration roadmap

The team explicitly values depth over quantity. Build SignalWeather as one evolving system.

## Iteration 1: Source-grounded climate registry

- community registration
- source sets
- epoch creation
- contract-side fetching
- climate consensus
- operational posture
- history view

## Iteration 2: Challenge and resilience

- new-evidence challenges
- reassessment
- source failure handling
- source diversity requirements
- richer contradiction detection
- policy versioning

## Iteration 3: Governance adapters

- standard read interface
- Snapshot/Tally integration examples
- treasury workflow checks
- proposal warning components
- external policy consumer contract

## Iteration 4: Methodology governance

- community-approved assessment policies
- methodology version history
- domain-specific trust models
- appeal bond or anti-spam mechanism
- comparative analytics without cross-community ranking abuse

Do not split these into several renamed projects.

---

# 24. Acceptance criteria

The product is not complete unless:

- validators fetch public evidence inside the contract
- final state is not derived from pasted user text alone
- validator logic verifies substantive decision fields
- source failures are visible
- the final climate has an operational consequence
- accepted findings link to evidence sources
- source sets are frozen per epoch
- previous epoch comparison is explicit
- a challenge requires new public evidence or a precise source error
- the UI clearly separates preview, pending, accepted and final states
- the repo contains frontend and contract source
- the app runs against StudioNet
- `genlayer-js@1.1.8` is pinned
- production contains no fabricated community results

---

# 25. Final positioning

SignalWeather should be presented as:

> A GenLayer-powered trust-climate registry that turns independently verifiable public governance evidence into a shared on-chain operational posture.

It should not be presented as:

- AI community analytics
- a sentiment dashboard
- a governance chatbot
- a social score
- a prediction engine
- an oracle for emotions

The point is not to claim that trust can be measured perfectly.

The point is to make a difficult social judgment:

- evidence-grounded
- independently checked
- bounded
- transparent
- challengeable
- operationally useful
- shared across parties that do not want to trust one analyst or one AI model
