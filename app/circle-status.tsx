import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useInviteStore } from '@/components/invite-store';

function formatStatus(status: string) {
  return status.replace('_', ' ').toUpperCase();
}

export default function CircleStatusScreen() {
  const router = useRouter();
  const { circleName, invites, pendingInvites, acceptedInvites, members, resetInvites } = useInviteStore();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>PRIVATE CIRCLE</Text>
        <Text style={styles.title}>{circleName}</Text>
        <Text style={styles.bodyText}>
          This draft status screen makes the invite records and joined members visible after the invite flow.
        </Text>
        <View style={styles.statRow}>
          <StatCard label="Members" value={members.length} />
          <StatCard label="Pending" value={pendingInvites.length} />
          <StatCard label="Accepted" value={acceptedInvites.length} />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Circle readiness</Text>
        <Text style={styles.bodyText}>
          Start with 3–4 trusted families. Custom Sit Request is still a draft and remains a high-priority next build target.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/invite-friends')}>
          <Text style={styles.primaryButtonText}>Invite trusted friends</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Members</Text>
        {members.length === 0 ? (
          <Text style={styles.emptyText}>No members have joined through the mock invite flow yet.</Text>
        ) : members.map((member) => (
          <View key={member.id} style={styles.listCard}>
            <Text style={styles.listTitle}>{member.firstName}</Text>
            <Text style={styles.listSubtext}>{member.phone}</Text>
            <Text style={styles.listMeta}>Invited by {member.invitedByName}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Invite records</Text>
        {invites.length === 0 ? (
          <Text style={styles.emptyText}>No invite records yet. Create them from Build Your Circle.</Text>
        ) : invites.map((invite) => (
          <View key={invite.id} style={styles.listCard}>
            <Text style={styles.listTitle}>{invite.inviteeName}</Text>
            <Text style={styles.listSubtext}>{invite.inviteePhone}</Text>
            <Text style={styles.statusPill}>{formatStatus(invite.status)}</Text>
            <Text style={styles.listMeta}>{invite.inviteLink}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Draft controls</Text>
        <Text style={styles.bodyText}>This reset is only for mock testing while the backend is not wired.</Text>
        <Pressable style={styles.secondaryButton} onPress={resetInvites}>
          <Text style={styles.secondaryButtonText}>Reset mock invites and members</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff6fb' },
  content: { padding: 18, paddingBottom: 42 },
  heroCard: { backgroundColor: '#ffffff', borderColor: '#f4c3dd', borderRadius: 28, borderWidth: 1, marginBottom: 16, padding: 18, shadowColor: '#7e2061', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18 },
  kicker: { color: '#be185d', fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginBottom: 8 },
  title: { color: '#4a1038', fontSize: 31, fontWeight: '900', lineHeight: 36, marginBottom: 10 },
  bodyText: { color: '#7b4a65', fontSize: 16, lineHeight: 23, marginBottom: 12 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  statCard: { flex: 1, backgroundColor: '#fff0f7', borderColor: '#f0a8cd', borderRadius: 18, borderWidth: 1, padding: 12 },
  statValue: { color: '#be185d', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  statLabel: { color: '#7b4a65', fontSize: 12, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' },
  sectionCard: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 24, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { color: '#4a1038', fontSize: 21, fontWeight: '900', marginBottom: 8 },
  listCard: { backgroundColor: '#fffafd', borderColor: '#f0d8e7', borderRadius: 18, borderWidth: 1, marginBottom: 10, padding: 13 },
  listTitle: { color: '#4a1038', fontSize: 16, fontWeight: '900' },
  listSubtext: { color: '#7b4a65', fontSize: 14, marginTop: 3 },
  listMeta: { color: '#8a1859', fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 6 },
  statusPill: { alignSelf: 'flex-start', backgroundColor: '#fff0f7', borderRadius: 999, color: '#be185d', fontSize: 12, fontWeight: '900', marginTop: 8, paddingHorizontal: 9, paddingVertical: 5 },
  emptyText: { color: '#7b4a65', fontSize: 15, fontWeight: '700', lineHeight: 21 },
  primaryButton: { backgroundColor: '#be185d', borderRadius: 20, padding: 17, marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 8 },
  secondaryButtonText: { color: '#8a1859', fontSize: 16, fontWeight: '900', textAlign: 'center' },
});
