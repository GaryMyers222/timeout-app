import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTimeoutStore } from '@/components/timeout-store';

export default function PingStatusScreen() {
  const { activeRequest, cancelActiveRequest, requests } = useTimeoutStore();
  const displayRequest = activeRequest ?? requests[0] ?? null;
  const pingEvents = displayRequest?.pingEvents ?? [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>AutoPing</Text>
        <Text style={styles.title}>Ping status</Text>
        <Text style={styles.tagline}>First YES wins. Everyone else gets a polite filled message.</Text>
      </View>

      <View style={styles.section}>
        {displayRequest ? (
          <>
            <Text style={styles.sectionTitle}>{displayRequest.title}</Text>
            <Text style={styles.helperText}>
              {displayRequest.dateLabel} • {displayRequest.startTime} • {displayRequest.duration} hours • {displayRequest.locationLabel}
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{displayRequest.status.replace('_', ' ')}</Text>
            </View>
            {displayRequest.status === 'active' ? (
              <Pressable style={styles.secondaryButton} onPress={cancelActiveRequest}>
                <Text style={styles.secondaryText}>Cancel Active AutoPing</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>No active request yet</Text>
            <Text style={styles.helperText}>Create a preset or custom sit request from the Request tab.</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryText}>Refresh Ping Status</Text>
        </Pressable>
        <Text style={styles.sectionTitle}>Ping progress</Text>
        {pingEvents.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.nameCell]}>Contact</Text>
              <Text style={styles.headerCell}>Sent</Text>
              <Text style={styles.headerCell}>Status</Text>
            </View>
            {pingEvents.map((row) => (
              <View key={`${row.candidateName}-${row.sentAt}`} style={styles.tableRow}>
                <Text style={[styles.cell, styles.nameCell]}>{row.candidateName}</Text>
                <Text style={styles.cell}>{row.sentAt}</Text>
                <Text style={[styles.cell, row.status === 'YES' && styles.yes]}>{row.status}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.helperText}>Past sits and disabled AutoPing entries have no ping progress.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active and recent requests</Text>
        <Text style={styles.helperText}>V1 allows one active AutoPing per day. Same-day conflicts should ask the requester to wait or cancel and continue.</Text>
        {requests.length > 0 ? (
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <Text style={styles.requestTitle}>{request.title}</Text>
              <Text style={styles.requestDetail}>{request.dateLabel} • {request.startTime} • {request.status.replace('_', ' ')}</Text>
            </View>
          ))
        ) : (
          <View style={styles.requestCard}>
            <Text style={styles.requestTitle}>No requests yet</Text>
            <Text style={styles.requestDetail}>Your test requests will appear here after you tap Start AutoPing.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminder rules</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>Send confirmation after first YES.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>Send reminder 24 hours before sit start.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>Send reminder 2 hours before sit start.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>4</Text><Text style={styles.ruleText}>Both requester and sitter may cancel before points post.</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 18, paddingBottom: 40 },
  hero: { backgroundColor: '#8b2bbf', borderRadius: 28, padding: 22, marginBottom: 16 },
  kicker: { color: '#ffd5ef', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  title: { color: 'white', fontSize: 34, fontWeight: '900', marginTop: 6 },
  tagline: { color: '#ffeaf7', fontSize: 16, marginTop: 8 },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  primaryButton: { backgroundColor: '#8b2bbf', padding: 16, borderRadius: 18, alignItems: 'center', marginBottom: 16 },
  primaryText: { color: 'white', fontWeight: '900', fontSize: 17 },
  secondaryButton: { backgroundColor: '#fff0f7', borderColor: '#e3bfd6', borderWidth: 1, padding: 14, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  secondaryText: { color: '#8b2bbf', fontWeight: '900' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  statusPill: { alignSelf: 'flex-start', backgroundColor: '#f4e6ff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  statusText: { color: '#8b2bbf', fontWeight: '900', textTransform: 'uppercase' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e3bfd6', paddingBottom: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0d8e7', paddingVertical: 12 },
  headerCell: { flex: 1, color: '#76566a', fontWeight: '900' },
  cell: { flex: 1, color: '#372333', fontWeight: '700' },
  nameCell: { flex: 1.4 },
  yes: { color: '#20894d', fontWeight: '900' },
  requestCard: { backgroundColor: '#fffafd', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#ead2e2', marginTop: 10 },
  requestTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  requestDetail: { color: '#76566a', marginTop: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700' },
});
