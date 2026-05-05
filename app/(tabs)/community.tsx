import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type CommunityMode = 'playdate' | 'gathering';
type RsvpStatus = 'YES' | 'No response';

const MOCK_MEMBERS = [
  { name: 'Sara', role: 'Host', status: 'YES' as RsvpStatus },
  { name: 'Kelly', role: 'Co-host', status: 'YES' as RsvpStatus },
  { name: 'User B', role: 'Member', status: 'YES' as RsvpStatus },
  { name: 'User C', role: 'Member', status: 'No response' as RsvpStatus },
  { name: 'User D', role: 'Member', status: 'YES' as RsvpStatus },
];

export default function CommunityScreen() {
  const [mode, setMode] = useState<CommunityMode>('playdate');
  const [title, setTitle] = useState('Evergreen Park Playdate');
  const [timeLabel, setTimeLabel] = useState('Saturday 10:00 AM');
  const [location, setLocation] = useState('Evergreen Park');
  const [hostOne, setHostOne] = useState('Sara');
  const [hostTwo, setHostTwo] = useState('Kelly');
  const [showCancelScope, setShowCancelScope] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState('');

  const yesCount = useMemo(() => MOCK_MEMBERS.filter((member) => member.status === 'YES').length, []);

  const messagePreview = mode === 'playdate'
    ? `Playdate at ${location}\n${timeLabel}\n\n${hostOne} and ${hostTwo} supervising.\nReply YES if your kids are coming.`
    : `TimeOut gathering ${timeLabel}\n\n${hostOne} is hosting.\nReply YES if you are coming.`;

  function switchMode(nextMode: CommunityMode) {
    setMode(nextMode);
    setCancellationMessage('');
    if (nextMode === 'playdate') {
      setTitle('Evergreen Park Playdate');
      setTimeLabel('Saturday 10:00 AM');
      setLocation('Evergreen Park');
      setHostOne('Sara');
      setHostTwo('Kelly');
    } else {
      setTitle('TimeOut Gathering');
      setTimeLabel('Third Monday at 8:00 PM');
      setLocation('Sara’s house');
      setHostOne('Sara');
      setHostTwo('');
    }
  }

  function cancelMyParticipation() {
    setCancellationMessage('Cancelled only your participation. The group activity remains active.');
    setShowCancelScope(false);
  }

  function cancelEntireActivity() {
    setCancellationMessage('Host/facilitator cancelled the entire group activity. All attendees should be notified.');
    setShowCancelScope(false);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Community</Text>
        <Text style={styles.title}>Playdates and gatherings.</Text>
        <Text style={styles.tagline}>Broadcast events can collect multiple YES responses, so cancellation scope must be clear.</Text>
      </View>

      <View style={styles.modeSwitch}>
        <Pressable onPress={() => switchMode('playdate')} style={[styles.modeButton, mode === 'playdate' && styles.modeSelected]}>
          <Text style={[styles.modeText, mode === 'playdate' && styles.modeSelectedText]}>Playdate</Text>
        </Pressable>
        <Pressable onPress={() => switchMode('gathering')} style={[styles.modeButton, mode === 'gathering' && styles.modeSelected]}>
          <Text style={[styles.modeText, mode === 'gathering' && styles.modeSelectedText]}>Gathering RSVP</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{mode === 'playdate' ? 'Create Playdate Broadcast' : 'Create Gathering RSVP'}</Text>
        <Text style={styles.helperText}>
          {mode === 'playdate'
            ? 'Playdates are broadcast events with multiple YES responses. Two hosts are preferred for safety.'
            : 'Gatherings help circles maintain trust, recruit thoughtfully, and keep standards alive.'}
        </Text>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        <Text style={styles.label}>When</Text>
        <TextInput style={styles.input} value={timeLabel} onChangeText={setTimeLabel} />
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} />
        <Text style={styles.label}>{mode === 'playdate' ? 'Host 1' : 'Host'}</Text>
        <TextInput style={styles.input} value={hostOne} onChangeText={setHostOne} />
        {mode === 'playdate' ? (
          <>
            <Text style={styles.label}>Host 2</Text>
            <TextInput style={styles.input} value={hostTwo} onChangeText={setHostTwo} />
          </>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Broadcast message preview</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{messagePreview}</Text>
        </View>
        <Text style={styles.helperText}>Multiple YES responses are allowed. This is not first-YES-wins AutoPing.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RSVP status</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{yesCount}</Text>
            <Text style={styles.summaryLabel}>YES responses</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{MOCK_MEMBERS.length}</Text>
            <Text style={styles.summaryLabel}>members pinged</Text>
          </View>
        </View>
        {MOCK_MEMBERS.map((member) => (
          <View key={member.name} style={styles.rsvpRow}>
            <View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <Text style={[styles.rsvpStatus, member.status === 'YES' ? styles.yes : styles.noResponse]}>{member.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cancellation scope</Text>
        <Text style={styles.helperText}>For group activities, avoid the edge case where one member accidentally cancels the whole event.</Text>
        <Pressable style={styles.secondaryButton} onPress={() => setShowCancelScope(!showCancelScope)}>
          <Text style={styles.secondaryButtonText}>{showCancelScope ? 'Hide Cancel Options' : 'Show Cancel Options'}</Text>
        </Pressable>
        {showCancelScope ? (
          <View style={styles.cancelBox}>
            <Pressable style={styles.optionAction} onPress={cancelMyParticipation}>
              <Text style={styles.optionActionText}>Cancel only my participation</Text>
            </Pressable>
            <Pressable style={styles.dangerAction} onPress={cancelEntireActivity}>
              <Text style={styles.dangerActionText}>Host/facilitator: cancel entire activity</Text>
            </Pressable>
          </View>
        ) : null}
        {cancellationMessage ? <Text style={styles.cancellationMessage}>{cancellationMessage}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Points treatment</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>Playdate points can be posted only for attendees, not the whole circle.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>Two hosts may each receive points from attending families.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>Gathering host may earn 1 point from each member under the meeting-host rule.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>4</Text><Text style={styles.ruleText}>Exact ledger posting for these group events can be finalized after normal sit flow is stable.</Text></View>
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
  modeSwitch: { flexDirection: 'row', backgroundColor: '#f2dced', borderRadius: 18, padding: 4, marginBottom: 14 },
  modeButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  modeSelected: { backgroundColor: 'white' },
  modeText: { color: '#76566a', fontWeight: '900', fontSize: 13 },
  modeSelectedText: { color: '#8b2bbf' },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  label: { color: '#8b2bbf', fontWeight: '900', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 14, color: '#372333', padding: 12 },
  messageBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  messageText: { color: '#52364b', lineHeight: 20 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  summaryNumber: { color: '#8b2bbf', fontSize: 34, fontWeight: '900' },
  summaryLabel: { color: '#76566a', fontWeight: '800' },
  rsvpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0d8e7', paddingVertical: 12 },
  memberName: { color: '#372333', fontWeight: '900', fontSize: 16 },
  memberRole: { color: '#76566a', marginTop: 3 },
  rsvpStatus: { fontWeight: '900' },
  yes: { color: '#20894d' },
  noResponse: { color: '#9a6b7c' },
  secondaryButton: { backgroundColor: '#fff0f7', borderColor: '#e3bfd6', borderWidth: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#8b2bbf', fontWeight: '900' },
  cancelBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  optionAction: { backgroundColor: '#f4e6ff', borderRadius: 16, padding: 14, marginTop: 8 },
  optionActionText: { color: '#8b2bbf', fontWeight: '900', textAlign: 'center' },
  dangerAction: { backgroundColor: '#fff0f0', borderColor: '#e87b7b', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 8 },
  dangerActionText: { color: '#9a1f1f', fontWeight: '900', textAlign: 'center' },
  cancellationMessage: { color: '#20894d', fontWeight: '800', marginTop: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
});
