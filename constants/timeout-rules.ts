export type LocationType = 'Drop-off' | 'My Place';
export type KidCount = '1 Child' | '2+ Children';
export type AutoPingMode = 'sequential' | 'broadcast' | 'disabled';

export type SitPresetKey =
  | 'custom'
  | 'emergency-daycare-pickup'
  | 'friday-date-night'
  | 'saturday-date-night'
  | 'saturday-brunch'
  | 'sunday-home-project'
  | 'playdate'
  | 'gathering-rsvp';

export type SitPointInput = {
  durationHours: number;
  kidCount: KidCount;
  location: LocationType;
  isEmergency?: boolean;
};

export type SitPointBreakdown = {
  basePoints: number;
  kidsBonus: number;
  locationBonus: number;
  emergencyBonus: number;
  totalPoints: number;
};

export type TimeoutPreset = {
  key: SitPresetKey;
  title: string;
  subtitle: string;
  promise: string;
  icon: string;
  startHour: string;
  startMinute: string;
  ampm: 'AM' | 'PM';
  durationHour: string;
  durationMinute: string;
  location: LocationType;
  kidCount: KidCount;
  autoPingMode: AutoPingMode;
  comments: string;
  emergency?: boolean;
};

export type NotificationPreviewInput = {
  requesterName: string;
  sitterName?: string;
  title: string;
  dateLabel: string;
  startTime: string;
  duration: string;
  kidsLabel: string;
  locationLabel: string;
  pickupLocation?: string;
  confirmedPhone?: string;
};

export const POINTS_PER_HOUR = 4;
export const TWO_PLUS_CHILDREN_BONUS = 4;
export const MY_PLACE_BONUS = 4;
export const EMERGENCY_DAYCARE_PICKUP_BONUS = 6;

export function calculateSitPoints(input: SitPointInput): SitPointBreakdown {
  const basePoints = Math.round(input.durationHours * POINTS_PER_HOUR);
  const kidsBonus = input.kidCount === '2+ Children' ? TWO_PLUS_CHILDREN_BONUS : 0;
  const locationBonus = input.location === 'My Place' ? MY_PLACE_BONUS : 0;
  const emergencyBonus = input.isEmergency ? EMERGENCY_DAYCARE_PICKUP_BONUS : 0;

  return {
    basePoints,
    kidsBonus,
    locationBonus,
    emergencyBonus,
    totalPoints: basePoints + kidsBonus + locationBonus + emergencyBonus,
  };
}

export function durationToHours(durationHour: string, durationMinute: string) {
  const hours = Number(durationHour) || 0;
  const minutes = Number(durationMinute.replace(':', '')) || 0;
  return hours + minutes / 60;
}

export function buildSitRequestMessage(input: NotificationPreviewInput) {
  return `${input.requesterName} sent you a TimeOut sit request.\n\n${input.dateLabel} ${input.startTime} for ${input.duration} hours.\n${input.kidsLabel} - ${input.locationLabel}.\n\nReply YES if you can help.`;
}

export function buildEmergencyPickupMessage(input: NotificationPreviewInput) {
  return `${input.requesterName} needs emergency daycare pickup.\n\nLocation: ${input.pickupLocation || 'pickup location pending'}\nPickup: ${input.startTime}\n\nReply YES if you can help.`;
}

export function buildConfirmationMessage(input: NotificationPreviewInput) {
  return `TimeOut sit confirmed.\n\nRequester: ${input.requesterName}\nSitter: ${input.sitterName || 'confirmed sitter'}\n${input.dateLabel} ${input.startTime}\n${input.confirmedPhone ? `Phone: ${input.confirmedPhone}\n` : ''}\nReminder: cancel if plans change.`;
}

export function buildReminderMessage(input: NotificationPreviewInput, timing: '24 hours' | '2 hours') {
  return `Reminder: ${input.requesterName} and ${input.sitterName || 'your sitter'} have a TimeOut sit in ${timing}.\n\n${input.dateLabel} ${input.startTime}\nCancel if plans changed.`;
}

export const TIMEOUT_PRESETS: TimeoutPreset[] = [
  {
    key: 'friday-date-night',
    title: 'Friday Date Night',
    subtitle: 'My Place sit, 8-11:30 PM',
    promise: 'Imagine date night again.',
    icon: '♡',
    startHour: '8',
    startMinute: ':00',
    ampm: 'PM',
    durationHour: '3',
    durationMinute: ':30',
    location: 'My Place',
    kidCount: '1 Child',
    autoPingMode: 'sequential',
    comments: 'Dinner and a little breathing room.',
  },
  {
    key: 'emergency-daycare-pickup',
    title: 'Emergency Daycare Pickup',
    subtitle: 'Broadcast urgent pickup help',
    promise: 'When the day goes sideways.',
    icon: '!',
    startHour: '5',
    startMinute: ':00',
    ampm: 'PM',
    durationHour: '1',
    durationMinute: ':00',
    location: 'Drop-off',
    kidCount: '1 Child',
    autoPingMode: 'broadcast',
    comments: 'Need the first available pickup helper.',
    emergency: true,
  },
  {
    key: 'saturday-brunch',
    title: 'Saturday Brunch',
    subtitle: 'Drop-off sit, 9 AM-noon',
    promise: 'A little breathing room.',
    icon: '✿',
    startHour: '9',
    startMinute: ':00',
    ampm: 'AM',
    durationHour: '3',
    durationMinute: ':00',
    location: 'Drop-off',
    kidCount: '1 Child',
    autoPingMode: 'sequential',
    comments: 'Saturday brunch request.',
  },
  {
    key: 'sunday-home-project',
    title: 'Sunday Home Project',
    subtitle: 'Drop-off sit, 1-5 PM',
    promise: 'Get one thing finished.',
    icon: '⚒',
    startHour: '1',
    startMinute: ':00',
    ampm: 'PM',
    durationHour: '4',
    durationMinute: ':00',
    location: 'Drop-off',
    kidCount: '1 Child',
    autoPingMode: 'sequential',
    comments: 'Sunday home project request.',
  },
];

export const PRESET_BY_KEY = TIMEOUT_PRESETS.reduce<Record<string, TimeoutPreset>>((acc, preset) => {
  acc[preset.key] = preset;
  return acc;
}, {});

export const MOCK_CANDIDATES = [
  { id: 'user-a', name: 'User A', pointsBalance: -28, channel: 'app' as const },
  { id: 'user-b', name: 'User B', pointsBalance: -21, channel: 'app' as const },
  { id: 'user-c', name: 'User C', pointsBalance: -11, channel: 'app' as const },
  { id: 'user-d', name: 'User D', pointsBalance: 3, channel: 'app' as const },
  { id: 'user-e', name: 'User E', pointsBalance: 9, channel: 'app' as const },
  { id: 'user-f', name: 'User F', pointsBalance: 23, channel: 'app' as const },
  { id: 'user-g', name: 'User G', pointsBalance: 24, channel: 'app' as const },
  { id: 'grandma-pickup', name: 'Grandma pickup', pointsBalance: 0, channel: 'sms' as const },
];
