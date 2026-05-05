import { useSyncExternalStore } from 'react';

import { MOCK_CANDIDATES } from '@/constants/timeout-rules';

const listeners = new Set<() => void>();
let includedCandidateIds = new Set(MOCK_CANDIDATES.map((candidate) => candidate.id));

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
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
  includedCandidateIds = next;
  emit();
}

export function resetCandidateSelection() {
  includedCandidateIds = new Set(MOCK_CANDIDATES.map((candidate) => candidate.id));
  emit();
}

export function usePingOrderSelection() {
  const candidates = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const included = candidates.filter((candidate) => candidate.included);
  const excluded = candidates.filter((candidate) => !candidate.included);

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
