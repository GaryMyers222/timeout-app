import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PointTransfer, SitRequest, useTimeoutStore } from '@/components/timeout-store';
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

const BALANCE_CAP = 80;

const STARTING_BALANCES = [
  { name: 'Sara', points: 0, role: 'Requester' },
  { name: 'User B', points: 0, role: 'Sitter-friend' },
  { name: 'User D', points: 0, role: 'Sitter-friend' },
  { name: 'User E', points: 0, role: 'Sitter-friend' },
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

function capStatus(points: number) {
  if (points <= -BALANCE_CAP) return 'At lower cap';
  if (points >= BALANCE_CAP) return 'At upper cap';
  if (points < 0) return 'Healthy debt if active';
  if (points === 0) return 'Half full';
  return 'Available surplus';
}

function capPercent(points: number) {
  return Math.min(100, Math.round((Math.abs(points) / BALANCE_CAP) * 100));
}

function applyTransferToBalances(
  members: Array<{ name: string; points: number; role: string }>,
  transfer: PointTransfer
) {
  const from = members.find((member) => member.name === transfer.fromMemberName);
  const to = members.find((member) => member.name === transfer.toMemberName);

  if (from) from.points -= transfer.points;
  else members.push({ name: transfer.fromMemberName, points: -transfer.points, role: 'Member' });

  if (to) to.points += transfer.points;
  else members.push({ name: transfer.toMemberName, points: transfer.points, role: 'Member' });
}

export default function PointsLedgerScreen() {
  const { createTransfer, requests, transfers } = useTimeoutStore();
  const [fromMemberName, setFromMemberName] = useState('Sara');
  const [toMemberName, setToMemberName] = useState('User B');
  const [transferPoints, setTransferPoints] = useState('4');
  const [transferNote, setTransferNote] = useState('Correction after sit details changed off app.');
  const [transferMessage, setTransferMessage] = useState('');

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

    for (const transfer of transfers) {
      applyTransferToBalances(next, transfer);
    }

    return next.sort((a, b) => a.points - b.points);
  }, [ledgerEntries, transfers]);

  const totalMoved = ledgerEntries.reduce((sum, entry) => sum + entry.points, 0);
  const totalTransferred = transfers.reduce((sum, transfer) => sum + transfer.points, 0);

  function handleTransfer() {
    const points = Number(transferPoints);

    if (!fromMemberName.trim() || !toMemberName.trim()) {
      setTransferMessage('Add both member names before posting a transfer.');
      return;
    }

    if (fromMemberName.trim() === toMemberName.trim()) {
      setTransferMessage('Choose two different members.');
      return;
    }

    if (!Number.isFinite(points) || points <= 0) {
      setTransferMessage('Transfer points must be a positive number.');
      return;
    }

    createTransfer(fromMemberName.trim(), toMemberName.trim(), Math.round(points), transferNote.trim() || 'Point correction');
    setTransferMessage(`Transferred ${Math.round(points)} points from ${fromMemberName.trim()} to ${toMemberName.trim()}.`);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Points Ledger</Text>
        <Text style={styles.title}>Zero is half full.</Text>
        <Text style={styles.tagline}>Every member starts at zero. Requesting sits and going negative is normal when the circle is active.</Text>
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
            <Text style={styles.summaryLabel}>sit points moved</Text>
          </View>
        </View>
        <View style={styles.summaryCardWide}>
          <Text style={styles.summaryNumber}>{totalTransferred}</Text>
          <Text style={styles.summaryLabel}>correction points transferred</Text>
        </View>
        <Text style={styles.helperText}>Balances are capped at -80 and +80. Corrections use Transfer Points; V1 avoids editing posted sits.</Text>
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
        <Text style={styles.sectionTitle}>Transfer Points correction</Text>
        <Text style={styles.helperText}>Use this when a posted sit needs correction. The original sit remains immutable and the transfer explains the adjustment.</Text>
        <Text style={styles.inputLabel}>From</Text>
        <TextInput style={styles.input} value={fromMemberName} onChangeText={setFromMemberName} />
        <Text style={styles.inputLabel}>To</Text>
        <TextInput style={styles.input} value={toMemberName} onChangeText={setToMemberName} />
        <Text style={styles.inputLabel}>Points</Text>
        <TextInput style={styles.input} value={transferPoints} onChangeText={setTransferPoints} keyboardType="numeric" />
        <Text style={styles.inputLabel}>Note</Text>
        <TextInput style={[styles.input, styles.noteInput]} value={transferNote} onChangeText={setTransferNote} multiline />
        <Pressable style={styles.transferButton} onPress={handleTransfer}>
          <Text style={styles.transferButtonText}>Post Transfer Points</Text>
        </Pressable>
        {transferMessage ? <Text style={styles.transferMessage}>{transferMessage}</Text> : null}
      </View>

      {transfers.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transfer history</Text>
          {transfers.map((transfer) => (
            <View key={transfer.id} style={styles.ledgerCard}>
              <View style={styles.transferRow}>
                <Text style={styles.debit}>{transfer.fromMemberName} -{transfer.points}</Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.credit}>{transfer.toMemberName} +{transfer.points}</Text>
              </View>
              <Text style={styles.entryDetail}>{transfer.note}</Text>
              <Text style={styles.statusText}>correction transfer</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Member balances</Text>
        <Text style={styles.helperText}>Lowest balances appear first because AutoPing uses point circulation. Negative points are not a problem when a member stays active.</Text>
        {balances.map((member) => (
          <View key={member.name} style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
              <Text style={[styles.balanceValue, member.points < 0 ? styles.negative : member.points > 0 ? styles.positive : styles.zero]}>
                {member.points > 0 ? `+${member.points}` : member.points}
              </Text>
            </View>
            <View style={styles.capTrack}>
              <View style={[styles.capFill, member.points < 0 ? styles.negativeFill : styles.positiveFill, { width: `${capPercent(member.points)}%` }]} />
            </View>
            <Text style={styles.capText}>{capStatus(member.points)} • cap ±{BALANCE_CAP}</Text>
          </View>
        ))}
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
  summaryCardWide: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
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
  inputLabel: { color: '#8b2bbf', fontWeight: '900', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 14, color: '#372333', padding: 12 },
  noteInput: { minHeight: 72, textAlignVertical: 'top' },
  transferButton: { backgroundColor: '#8b2bbf', borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 14 },
  transferButtonText: { color: 'white', fontWeight: '900' },
  transferMessage: { color: '#20894d', fontWeight: '800', marginTop: 10 },
  balanceCard: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0d8e7' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberName: { color: '#372333', fontWeight: '900', fontSize: 16 },
  memberRole: { color: '#76566a', marginTop: 2 },
  balanceValue: { fontSize: 18, fontWeight: '900' },
  negative: { color: '#9a1f1f' },
  positive: { color: '#20894d' },
  zero: { color: '#8b2bbf' },
  capTrack: { backgroundColor: '#f4e6ff', borderRadius: 999, height: 8, marginTop: 10, overflow: 'hidden' },
  capFill: { borderRadius: 999, height: 8 },
  negativeFill: { backgroundColor: '#d46a6a' },
  positiveFill: { backgroundColor: '#4cb878' },
  capText: { color: '#76566a', fontSize: 12, fontWeight: '800', marginTop: 6 },
});
