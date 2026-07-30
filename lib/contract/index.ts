import { callReadMethod, sendTransaction, waitForReceipt, type TxResult } from '@/lib/genlayer/client';
import type {
  Community, Source, SourceSet, Epoch, Verdict,
  Challenge, Counts, PosturePolicy,
} from '@/lib/genlayer/types';

// ─── READS ───

export async function getCommunity(communityId: string): Promise<Community> {
  const raw = await callReadMethod('get_community', [communityId]);
  return JSON.parse(raw);
}

export async function getAllCommunities(): Promise<Community[]> {
  const raw = await callReadMethod('get_all_communities', []);
  return JSON.parse(raw);
}

export async function getSource(sourceId: string): Promise<Source> {
  const raw = await callReadMethod('get_source', [sourceId]);
  return JSON.parse(raw);
}

export async function getSourceSet(sourceSetId: string): Promise<SourceSet> {
  const raw = await callReadMethod('get_source_set', [sourceSetId]);
  return JSON.parse(raw);
}

export async function getEpoch(epochId: string): Promise<Epoch> {
  const raw = await callReadMethod('get_epoch', [epochId]);
  return JSON.parse(raw);
}

export async function getEpochVerdict(epochId: string): Promise<Verdict | null> {
  const raw = await callReadMethod('get_epoch_verdict', [epochId]);
  const parsed = JSON.parse(raw);
  if (!parsed || !parsed.climate) return null;
  return parsed;
}

export async function getCurrentClimate(communityId: string): Promise<string> {
  return callReadMethod('get_current_climate', [communityId]);
}

export async function getCurrentPosture(communityId: string): Promise<string> {
  return callReadMethod('get_current_posture', [communityId]);
}

export async function getChallenge(challengeId: string): Promise<Challenge> {
  const raw = await callReadMethod('get_challenge', [challengeId]);
  return JSON.parse(raw);
}

export async function getPolicy(communityId: string, version: string): Promise<PosturePolicy> {
  const raw = await callReadMethod('get_policy', [communityId, version]);
  return JSON.parse(raw);
}

export async function getCounts(): Promise<Counts> {
  const raw = await callReadMethod('get_counts', []);
  return JSON.parse(raw);
}

export async function getCommunityEpochIds(communityId: string): Promise<number[]> {
  const raw = await callReadMethod('get_community_epoch_ids', [communityId]);
  return JSON.parse(raw);
}

export async function getCommunitySourceIds(communityId: string): Promise<number[]> {
  const raw = await callReadMethod('get_community_source_ids', [communityId]);
  return JSON.parse(raw);
}

// ─── WRITES ───

export interface TxOutcome {
  hash: string;
  success: boolean;
  pending?: boolean;
  error?: string;
}

const LONG_POLL_METHODS = ['request_assessment', 'request_reassessment'];

async function executeWrite(method: string, args: string[]): Promise<TxOutcome> {
  const txResult: TxResult = await sendTransaction(method, args);
  if (txResult.status === 'error') {
    return { hash: '', success: false, error: txResult.error };
  }
  const retries = LONG_POLL_METHODS.includes(method) ? 600 : 200;
  const receipt = await waitForReceipt(txResult.hash, retries);
  if (receipt.status === 'pending') {
    return { hash: txResult.hash, success: false, pending: true };
  }
  return {
    hash: txResult.hash,
    success: receipt.status === 'success',
    error: receipt.status === 'error' ? 'Transaction failed or undetermined' : undefined,
  };
}

export async function registerCommunity(
  slug: string, name: string, description: string,
  governanceUrl: string, policyJson: string
): Promise<TxOutcome> {
  return executeWrite('register_community', [slug, name, description, governanceUrl, policyJson]);
}

export async function addSource(
  communityId: string, sourceType: string, url: string, label: string
): Promise<TxOutcome> {
  return executeWrite('add_source', [communityId, sourceType, url, label]);
}

export async function disableSource(
  communityId: string, sourceId: string, reason: string
): Promise<TxOutcome> {
  return executeWrite('disable_source', [communityId, sourceId, reason]);
}

export async function createSourceSet(
  communityId: string, sourceIdsJson: string
): Promise<TxOutcome> {
  return executeWrite('create_source_set', [communityId, sourceIdsJson]);
}

export async function openEpoch(
  communityId: string, label: string, windowStart: string,
  windowEnd: string, sourceSetId: string, previousEpochId: string,
  assessmentPolicyVersion: string
): Promise<TxOutcome> {
  return executeWrite('open_epoch', [
    communityId, label, windowStart, windowEnd,
    sourceSetId, previousEpochId, assessmentPolicyVersion,
  ]);
}

export async function requestAssessment(epochId: string): Promise<TxOutcome> {
  return executeWrite('request_assessment', [epochId]);
}

export async function openChallenge(
  epochId: string, challengeBasis: string, disputedDimension: string,
  newEvidenceUrlsJson: string, materialityStatement: string
): Promise<TxOutcome> {
  return executeWrite('open_challenge', [
    epochId, challengeBasis, disputedDimension,
    newEvidenceUrlsJson, materialityStatement,
  ]);
}

export async function requestReassessment(challengeId: string): Promise<TxOutcome> {
  return executeWrite('request_reassessment', [challengeId]);
}

export async function updatePolicy(
  communityId: string, policyJson: string
): Promise<TxOutcome> {
  return executeWrite('update_policy', [communityId, policyJson]);
}

export async function recordOverride(
  communityId: string, actionReference: string, overrideReason: string
): Promise<TxOutcome> {
  return executeWrite('record_override', [communityId, actionReference, overrideReason]);
}
