import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CircleInvite, useInviteStore } from '@/components/invite-store';

function pickPreviewInvite(invites: CircleInvite[]) {
  return invites.find((invite) => invite.status === 'sms_ready' || invite.status === 'sms_opened') ?? invites[0] ?? null;
}

export default function InviteePreviewScreen() {
  const router = useRouter();
  const { circleName, invitedByName, pendingInvites, invites, acceptInviteByPhone, members } = useInviteStore();
  const [step, setStep] = useState(0);
  const previewInvite = useMemo(() => pickPreviewInvite(pendingInvites.length ? pendingInvites : invites), [invites, pendingInvites]);
  const [phone, setPhone] = useState(previewInvite?.inviteePhone ?? '');
  const [firstName, setFirstName] = useState(previewInvite?.inviteeName?.split(' ')[0] ?? '');
  const [joinMessage, setJoinMessage] = useState('');

  const inviterDisplay = previewInvite?.invitedByName ?? invitedByName;
  const circleDisplay = previewInvite?.circleName ?? circleName;
  const inviteeDisplay = previewInvite?.inviteeName ?? 'you';

  function joinCircle() {
    if (!previewInvite) {
      setJoinMessage('No pending invite record exists yet. Create invite records from the inviter flow first.');
      return;
    }

    const member = acceptInviteByPhone(previewInvite.id, phone, firstName || inviteeDisplay.split(' ')[0] || 'Friend');
    if (!member) {
      setJoinMessage('Phone number did not match this invite. In production, phone verification will protect private circles.');
      return;
    }

    setJoinMessage(`${member.firstName} joined ${circleDisplay}.`);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.progressRow}>
        {[0, 1, 2].map((dot) => <View key={dot} style={[styles.progressDot, step >= dot && styles.progressDotActive]} />)}
      </View>

      {!previewInvite ? (
        <View style={styles.noticeCard}>
          <Text style={styles.kicker}>NO INVITE RECORD YET</Text>
          <Text style={styles.title}>Create an invite first</Text>
          <Text style={styles.bodyText}>The invitee preview now reads from the mock invite store. Go through Build Your Circle, select contacts, and create invite records. Then this screen can preview the first pending invite.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/invite-friends')}>
            <Text style={styles.primaryButtonText}>Create invite records</Text>
          </Pressable>
        </View>
      ) : null}

      {previewInvite && step === 0 ? (
        <View>
          <Text style={styles.kicker}>PRIVATE INVITE</Text>
          <Text style={styles.title}>{inviterDisplay} invited {inviteeDisplay} to {circleDisplay}</Text>
          <Text style={styles.bodyText}>
            TimeOut helps trusted friends trade occasional babysitting. This is not a babysitter marketplace.
          </Text>
          <View style={styles.inviteRecordCard}>
            <Text style={styles.recordLabel}>Invite record</Text>
            <Text style={styles.recordText}>{previewInvite.id}</Text>
            <Text style={styles.recordText}>{previewInvite.status} • {previewInvite.inviteePhone}</Text>
            <Text style={styles.recordLink}>{previewInvite.inviteLink}</Text>
          </View>
          <View style={styles.trustPanel}>
            <TrustBullet text="No strangers." />
            <TrustBullet text="No public listing." />
            <TrustBullet text="No credit card needed." />
            <TrustBullet text="You can say yes only when it works for you." />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => setStep(1)}>
            <Text style={styles.primaryButtonText}>See how it works</Text>
          </Pressable>
        </View>
      ) : null}

      {previewInvite && step === 1 ? (
        <View>
          <Text style={styles.kicker}>HOW TIMEOUT WORKS</Text>
          <Text style={styles.title}>Help without searching one person at a time</Text>
          <Text style={styles.bodyText}>
            When someone needs help, TimeOut reaches out to trusted members in the private circle. First YES confirms the sitter and updates everyone else.
          </Text>
          <View style={styles.explainCard}>
            <Text style={styles.explainTitle}>You are never required to accept a sit.</Text>
            <Text style={styles.explainText}>The circle works because everyone wants TimeOut, and members help when it fits real life.</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => setStep(2)}>
            <Text style={styles.primaryButtonText}>Join this circle</Text>
          </Pressable>
        </View>
      ) : null}

      {previewInvite && step === 2 ? (
        <View>
          <Text style={styles.kicker}>CONFIRM INVITE</Text>
          <Text style={styles.title}>Confirm your private invite</Text>
          <Text style={styles.bodyText}>
            Use your phone number to confirm this invite belongs to you and help keep the circle private.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#9c6a82"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor="#9c6a82"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Pressable style={styles.primaryButton} onPress={joinCircle}>
            <Text style={styles.primaryButtonText}>Confirm and join</Text>
          </Pressable>
          {joinMessage ? (
            <View style={styles.explainCard}>
              <Text style={styles.explainTitle}>{joinMessage}</Text>
              <Text style={styles.explainText}>Members in mock store: {members.length}. You’ll see sit requests from trusted friends and can say yes when it works for you.</Text>
            </View>
          ) : null}
          <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.secondaryButtonText}>View Circle</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

function TrustBullet({ text }: { text: string }) {
  return (
    <View style={styles.trustBulletRow}>
      <Text style={styles.trustBulletIcon}>✓</Text>
      <Text style={styles.trustBulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff6fb' },
  content: { padding: 18, paddingBottom: 42 },
  progressRow: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  progressDot: { flex: 1, height: 5, borderRadius: 999, backgroundColor: '#f1cfe2' },
  progressDotActive: { backgroundColor: '#be185d' },
  kicker: { color: '#be185d', fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginBottom: 8 },
  title: { color: '#4a1038', fontSize: 31, fontWeight: '900', lineHeight: 36, marginBottom: 10 },
  bodyText: { color: '#7b4a65', fontSize: 16, lineHeight: 23, marginBottom: 16 },
  noticeCard: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 24, borderWidth: 1, padding: 18 },
  trustPanel: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 22, borderWidth: 1, padding: 14, marginBottom: 14 },
  trustBulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  trustBulletIcon: { color: '#be185d', fontSize: 16, fontWeight: '900', marginRight: 10 },
  trustBulletText: { color: '#63324f', flex: 1, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  inviteRecordCard: { backgroundColor: '#ffffff', borderColor: '#f0d8e7', borderRadius: 20, borderWidth: 1, marginBottom: 14, padding: 14 },
  recordLabel: { color: '#be185d', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },
  recordText: { color: '#4a1038', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  recordLink: { color: '#8a1859', fontSize: 13, fontWeight: '700', lineHeight: 19 },
  explainCard: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 22, borderWidth: 1, padding: 16, marginBottom: 14 },
  explainTitle: { color: '#4a1038', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  explainText: { color: '#7b4a65', fontSize: 15, lineHeight: 22 },
  input: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 16, borderWidth: 1, color: '#4a1038', fontSize: 16, marginBottom: 10, padding: 14 },
  primaryButton: { backgroundColor: '#be185d', borderRadius: 20, padding: 17, marginTop: 12, marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 8 },
  secondaryButtonText: { color: '#8a1859', fontSize: 16, fontWeight: '900', textAlign: 'center' },
});
