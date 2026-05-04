import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTimeoutStore } from '@/components/timeout-store';

export default function StatusScreen() {
  const router = useRouter();
  const { activeRequest, requests, cancelActiveRequest } = useTimeoutStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>STATUS SCREEN</Text>
      <Text style={styles.title}>One-tap AutoPing finds the first YES.</Text>

      {activeRequest ? (
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>ACTIVE REQUEST</Text>
          <Text style={styles.heroTitle}>{activeRequest.title}</Text>
          <Text style={styles.heroMeta}>
            {activeRequest.dateLabel} at {activeRequest.startTime} for {activeRequest.duration}
          </Text>
          <Text style={styles.heroMeta}>
            {activeRequest.kidsLabel} • {activeRequest.locationLabel}
          </Text>
          <Text style={styles.modeBadge}>
            {activeRequest.autoPingMode === 'broadcast' ? 'Broadcast AutoPing' : 'Sequential AutoPing'}
          </Text>

          <Text style={styles.sectionLabel}>Candidate Order</Text>
          {activeRequest.candidates.map((candidate, index) => (
            <View key={candidate.id} style={styles.candidateRow}>
              <Text style={styles.candidateRank}>{index + 1}</Text>
              <View style={styles.candidateCopy}>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <Text style={styles.candidateMeta}>
                  {candidate.channel === 'sms' ? 'Non-app / SMS' : 'In app'} • Balance {candidate.pointsBalance}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              cancelActiveRequest();
              router.push('/');
            }}>
            <Text style={styles.cancelButtonText}>Cancel AutoPing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No active AutoPing right now</Text>
          <Text style={styles.emptyCopy}>
            Create a sit request to launch the debt-first candidate flow or log a past sit directly to the ledger.
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={() => router.push('/')}>
            <Text style={styles.createButtonText}>Create New Request</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionLabel}>Recent Activity</Text>
      {requests.slice(0, 4).map((request) => (
        <View key={request.id} style={styles.historyCard}>
          <Text style={styles.historyTitle}>{request.title}</Text>
          <Text style={styles.historyMeta}>
            {request.dateLabel} • {request.startTime} • {request.duration}
          </Text>
          <Text style={styles.historyStatus}>
            {request.status === 'past_logged'
              ? 'Past sit logged to ledger'
              : request.status === 'cancelled'
                ? 'Cancelled'
                : request.status === 'active'
                  ? 'AutoPing running'
                  : request.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  eyebrow: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 10,
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 18,
  },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    marginBottom: 24,
    padding: 20,
  },
  heroLabel: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroMeta: {
    color: '#cbd5e1',
    fontSize: 15,
    marginBottom: 4,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#164e63',
    borderRadius: 999,
    color: '#cffafe',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 18,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 10,
    marginTop: 4,
  },
  candidateRow: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  candidateRank: {
    color: '#67e8f9',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 14,
    width: 20,
  },
  candidateCopy: {
    flex: 1,
  },
  candidateName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  candidateMeta: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    borderRadius: 14,
    marginTop: 12,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    padding: 20,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyCopy: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 14,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  historyTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyMeta: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 4,
  },
  historyStatus: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
});
