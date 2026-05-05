import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type InviteMode = 'invite' | 'share';

type MockInvite = {
  id: string;
  name: string;
  phone: string;
  type: InviteMode;
  status: 'ready' | 'sent' | 'joined' | 'started_new_circle';
};

const MOCK_CIRCLE_INVITES = [
  { id: 'blue-circle', circleName: 'Blue Group', inviter: 'Sara', phone: '(555) 013-1200' },
  { id: 'park-circle', circleName: 'Park Friends', inviter: 'Kelly', phone: '(555) 013-4420' },
  { id: 'blue-circle-duplicate', circleName: 'Blue Group', inviter: 'Mia', phone: '(555) 013-7810' },
];

export default function InviteScreen() {
  const [mode, setMode] = useState<InviteMode>('invite');
  const [friendName, setFriendName] = useState('Kelly');
  const [friendPhone, setFriendPhone] = useState('(555) 013-4420');
  const [mockInvites, setMockInvites] = useState<MockInvite[]>([]);

  const currentCircleName = 'Blue Group';

  const inviteMessage = `${friendName || 'Friend'}, I am starting a private TimeOut babysitting circle with trusted friends. This invite is for ${currentCircleName}. No strangers. Friends make the best sitters. Join here: [invite link]`;

  const shareMessage = `${friendName || 'Friend'}, this TimeOut app idea looks useful. It helps trusted friends trade babysitting in a private circle. This link lets you start your own circle: [share app link]`;

  function sendMockInvite() {
    const next: MockInvite = {
      id: `${Date.now()}`,
      name: friendName || 'Friend',
      phone: friendPhone || '(phone pending)',
      type: mode,
      status: mode === 'invite' ? 'sent' : 'started_new_circle',
    };

    setMockInvites((current) => [next, ...current]);
  }

  const uniqueCircleInvites = MOCK_CIRCLE_INVITES.reduce<typeof MOCK_CIRCLE_INVITES>((acc, invite) => {
    if (!acc.some((existing) => existing.circleName === invite.circleName)) {
      acc.push(invite);
    }
    return acc;
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Invite Friends</Text>
        <Text style={styles.title}>Build your trusted circle.</Text>
        <Text style={styles.tagline}>Invite nearby sitter-friends into this circle, or share the app so a non-local friend can start their own.</Text>
      </View>

      <View style={styles.modeSwitch}>
        <Pressable onPress={() => setMode('invite')} style={[styles.modeButton, mode === 'invite' && styles.modeSelected]}>
          <Text style={[styles.modeText, mode === 'invite' && styles.modeSelectedText]}>Invite Friends</Text>
        </Pressable>
        <Pressable onPress={() => setMode('share')} style={[styles.modeButton, mode === 'share' && styles.modeSelected]}>
          <Text style={[styles.modeText, mode === 'share' && styles.modeSelectedText]}>Share App</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{mode === 'invite' ? 'Invite to this circle' : 'Share without joining this circle'}</Text>
        <Text style={styles.helperText}>
          {mode === 'invite'
            ? 'Use Invite for a trusted local sitter-friend who may join your current circle. This should not create a separate local group.'
            : 'Use Share for a friend outside your local circle. They can start their own TimeOut group elsewhere.'}
        </Text>

        <Text style={styles.label}>Friend name</Text>
        <TextInput style={styles.input} value={friendName} onChangeText={setFriendName} />
        <Text style={styles.label}>Phone number</Text>
        <TextInput style={styles.input} value={friendPhone} onChangeText={setFriendPhone} keyboardType="phone-pad" />

        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>Friend-origin message preview</Text>
          <Text style={styles.messageText}>{mode === 'invite' ? inviteMessage : shareMessage}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={sendMockInvite}>
          <Text style={styles.primaryButtonText}>{mode === 'invite' ? 'Send Circle Invite' : 'Share App Link'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invitation routing rules</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>No invite found: user creates or starts a circle.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>One circle invite: user is associated with that circle.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>Multiple circle invites: show Choose Your Circle.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>4</Text><Text style={styles.ruleText}>Duplicate invites for same circle collapse into one circle context.</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Circle mock</Text>
        <Text style={styles.helperText}>This preserves the rare but important case where someone receives multiple valid circle invites.</Text>
        {uniqueCircleInvites.map((invite) => (
          <View key={invite.id} style={styles.circleCard}>
            <Text style={styles.circleTitle}>{invite.circleName}</Text>
            <Text style={styles.circleDetail}>Invited by {invite.inviter} • {invite.phone}</Text>
          </View>
        ))}
        <Text style={styles.smallNote}>Duplicate Blue Group invite collapsed from the mock list.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Native contacts reminder</Text>
        <Text style={styles.helperText}>TimeOut should nudge members to save circle contacts in their phone. Emergency calls, addresses, and handoff details stay mostly off app in V1.</Text>
        <View style={styles.contactsBox}>
          <Text style={styles.contactsText}>Suggested meeting agenda item: “Add every active circle member to your phone contacts now.”</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sent / shared mock history</Text>
        {mockInvites.length > 0 ? (
          mockInvites.map((invite) => (
            <View key={invite.id} style={styles.historyCard}>
              <Text style={styles.historyTitle}>{invite.name}</Text>
              <Text style={styles.historyDetail}>{invite.phone}</Text>
              <Text style={styles.historyStatus}>{invite.type === 'invite' ? 'Circle invite sent' : 'App shared for new circle'}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.helperText}>No mock invites sent in this session yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Future rule: 10+ member objection check</Text>
        <Text style={styles.helperText}>When a circle is large enough, V1 may need a simple “any objection?” pre-invite notice. No reply means no objection; discussion stays outside the app.</Text>
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
  modeSelected: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  modeText: { color: '#76566a', fontWeight: '900', fontSize: 13 },
  modeSelectedText: { color: '#8b2bbf' },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  label: { color: '#8b2bbf', fontWeight: '900', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 14, color: '#372333', padding: 12 },
  messageBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 14 },
  messageTitle: { color: '#372333', fontWeight: '900', marginBottom: 6 },
  messageText: { color: '#52364b', lineHeight: 20 },
  primaryButton: { backgroundColor: '#8b2bbf', borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 14 },
  primaryButtonText: { color: 'white', fontWeight: '900', fontSize: 16 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
  circleCard: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 10 },
  circleTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  circleDetail: { color: '#76566a', marginTop: 4 },
  smallNote: { color: '#76566a', fontSize: 12, fontWeight: '800', marginTop: 10 },
  contactsBox: { backgroundColor: '#f2fff7', borderColor: '#b8e8c8', borderWidth: 1, borderRadius: 16, padding: 14 },
  contactsText: { color: '#35634a', fontWeight: '800', lineHeight: 20 },
  historyCard: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 10 },
  historyTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  historyDetail: { color: '#76566a', marginTop: 4 },
  historyStatus: { color: '#8b2bbf', fontWeight: '900', marginTop: 6 },
});
