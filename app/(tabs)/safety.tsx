import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const CHECKS = [
  {
    id: 'private-circle',
    title: 'Private circle only',
    body: 'TimeOut coordinates trusted friends. It is not a babysitter marketplace and does not connect strangers.',
  },
  {
    id: 'parent-duty',
    title: 'Parent selection responsibility',
    body: 'Parents remain responsible for deciding who may care for their children and whether a setting is appropriate.',
  },
  {
    id: 'native-contacts',
    title: 'Keep native contacts current',
    body: 'Phone calls, pickup authorization, addresses, and urgent handoff details remain mostly off app in V1.',
  },
  {
    id: 'sms-consent',
    title: 'SMS / notification consent',
    body: 'Users should understand that TimeOut may send sit requests, confirmations, reminders, and emergency pickup updates by push or SMS.',
  },
];

const LEGAL_WORKLIST = [
  'Terms of Use',
  'Privacy Policy',
  'SMS consent language',
  'Liability disclaimer',
  'Parent responsibility acknowledgement',
  'Emergency pickup authorization reminder',
];

export default function SafetyScreen() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setAccepted((current) => ({ ...current, [id]: !current[id] }));
  }

  const acceptedCount = CHECKS.filter((check) => accepted[check.id]).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Safety</Text>
        <Text style={styles.title}>Trusted friends, clear responsibility.</Text>
        <Text style={styles.tagline}>V1 should reduce liability creep by keeping parent choice, native contacts, and direct communication clear.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Readiness checklist</Text>
        <Text style={styles.helperText}>{acceptedCount} of {CHECKS.length} acknowledged in this mock session.</Text>
        {CHECKS.map((check) => {
          const isAccepted = accepted[check.id];
          return (
            <Pressable key={check.id} style={[styles.checkCard, isAccepted && styles.checkCardAccepted]} onPress={() => toggle(check.id)}>
              <View style={[styles.checkCircle, isAccepted && styles.checkCircleAccepted]}>
                <Text style={[styles.checkMark, isAccepted && styles.checkMarkAccepted]}>{isAccepted ? '✓' : ''}</Text>
              </View>
              <View style={styles.checkCopy}>
                <Text style={styles.checkTitle}>{check.title}</Text>
                <Text style={styles.checkBody}>{check.body}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency pickup reminder</Text>
        <Text style={styles.helperText}>Emergency Daycare Pickup coordinates urgency, but parents still authorize pickup by confirmed sitter name and exchange any school-specific details directly.</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>Suggested reminder copy</Text>
          <Text style={styles.messageText}>Authorize pickup with the daycare/school using the confirmed sitter’s name. Share any phone/address details directly if needed.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal worklist</Text>
        <Text style={styles.helperText}>These are not final legal documents. They are placeholders to keep the app build aligned with required legal work.</Text>
        {LEGAL_WORKLIST.map((item, index) => (
          <View key={item} style={styles.workRow}>
            <Text style={styles.ruleDot}>{index + 1}</Text>
            <Text style={styles.workText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Design principle</Text>
        <Text style={styles.helperText}>The safest V1 posture is clear coordination: TimeOut helps trusted friends communicate and settle points; it does not certify sitters, inspect homes, or replace parent judgment.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 18, paddingBottom: 40 },
  hero: { backgroundColor: '#8b2bbf', borderRadius: 28, padding: 22, marginBottom: 14 },
  kicker: { color: '#ffd5ef', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  title: { color: 'white', fontSize: 31, fontWeight: '900', marginTop: 6, lineHeight: 36 },
  tagline: { color: '#ffeaf7', fontSize: 16, marginTop: 8, lineHeight: 22 },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  checkCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 10 },
  checkCardAccepted: { backgroundColor: '#f2fff7', borderColor: '#b8e8c8' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#e3bfd6', alignItems: 'center', justifyContent: 'center' },
  checkCircleAccepted: { backgroundColor: '#20894d', borderColor: '#20894d' },
  checkMark: { color: '#fffafd', fontWeight: '900' },
  checkMarkAccepted: { color: 'white' },
  checkCopy: { flex: 1 },
  checkTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  checkBody: { color: '#76566a', lineHeight: 20, marginTop: 4 },
  messageBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  messageTitle: { color: '#372333', fontWeight: '900', marginBottom: 6 },
  messageText: { color: '#52364b', lineHeight: 20 },
  workRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  workText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
});
