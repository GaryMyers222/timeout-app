import React, { createContext, useContext, useMemo, useState } from 'react';

export type InviteStatus = 'draft' | 'sms_ready' | 'sms_opened' | 'accepted' | 'expired' | 'cancelled';
export type InviteSource = 'contacts' | 'manual' | 'mock';

export type CircleMember = {
  id: string;
  firstName: string;
  phone: string;
  joinedAt: string;
  invitedByName: string;
};

export type CircleInvite = {
  id: string;
  circleId: string;
  circleName: string;
  inviteeName: string;
  inviteePhone: string;
  invitedByName: string;
  invitedByPhone: string;
  status: InviteStatus;
  source: InviteSource;
  inviteLink: string;
  smsBody: string;
  createdAt: string;
  smsOpenedAt?: string;
  acceptedAt?: string;
};

type CreateInviteInput = {
  inviteeName: string;
  inviteePhone: string;
  source: InviteSource;
};

type InviteStoreValue = {
  circleId: string;
  circleName: string;
  invitedByName: string;
  invites: CircleInvite[];
  members: CircleMember[];
  pendingInvites: CircleInvite[];
  acceptedInvites: CircleInvite[];
  createInvites: (inputs: CreateInviteInput[]) => CircleInvite[];
  markSmsOpened: (inviteId: string) => void;
  acceptInviteByPhone: (inviteId: string, phone: string, firstName: string) => CircleMember | null;
  cancelInvite: (inviteId: string) => void;
  resetInvites: () => void;
};

const InviteStoreContext = createContext<InviteStoreValue | null>(null);

const DEFAULT_CIRCLE_ID = 'default-circle';
const DEFAULT_CIRCLE_NAME = 'Westside Circle';
const DEFAULT_INVITER_NAME = 'Sarah';
const DEFAULT_INVITER_PHONE = '(555) 013-1000';

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9+]/g, '');
}

function buildInviteId(phone: string, createdAt: Date) {
  const safePhone = normalizePhone(phone).slice(-4) || 'invite';
  return `invite-${safePhone}-${createdAt.getTime()}`;
}

function buildInviteLink(inviteId: string) {
  return `https://timeout.example/invite/${inviteId}`;
}

function buildSmsBody(inviteeName: string, invitedByName: string, inviteLink: string) {
  const firstName = inviteeName.split(' ')[0] || inviteeName || 'there';
  return `Hi ${firstName} — ${invitedByName} invited you to join their private TimeOut babysitting circle. TimeOut helps trusted friends trade occasional babysitting. No strangers, no public listing, no credit card needed. Open your invite: ${inviteLink}`;
}

function createInviteRecord(input: CreateInviteInput): CircleInvite {
  const now = new Date();
  const inviteId = buildInviteId(input.inviteePhone, now);
  const inviteLink = buildInviteLink(inviteId);

  return {
    id: inviteId,
    circleId: DEFAULT_CIRCLE_ID,
    circleName: DEFAULT_CIRCLE_NAME,
    inviteeName: input.inviteeName,
    inviteePhone: input.inviteePhone,
    invitedByName: DEFAULT_INVITER_NAME,
    invitedByPhone: DEFAULT_INVITER_PHONE,
    status: 'sms_ready',
    source: input.source,
    inviteLink,
    smsBody: buildSmsBody(input.inviteeName, DEFAULT_INVITER_NAME, inviteLink),
    createdAt: now.toISOString(),
  };
}

export function InviteStoreProvider({ children }: { children: React.ReactNode }) {
  const [invites, setInvites] = useState<CircleInvite[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);

  const value = useMemo<InviteStoreValue>(() => ({
    circleId: DEFAULT_CIRCLE_ID,
    circleName: DEFAULT_CIRCLE_NAME,
    invitedByName: DEFAULT_INVITER_NAME,
    invites,
    members,
    pendingInvites: invites.filter((invite) => invite.status === 'sms_ready' || invite.status === 'sms_opened'),
    acceptedInvites: invites.filter((invite) => invite.status === 'accepted'),
    createInvites: (inputs) => {
      const nextInvites = inputs.map(createInviteRecord);
      setInvites((current) => [...nextInvites, ...current]);
      return nextInvites;
    },
    markSmsOpened: (inviteId) => {
      setInvites((current) => current.map((invite) =>
        invite.id === inviteId
          ? { ...invite, status: 'sms_opened' as const, smsOpenedAt: new Date().toISOString() }
          : invite
      ));
    },
    acceptInviteByPhone: (inviteId, phone, firstName) => {
      const matchingInvite = invites.find((invite) =>
        invite.id === inviteId && normalizePhone(invite.inviteePhone) === normalizePhone(phone)
      );

      if (!matchingInvite) return null;

      const now = new Date();
      const nextMember: CircleMember = {
        id: `member-${now.getTime()}`,
        firstName,
        phone,
        joinedAt: now.toISOString(),
        invitedByName: matchingInvite.invitedByName,
      };

      setMembers((current) => [nextMember, ...current]);
      setInvites((current) => current.map((invite) =>
        invite.id === inviteId
          ? { ...invite, status: 'accepted' as const, acceptedAt: now.toISOString() }
          : invite
      ));

      return nextMember;
    },
    cancelInvite: (inviteId) => {
      setInvites((current) => current.map((invite) =>
        invite.id === inviteId ? { ...invite, status: 'cancelled' as const } : invite
      ));
    },
    resetInvites: () => {
      setInvites([]);
      setMembers([]);
    },
  }), [invites, members]);

  return <InviteStoreContext.Provider value={value}>{children}</InviteStoreContext.Provider>;
}

export function useInviteStore() {
  const context = useContext(InviteStoreContext);

  if (!context) {
    throw new Error('useInviteStore must be used inside InviteStoreProvider');
  }

  return context;
}
