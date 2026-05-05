import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTimeoutStore } from '@/components/timeout-store';

const MEMBERS = [
  { name: 'Sara', role: 'Organizer', points: 0, kidsStage: 'Preschool', contactSaved: true, status: 'active' },
  { name: 'User B', role: 'Sitter-friend', points: 0, kidsStage: 'Preschool', contactSaved: true, status: 'active' },
  { name: 'User C', role: 'Sitter-friend', points: 0, kidsStage: 'Toddler', contactSaved: false, status: 'active' },
  { name: 'User D', role: 'Sitter-friend', points: 0, kidsStage: 'Early elementary', contactSaved: true, status: 'active' },
  { name: 'User E', role: 'Sitter-friend', points: 0, kidsStage: 'Preschool', contactSaved: false, status: 'new' },
];

function contactScore() {
  const saved = MEMBERS.filter((member) => member.contactSaved).length;
  return Math.round((saved / MEMBERS.length) * 100);
}

function healthLabel(score: number) {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Needs attention';
  return 'Fragile';
}

export default function CircleScreen() {
  const router = useRouter();
  const { requests, transfers } = useTimeoutStore();

  const stats = useMemo(() => {
    const activeRequests = requests.filter((request) => request.status === 'active').length;
    const confirmedRequests = requests.filter((request) => request.status === 'confirmed').length;
    const settledRequests = requests.filter((request) => request.status === 'points_settled' || request.status === 'past_logged').length;
    const contactReadiness = contactScore();
    const transactionCount = settledRequests + transfers.length;

    return {
      activeRequests,
      confirmedRequests,
      settledRequests,
      contactReadiness,
      transactionCount,
      health: healthLabel(contactReadiness),
    };
  }, [requests, transfers]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Circle</Text>
        <Text style={styles.title}>Blue Group</Text>
        <Text style={styles.tagline}>A healthy circle has trusted members, current phone contacts, and enough activity for points to circulate.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circle tools</Text>
        <Text style={styles.helperText}>Secondary tools live here so the phone tab bar stays simple.</Text>
        <View style={styles.toolGrid}>
          <ToolButton title="Onboarding" subtitle="First-run story" onPress={() => router.push('/onboarding')} />
          <ToolButton title="Invite Friends" subtitle="Invite vs Share" onPress={() => router.push('/invite')} />
          <ToolButton title="Ping Order" subtitle="Candidate control" onPress={() => router.push('/ping-order')} />
          <ToolButton title="Community" subtitle="Playdates + gatherings" onPress={() => router.push('/community')} />
          <ToolButton title="Safety" subtitle="Consent + legal readiness" onPress={() => router.push('/safety')} />
          <ToolButton title="Ledger" subtitle="Points + transfers" onPress={() => router.push('/ledger')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circle vital signs</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{MEMBERS.length}</Text>
            <Text style={styles.statLabel}>members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeRequests}</Text>
            <Text style={styles.statLabel}>active pings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.transactionCount}</Text>
            <Text style={styles.statLabel}>ledger actions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.contactReadiness}%</Text>
            <Text style={styles.statLabel}>contacts saved</Text>
          </View>
        </View>
        <View style={styles.healthBox}>
          <Text style={styles.healthTitle}>Health: {stats.health}</Text>
          <Text style={styles.healthText}>This is an early mock. Later, Circle Vital Signs can track response time, circle growth, points circulation, and usability issues.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        <Text style={styles.helperText}>Every member starts at zero. Zero is half full. Negative balances are normal when members are active.</Text>
        {MEMBERS.map((member) => (
          <View key={member.name} style={styles.memberCard}>
            <View style={styles.memberTopRow}>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberMeta}>{member.role} • {member.kidsStage}</Text>
              </View>
              <Text style={styles.points}>{member.points}</Text>
            </View>
            <View style={styles.badgeRow}>
              <Text style={[styles.badge, member.contactSaved ? styles.goodBadge : styles.warnBadge]}>
                {member.contactSaved ? 'Saved in contacts' : 'Needs native contact'}
              </Text>
              <Text style={styles.badge}>{member.status}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact hygiene</Text>
        <Text style={styles.helperText}>For V1, native phone contacts remain the practical address book. TimeOut should nudge members to save each other’s phone numbers for emergency calls, pickup authorization, and off-app handoff details.</Text>
        <View style={styles.todoCard}>
          <Text style={styles.todoTitle}>Meeting agenda prompt</Text>
          <Text style={styles.todoText}>“Before we leave, add every active circle member to your phone contacts.”</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recruiting continuity</Text>
        <Text style={styles.helperText}>Circles need replacements as kids age out or members become inactive. Recruiting should happen through trusted friends, not public marketplace discovery.</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>Start with 3–5 trusted families.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>Aim for 8–12 for dependable coverage.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>Recruit replacements before members leave.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>4</Text><Text style={styles.ruleText}>Keep circles private and invitation-only.</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Governance light touch</Text>
        <Text style={styles.helperText}>V1 should avoid heavy bylaws. Use gentle prompts, meeting agenda items, and clear cancellation/points rules instead of complex governance tools.</Text>
      </View>
    </ScrollView>
  );
}

function ToolButton({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable style={styles.toolButton} onPress={onPress}>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 18, paddingBottom: 40 },
  hero: { backgroundColor: '#8b2bbf', borderRadius: 28, padding: 22, marginBottom: 14 },
  kicker: { color: '#ffd5ef', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  title: { color: 'white', fontSize: 34, fontWeight: '900', marginTop: 6, lineHeight: 38 },
  tagline: { color: '#ffeaf7', fontSize: 16, marginTop: 8, lineHeight: 22 },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toolButton: { width: '48%', backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  toolTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  toolSubtitle: { color: '#76566a', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  statNumber: { color: '#8b2bbf', fontSize: 30, fontWeight: '900' },
  statLabel: { color: '#76566a', fontWeight: '800' },
  healthBox: { backgroundColor: '#f2fff7', borderColor: '#b8e8c8', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 14 },
  healthTitle: { color: '#20894d', fontWeight: '900', fontSize: 17, marginBottom: 4 },
  healthText: { color: '#35634a', lineHeight: 20 },
  memberCard: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 10 },
  memberTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  memberName: { color: '#372333', fontWeight: '900', fontSize: 17 },
  memberMeta: { color: '#76566a', marginTop: 3 },
  points: { color: '#8b2bbf', fontWeight: '900', fontSize: 22 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badge: { backgroundColor: '#f4e6ff', color: '#8b2bbf', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, fontWeight: '800', overflow: 'hidden' },
  goodBadge: { backgroundColor: '#e8fff1', color: '#20894d' },
  warnBadge: { backgroundColor: '#fff4eb', color: '#9a4b00' },
  todoCard: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  todoTitle: { color: '#372333', fontWeight: '900', marginBottom: 4 },
  todoText: { color: '#52364b', lineHeight: 20 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
});
