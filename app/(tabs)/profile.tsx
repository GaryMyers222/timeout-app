import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileScreen() {
  const [phone, setPhone] = useState('(555) 013-1200');
  const [firstName, setFirstName] = useState('Sara');
  const [childName, setChildName] = useState('Mia');
  const [childBirthday, setChildBirthday] = useState('Preschool age');
  const [verified, setVerified] = useState(false);
  const [showMoreProfile, setShowMoreProfile] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Profile</Text>
        <Text style={styles.title}>Phone first. No password.</Text>
        <Text style={styles.tagline}>V1 identity should be simple: phone verification, first name, and only the child details needed to make sit requests understandable.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phone identity</Text>
        <Text style={styles.helperText}>TimeOut uses phone number identity so invites, SMS fallback, and native contacts can line up without password complexity.</Text>
        <Text style={styles.label}>Mobile phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Pressable style={verified ? styles.verifiedButton : styles.primaryButton} onPress={() => setVerified(true)}>
          <Text style={styles.primaryButtonText}>{verified ? 'Phone Verified' : 'Send Verification Code'}</Text>
        </Pressable>
        {verified ? <Text style={styles.successText}>Mock verification complete. Real app will use SMS code verification.</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minimum profile</Text>
        <Text style={styles.helperText}>Ask for only what helps the first circle work. Defer richer profile details until after the user trusts the app.</Text>
        <Text style={styles.label}>First name</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
        <Text style={styles.label}>Child first name</Text>
        <TextInput style={styles.input} value={childName} onChangeText={setChildName} />
        <Text style={styles.label}>Child age / birthday</Text>
        <TextInput style={styles.input} value={childBirthday} onChangeText={setChildBirthday} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trust before paperwork</Text>
        <Text style={styles.helperText}>A new user from the app store is still exploring. Avoid asking for addresses, full family profiles, or heavy setup before value is clear.</Text>
        <Pressable style={styles.secondaryButton} onPress={() => setShowMoreProfile(!showMoreProfile)}>
          <Text style={styles.secondaryButtonText}>{showMoreProfile ? 'Hide Deferred Fields' : 'Show Deferred Fields'}</Text>
        </Pressable>
        {showMoreProfile ? (
          <View style={styles.deferredBox}>
            <Text style={styles.deferredTitle}>Later, not first-run</Text>
            <Text style={styles.deferredText}>Home address, emergency contacts, allergies, multiple child profiles, home notes, and detailed sitter preferences can be added later when trust and usage justify the friction.</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Native contacts reminder</Text>
        <Text style={styles.helperText}>TimeOut can know phone numbers for app coordination, but members should still save one another in native phone contacts for emergency calls and off-app handoff.</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>Suggested nudge</Text>
          <Text style={styles.messageText}>Add your circle members to your phone contacts so calls, pickup authorization, and handoff details are easy when plans change.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity rules</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>No password in V1.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>Phone verification supports invites and SMS fallback.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>Minimal child info helps sitter-friends understand the sit.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>4</Text><Text style={styles.ruleText}>Profile depth comes after trust, not before value.</Text></View>
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
  label: { color: '#8b2bbf', fontWeight: '900', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 14, color: '#372333', padding: 12 },
  primaryButton: { backgroundColor: '#8b2bbf', borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 14 },
  verifiedButton: { backgroundColor: '#20894d', borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 14 },
  primaryButtonText: { color: 'white', fontWeight: '900' },
  successText: { color: '#20894d', fontWeight: '800', marginTop: 10 },
  secondaryButton: { backgroundColor: '#fff0f7', borderColor: '#e3bfd6', borderWidth: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#8b2bbf', fontWeight: '900' },
  deferredBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  deferredTitle: { color: '#372333', fontWeight: '900', marginBottom: 4 },
  deferredText: { color: '#52364b', lineHeight: 20 },
  messageBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  messageTitle: { color: '#372333', fontWeight: '900', marginBottom: 6 },
  messageText: { color: '#52364b', lineHeight: 20 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
});
