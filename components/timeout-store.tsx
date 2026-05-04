import React, { createContext, useContext, useMemo, useState } from 'react';

import { AutoPingMode, MOCK_CANDIDATES, POINTS_PER_HOUR, SitPresetKey } from '@/constants/timeout-rules';

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
  responderPhone?: string;
  responderAddress?: string;
};

export type CancellationScope = 'sit' | 'my_participation' | 'entire_activity';
export type SitStatus =
  | 'active'
  | 'confirmed'
  | 'pickup_complete'
  | 'completed'
  | 'points_settled'
  | 'timed_out'
  | 'past_logged'
  | 'cancelled';

export type EmergencyPointBreakdown = {
  yesToPickupBonus: number;
  pickupToEndPoints: number;
  totalPoints: number;
};

export type SitRequest = {
  id: string;
  requestCode: string;
  groupId: string;
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
  status: SitStatus;
  confirmedSitterName?: string;
  confirmedSitterPhone?: string;
  confirmedSitterAddress?: string;
  firstYesAt?: string;
  pickupCompletedAt?: string;
  sitEndedAt?: string;
  pointsSettledAt?: string;
  emergencyPointBreakdown?: EmergencyPointBreakdown;
  cancellationScope?: CancellationScope;
  cancellationNote?: string;
  candidates: Candidate[];
  pingEvents: PingEvent[];
};

type CreateSitRequestInput = Omit<SitRequest, 'id' | 'requestCode' | 'groupId' | 'createdAt' | 'status' | 'candidates' | 'pingEvents' | 'confirmedSitterName' | 'confirmedSitterPhone' | 'confirmedSitterAddress' | 'firstYesAt' | 'pickupCompletedAt' | 'sitEndedAt' | 'pointsSettledAt' | 'emergencyPointBreakdown' | 'cancellationScope' | 'cancellationNote'>;

type TimeoutStoreValue = {
  requests: SitRequest[];
  activeRequests: SitRequest[];
  activeRequest: SitRequest | null;
  createRequest: (input: CreateSitRequestInput) => SitRequest;
  cancelActiveRequest: () => void;
  cancelRequest: (requestId: string, scope: CancellationScope, note: string) => void;
  simulateFirstYes: (requestId: string) => void;
  markPickupComplete: (requestId: string) => void;
  endSit: (requestId: string) => void;
  settlePoints: (requestId: string) => void;
  resetMockRequests: () => void;
};

const TimeoutStoreContext = createContext<TimeoutStoreValue | null>(null);
const EMERGENCY_YES_TO_PICKUP_BONUS = 6;

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
      responderPhone: index === 1 ? '(555) 013-4420' : undefined,
      responderAddress: index === 1 ? 'Text/call for handoff address' : undefined,
    }));
  }

  return candidates.slice(0, 5).map((candidate, index) => ({
    candidateName: candidate.name,
    sentAt: index < 4 ? `5:${String(9 + index * 10).padStart(2, '0')}` : 'waiting',
    status: index === 3 ? 'YES' : index < 3 ? 'No response' : 'Waiting',
    responderPhone: index === 3 ? '(555) 013-7810' : undefined,
    responderAddress: index === 3 ? 'Shared after confirmation' : undefined,
  }));
}

function findFirstYes(events: PingEvent[]) {
  return events.find((event) => event.status === 'YES');
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function buildRequestCode(date: Date) {
  return `TO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getTime()).slice(-5)}`;
}

function calculateEmergencyPoints(pickupCompletedAt?: string, sitEndedAt?: string): EmergencyPointBreakdown {
  const pickupToEndHours = pickupCompletedAt && sitEndedAt ? 1 : 1;
  const pickupToEndPoints = pickupToEndHours * POINTS_PER_HOUR;
  return {
    yesToPickupBonus: EMERGENCY_YES_TO_PICKUP_BONUS,
    pickupToEndPoints,
    totalPoints: EMERGENCY_YES_TO_PICKUP_BONUS + pickupToEndPoints,
  };
}

function updateRequestStatus(requests: SitRequest[], requestId: string, status: SitStatus) {
  return requests.map((request) => (request.id === requestId ? { ...request, status } : request));
}

export function TimeoutStoreProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<SitRequest[]>([]);

  const activeRequests = useMemo(
    () => requests.filter((request) => request.status === 'active'),
    [requests]
  );

  const activeRequest = activeRequests[0] ?? null;

  const value = useMemo<TimeoutStoreValue>(
    () => ({
      requests,
      activeRequests,
      activeRequest,
      createRequest: (input) => {
        const now = new Date();
        const candidates = input.autoPingMode === 'disabled' ? [] : sortCandidatesByDebt(MOCK_CANDIDATES);
        const nextRequest: SitRequest = {
          ...input,
          id: `${now.getTime()}`,
          requestCode: buildRequestCode(now),
          groupId: 'default-circle',
          createdAt: now.toISOString(),
          status: input.isPastSit ? 'past_logged' : 'active',
          candidates,
          pingEvents: buildMockPingEvents(input.autoPingMode, candidates),
        };

        setRequests((current) => [nextRequest, ...current]);

        return nextRequest;
      },
      cancelActiveRequest: () => {
        setRequests((current) =>
          current.map((request) =>
            request.status === 'active'
              ? { ...request, status: 'cancelled' as const, cancellationScope: 'sit', cancellationNote: 'Requester cancelled active AutoPing.' }
              : request
          )
        );
      },
      cancelRequest: (requestId, scope, note) => {
        setRequests((current) =>
          current.map((request) =>
            request.id === requestId
              ? { ...request, status: 'cancelled' as const, cancellationScope: scope, cancellationNote: note }
              : request
          )
        );
      },
      simulateFirstYes: (requestId) => {
        setRequests((current) =>
          current.map((request) => {
            if (request.id !== requestId || request.status !== 'active') return request;
            const now = new Date();
            const firstYes = findFirstYes(request.pingEvents);
            const confirmedSitterName = firstYes?.candidateName ?? request.candidates[0]?.name ?? 'Confirmed sitter';
            return {
              ...request,
              status: 'confirmed',
              firstYesAt: formatTimestamp(now),
              confirmedSitterName,
              confirmedSitterPhone: firstYes?.responderPhone ?? '(555) 013-0000',
              confirmedSitterAddress: firstYes?.responderAddress ?? 'Shared after confirmation',
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
      markPickupComplete: (requestId) => {
        setRequests((current) =>
          current.map((request) => {
            if (request.id !== requestId) return request;
            const now = addMinutes(new Date(), 35);
            return { ...request, status: 'pickup_complete', pickupCompletedAt: formatTimestamp(now) };
          })
        );
      },
      endSit: (requestId) => {
        setRequests((current) =>
          current.map((request) => {
            if (request.id !== requestId) return request;
            const now = addMinutes(new Date(), 95);
            return { ...request, status: 'completed', sitEndedAt: formatTimestamp(now) };
          })
        );
      },
      settlePoints: (requestId) => {
        setRequests((current) =>
          current.map((request) => {
            if (request.id !== requestId) return request;
            return {
              ...request,
              status: 'points_settled',
              pointsSettledAt: formatTimestamp(new Date()),
              emergencyPointBreakdown: request.presetKey === 'emergency-daycare-pickup'
                ? calculateEmergencyPoints(request.pickupCompletedAt, request.sitEndedAt)
                : undefined,
            };
          })
        );
      },
      resetMockRequests: () => setRequests([]),
    }),
    [activeRequest, activeRequests, requests]
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
