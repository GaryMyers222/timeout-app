import React, { createContext, useContext, useMemo, useState } from 'react';

export type AutoPingMode = 'sequential' | 'broadcast' | 'disabled';

export type SitPresetKey =
  | 'custom'
  | 'emergency-daycare-pickup'
  | 'friday-date-night'
  | 'saturday-date-night'
  | 'playdate'
  | 'gathering-rsvp';

export type Candidate = {
  id: string;
  name: string;
  pointsBalance: number;
  channel: 'app' | 'sms';
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
  status: 'draft' | 'active' | 'confirmed' | 'timed_out' | 'past_logged' | 'cancelled';
  candidates: Candidate[];
};

type CreateSitRequestInput = Omit<SitRequest, 'id' | 'createdAt' | 'status' | 'candidates'>;

type TimeoutStoreValue = {
  requests: SitRequest[];
  activeRequest: SitRequest | null;
  createRequest: (input: CreateSitRequestInput) => SitRequest;
  cancelActiveRequest: () => void;
};

const defaultCandidates: Candidate[] = [
  { id: 'mia', name: 'Mia', pointsBalance: -9, channel: 'app' },
  { id: 'jules', name: 'Jules', pointsBalance: -6, channel: 'app' },
  { id: 'grandma-rose', name: 'Grandma Rose', pointsBalance: 0, channel: 'sms' },
  { id: 'nina', name: 'Nina', pointsBalance: 4, channel: 'app' },
];

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
        const nextStatus = input.isPastSit ? 'past_logged' : 'active';
        const nextRequest: SitRequest = {
          ...input,
          id: `${now.getTime()}`,
          createdAt: now.toISOString(),
          status: nextStatus,
          candidates:
            input.autoPingMode === 'disabled' ? [] : sortCandidatesByDebt(defaultCandidates),
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
