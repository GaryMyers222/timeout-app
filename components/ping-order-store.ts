import { useMemo, useSyncExternalStore } from 'react';

import { MOCK_CANDIDATES } from '@/constants/timeout-rules';

const listeners = new Set<() => void>();
let includedCandidateIds = new Set(MOCK_CANDIDATES.map((candidate) => candidate.id));
let snapshotVersion = 0;

function emit() {
  snapshotVersion += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshotVersion;
}

function buildCandidatesSnapshot() {
  return MOCK_CANDIDATES.map((candidate) => ({
    ...candidate,
    included: includedCandidateIds.has(candidate.id),
  }));
}

export function getIncludedCandidateIds() {
  return MOCK_CANDIDATES
    .filter((candidate) => includedCandidateIds.has(candidate.id))
    .map((candidate) => candidate.id);
}

export function getExcludedCandidateIds() {
  return MOCK_CANDIDATES
    .filter((candidate) => !includedCandidateIds.has(candidate.id))
    .map((candidate) => candidate.id);
}

export function setCandidateIncluded(candidateId: string, included: boolean) {
  const next = new Set(includedCandidateIds);

  if (included) next.add(candidateId);
  else next.delete(candidateId);

  const changed = next.size !== includedCandidateIds.size || [...next].some((id) => !includedCandidateIds.has(id));
  if (!changed) return;

  includedCandidateIds = next;
  emit();
}

export function resetCandidateSelection() {
  const allCandidateIds = new Set(MOCK_CANDIDATES.map((candidate) => candidate.id));
  const changed =
    allCandidateIds.size !== includedCandidateIds.size ||
    [...allCandidateIds].some((id) => !includedCandidateIds.has(id));

  if (!changed) return;

  includedCandidateIds = allCandidateIds;
  emit();
}

export function usePingOrderSelection() {
  const version = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const candidates = useMemo(() => buildCandidatesSnapshot(), [version]);
  const included = useMemo(() => candidates.filter((candidate) => candidate.included), [candidates]);
  const excluded = useMemo(() => candidates.filter((candidate) => !candidate.included), [candidates]);

  return {
    candidates,
    included,
    excluded,
    includedCandidateIds: included.map((candidate) => candidate.id),
    excludedCandidateIds: excluded.map((candidate) => candidate.id),
    setCandidateIncluded,
    resetCandidateSelection,
  };
}
