import React, { createContext, useContext, useMemo, useState } from 'react';

import { AutoPingMode, MOCK_CANDIDATES, SitPresetKey } from '@/constants/timeout-rules';

export type Candidate = {
  id: string;
  name: string;
  pointsBalance: number;
  channel: 'app' | 'sms';
};

export type PingEvent = {
  candidateName: string;
  sentAt: string;
  status: 'No response' | 'YES' | 'Waiting' | 'Filled';
};

export type SitRequest = {
  id: string;
  presetKey: SitPresetKey;
  title: string;
  dateLabel: string;
  startTime: string;
  duration: string;
  kidsLabel: string;
  locationLabel: string;
  comments: string;
  createdAt: string;
  isPastSit: boolean;
  autoPingMode: AutoPingMode;
  status: 'active' | 'confirmed' | 'timed_out' | 'past_logged' | 'cancelled';
  confirmedSitterName?: string;
  candidates: Candidate[];
  pingEvents: PingEvent[];
};

type CreateSitRequestInput = Omit<SitRequest, 'id' | 'createdAt' | 'status' | 'candidates' | 'pingEvents' | 'confirmedSitterName'>;

type TimeoutStoreValue = {
  requests: SitRequest[];
  activeRequest: SitRequest | null;
  createRequest: (input: CreateSitRequestInput) => SitRequest;
  cancelActiveRequest: () => void;
  confirmFirstYes: (requestId: string) => void;
  resetMockRequests: () => void;
};

const TimeoutStoreContext = createContext<TimeoutStoreValue | null>(null);

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function sortCandidatesByDebt(candidates: Candidate[]) {
  return [...candidates].sort((a, b) => a.pointsBalance - b.pointsBalance);
}

function buildMockPingEvents(autoPingMode: AutoPingMode, candidates: Candidate[]): PingEvent[] {
  if (autoPingMode === 'disabled') return [];

  if (autoPingMode === 'broadcast') {
    return candidates.slice(0, 5).map((candidate, index) => ({
      candidateName: candidate.name,
      sentAt: 'now',
      status: index === 1 ? 'YES' : 'No response',
    }));
  }

  return candidates.slice(0, 5).map((candidate, index) => ({
    candidateName: candidate.name,
    sentAt: index < 4 ? `5:${String(9 + index * 10).padStart(2, '0')}` : 'waiting',
    status: index === 3 ? 'YES' : index < 3 ? 'No response' : 'Waiting',
  }));
}

function findFirstYes(events: PingEvent[]) {
  return events.find((event) => event.status === 'YES')?.candidateName;
}

export function TimeoutStoreProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<SitRequest[]>([]);

  const activeRequest = useMemo(
    () => requests.find((request) => request.status === 'active') ?? null,
    [requests]
  );

  const value = useMemo<TimeoutStoreValue>(
    () => ({
      requests,
      activeRequest,
      createRequest: (input) => {
        const now = new Date();
        const candidates = input.autoPingMode === 'disabled' ? [] : sortCandidatesByDebt(MOCK_CANDIDATES);
        const nextRequest: SitRequest = {
          ...input,
          id: `${now.getTime()}`,
          createdAt: now.toISOString(),
          status: input.isPastSit ? 'past_logged' : 'active',
          candidates,
          pingEvents: buildMockPingEvents(input.autoPingMode, candidates),
        };

        setRequests((current) => {
          const shouldCancelExisting =
            !input.isPastSit &&
            current.some(
              (request) =>
                request.status === 'active' && isSameCalendarDay(new Date(request.createdAt), now)
            );

          const nextRequests = shouldCancelExisting
            ? current.map((request) =>
                request.status === 'active' ? { ...request, status: 'cancelled' as const } : request
              )
            : current;

          return [nextRequest, ...nextRequests];
        });

        return nextRequest;
      },
      cancelActiveRequest: () => {
        setRequests((current) =>
          current.map((request) =>
            request.status === 'active' ? { ...request, status: 'cancelled' as const } : request
          )
        );
      },
      confirmFirstYes: (requestId) => {
        setRequests((current) =>
          current.map((request) => {
            if (request.id !== requestId || request.status !== 'active') return request;
            const confirmedSitterName = findFirstYes(request.pingEvents) ?? request.candidates[0]?.name ?? 'Confirmed sitter';
            return {
              ...request,
              status: 'confirmed',
              confirmedSitterName,
              pingEvents: request.pingEvents.map((event) =>
                event.candidateName === confirmedSitterName
                  ? { ...event, status: 'YES' as const }
                  : event.status === 'Waiting'
                    ? { ...event, status: 'Filled' as const }
                    : event
              ),
            };
          })
        );
      },
      resetMockRequests: () => setRequests([]),
    }),
    [activeRequest, requests]
  );

  return <TimeoutStoreContext.Provider value={value}>{children}</TimeoutStoreContext.Provider>;
}

export function useTimeoutStore() {
  const context = useContext(TimeoutStoreContext);

  if (!context) {
    throw new Error('useTimeoutStore must be used inside TimeoutStoreProvider');
  }

  return context;
}
