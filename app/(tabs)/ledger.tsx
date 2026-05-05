import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SitRequest, useTimeoutStore } from '@/components/timeout-store';
import { POINTS_PER_HOUR } from '@/constants/timeout-rules';

type LedgerEntry = {
  id: string;
  title: string;
  sitterName: string;
  requesterName: string;
  points: number;
  detail: string;
  status: string;
};

const STARTING_BALANCES = [
  { name: 'Sara', points: 10, role: 'Requester' },
  { name: 'User B', points: -21, role: 'Sitter-friend' },
  { name: 'User D', points: 3, role: 'Sitter-friend' },
  { name: 'User E', points: 9, role: 'Sitter-friend' },
];

function durationHours(duration: string) {
  const [hoursText, minutesText = '0'] = duration.split(':');
  return (Number(hoursText) || 0) + (Number(minutesText) || 0) / 60;
}

function normalSitPoints(request: SitRequest) {
  const base = Math.round(durationHours(request.duration) * POINTS_PER_HOUR);
  const kidsBonus = request.kidsLabel === '2+ Children' ? 4 : 0;
  const locationBonus = request.locationLabel === 'My Place' ? 4 : 0;
  return base + kidsBonus + locationBonus;
}

function settledPointsForRequest(request: SitRequest) {
  if (request.presetKey === 'emergency-daycare-pickup') {
    return request.emergencyPointBreakdown?.totalPoints ?? 0;
  }

  if (request.status === 'points_settled' || request.status === 'completed' || request.status === 'past_logged') {
    return normalSitPoints(request);
  }

  return 0;
}

function requestDetail(request: SitRequest) {
  if (request.presetKey === 'emergency-daycare-pickup' && request.emergencyPointBreakdown) {
    return `+${request.emergencyPointBreakdown.yesToPickupBonus} emergency bonus + ${request.emergencyPointBreakdown.pickupToEndPoints} normal sit points`;
  }

  if (request.presetKey === 'emergency-daycare-pickup') {
    return 'Emergency pickup will settle after pickup and end-sit timestamps.';
  }

  return `${request.duration} hours • ${request.kidsLabel} • ${request.locationLabel}`;
}

export default function PointsLedgerScreen() {
  const { requests } = useTimeoutStore();

  const ledgerEntries = useMemo<LedgerEntry[]>(() => {
    return requests
      .filter((request) => ['points_settled', 'completed', 'past_logged'].includes(request.status))
      .map((request) => {
        const sitterName = request.confirmedSitterName ?? 'Sitter-friend';
        const points = settledPointsForRequest(request);
        return {
          id: request.id,
          title: request.title,
          sitterName,
          requesterName: 'Sara',
          points,
          detail: requestDetail(request),
          status: request.status.replace('_', ' '),
        };
      });
  }, [requests]);

  const balances = useMemo(() => {
    const next = STARTING_BALANCES.map((member) => ({ ...member }));

    for (const entry of ledgerEntries) {
      const requester = next.find((member) => member.name === entry.requesterName);
      const sitter = next.find((member) => member.name === entry.sitterName);

      if (requester) requester.points -= entry.points;
      else next.push({ name: entry.requesterName, points: -entry.points, role: 'Requester' });

      if (sitter) sitter.points += entry.points;
      else next.push({ name: entry.sitterName, points: entry.points, role: 'Sitter-friend' });
    }

    return next.sort((a, b) => a.points - b.points);
  }, [ledgerEntries]);

  const totalMoved = ledgerEntries.reduce((sum, entry) => sum + entry.points, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Points Ledger</Text>
        <Text style={styles.title}>The points will work out.</Text>
        <Text style={styles.tagline}>Sits create a simple zero-sum record: requester spends points, sitter earns points.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ledger summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{ledgerEntries.length}</Text>
            <Text style={styles.summaryLabel}>settled entries</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalMoved}</Text>
            <Text style={styles.summaryLabel}>points moved</Text>
          </View>
        </View>
        <Text style={styles.helperText}>Corrections should use Transfer Points later. V1 avoids editing posted sits.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posted sits</Text>
        {ledgerEntries.length > 0 ? (
          ledgerEntries.map((entry) => (
            <View key={entry.id} style={styles.ledgerCard}>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryDetail}>{entry.detail}</Text>
              <View style={styles.transferRow}>
                <Text style={styles.debit}>Sara -{entry.points}</Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.credit}>{entry.sitterName} +{entry.points}</Text>
              </View>
              <Text style={styles.statusText}>{entry.status}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.entryTitle}>No points posted yet</Text>
            <Text style={styles.entryDetail}>Complete a sit or settle an emergency pickup to see ledger entries here.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Member balances</Text>
        <Text style={styles.helperText}>Lowest balances appear first because AutoPing uses point circulation, not a fairness claim.</Text>
        {balances.map((member) => (
          <View key={member.name} style={styles.balanceRow}>
            <View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <Text style={[styles.balanceValue, member.points < 0 ? styles.negative : styles.positive]}>
              {member.points > 0 ? `+${member.points}` : member.points}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transfer Points placeholder</Text>
        <Text style={styles.helperText}>Future correction flow: one member transfers points to another with a short note. This handles errors without editing completed sits.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 18, paddingBottom: 40 },
  hero: { backgroundColor: '#8b2bbf', borderRadius: 28, padding: 22, marginBottom: 16 },
  kicker: { color: '#ffd5ef', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  title: { color: 'white', fontSize: 31, fontWeight: '900', marginTop: 6, lineHeight: 36 },
  tagline: { color: '#ffeaf7', fontSize: 16, marginTop: 8, lineHeight: 22 },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  summaryNumber: { color: '#8b2bbf', fontSize: 34, fontWeight: '900' },
  summaryLabel: { color: '#76566a', fontWeight: '800' },
  ledgerCard: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 10 },
  emptyCard: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 10 },
  entryTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  entryDetail: { color: '#76566a', marginTop: 4, lineHeight: 20 },
  transferRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 },
  debit: { color: '#9a1f1f', fontWeight: '900' },
  arrow: { color: '#76566a', fontWeight: '900' },
  credit: { color: '#20894d', fontWeight: '900' },
  statusText: { color: '#76566a', fontSize: 12, fontWeight: '800', marginTop: 8, textTransform: 'uppercase' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0d8e7' },
  memberName: { color: '#372333', fontWeight: '900', fontSize: 16 },
  memberRole: { color: '#76566a', marginTop: 2 },
  balanceValue: { fontSize: 18, fontWeight: '900' },
  negative: { color: '#9a1f1f' },
  positive: { color: '#20894d' },
});
