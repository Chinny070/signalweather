# SignalWeather Methodology

## What SignalWeather measures

SignalWeather does not measure sentiment. It does not ask an AI whether a community "feels healthy." Instead, it independently fetches registered public governance evidence and uses GenLayer validators to reach consensus on six bounded trust dimensions.

## Trust dimensions

Each dimension is assessed independently. Validators must agree on the state of each dimension, not just the final climate.

### Participation Health
- Is meaningful participation broadening or collapsing?
- Are the same few actors dominating all decisions?
- Are proposal discussions receiving substantive engagement?
- States: improving, healthy, weakening, severely_weak, unknown

### Conflict Temperature
- Are disagreements focused on issues or becoming personal?
- Are unresolved conflicts recurring across threads?
- States: low, manageable, elevated, severe, unknown

### Resolution Reliability
- Are disputes reaching documented outcomes?
- Are commitments followed by visible action?
- States: strong, adequate, weak, broken, unknown

### Governance Legitimacy
- Are processes being followed consistently?
- Are major decisions made through expected channels?
- States: strong, acceptable, contested, compromised, unknown

### Contributor Continuity
- Are recognised contributors disengaging?
- Are key working groups becoming inactive?
- States: strengthening, stable, declining, disrupted, unknown

### Narrative Coherence
- Do official statements and observed actions align?
- Are different leadership groups communicating contradictory positions?
- States: coherent, mostly_coherent, fragmented, contradictory, unknown

## Climate states

The final climate is a bounded judgment derived from all dimensions and source quality. It is not a mathematical average.

| Climate | Meaning |
|---------|---------|
| **Stable** | Healthy participation, manageable disagreement, functioning resolution |
| **Strengthening** | Trust improving across multiple dimensions vs previous epoch |
| **Strained** | Material warning signs; core processes still function |
| **Eroding** | Multiple dimensions weakening; confidence visibly declining |
| **Fragile** | One more conflict could trigger wider breakdown |
| **Critical** | Broad loss of confidence, governance failure, or operational paralysis |
| **Inconclusive** | Evidence insufficient for a defensible verdict |

## Operational postures

Each climate maps deterministically to an operational posture via the community's registered policy. The LLM does not choose the posture.

| Posture | Effect |
|---------|--------|
| **Normal** | Ordinary governance cadence |
| **Observe** | Active risks highlighted; additional monitoring recommended |
| **Heightened Review** | High-value proposals flagged; longer discussion windows |
| **Cooldown** | Treasury and irreversible actions marked high-risk |
| **Emergency** | Community socially unstable; manual council review required |

## Evidence requirements

Validators can only verify evidence they can independently access.

**Recommended sources:** Discourse forums, Snapshot/Tally proposals, GitHub issues/discussions/PRs, public incident reports, postmortems, status pages, transparency reports, public transcripts, official statements.

**Not independently verifiable:** Screenshots without stable URLs, copied Discord messages, pasted chat logs, private Telegram messages, text summaries by the submitter, inaccessible documents, paywalled pages, login-protected URLs.

## Evidence coverage bands

| Band | Criteria |
|------|----------|
| **Strong** | 5+ accessible sources, 3+ types, 2+ domains, 4+ dimensions covered |
| **Adequate** | 3+ accessible sources, 2+ types, 3+ dimensions covered |
| **Thin** | 1-2 accessible sources, narrow diversity |
| **Failed** | No usable sources — forces inconclusive climate |

## Consensus mechanism

1. The leader node fetches all registered sources and runs the assessment prompt
2. Each validator independently re-fetches the same sources and produces its own assessment
3. Validators compare stable decision fields against the leader's result
4. Exact agreement required on: climate, direction, coverage band, critical dimension states
5. Limited divergence allowed on: confidence (±15), adjacent dimension states, wording
6. If a majority agrees, the verdict is accepted and stored on-chain
7. If not, the transaction becomes undetermined and the community's state is unchanged

## Challenges

A challenge requires:
- A specific basis (omitted evidence, source misread, time window error, etc.)
- One or more new public evidence URLs
- Explanation of materiality
- Disputed dimension

The contract fetches the challenge evidence and runs a fresh independent assessment combining the original source manifest with the new evidence.

## What SignalWeather does not claim

- Trust can be measured perfectly
- A single assessment captures the full truth
- The verdict is objective fact
- The system replaces human governance judgment

The point is to make a difficult social judgment evidence-grounded, independently checked, bounded, transparent, challengeable, and operationally useful.
