import * as Contacts from 'expo-contacts';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type InviteContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  hint: string;
  source: 'mock' | 'device' | 'manual';
};

const MOCK_CONTACTS: InviteContact[] = [
  { id: 'sarah', name: 'Sarah M.', role: 'Nearby preschool family', phone: '(555) 013-2021', hint: 'Kids already know each other', source: 'mock' },
  { id: 'emily', name: 'Emily R.', role: 'Neighborhood parent', phone: '(555) 013-2044', hint: 'Good first circle invite', source: 'mock' },
  { id: 'jen', name: 'Jen K.', role: 'School friend family', phone: '(555) 013-2198', hint: 'Often needs date-night backup', source: 'mock' },
  { id: 'linda', name: 'Grandma Linda', role: 'Trusted family helper', phone: '(555) 013-2671', hint: 'Useful for emergency pickup edge cases', source: 'mock' },
  { id: 'maya', name: 'Maya P.', role: 'Playdate family', phone: '(555) 013-3002', hint: 'Social sits may feel natural', source: 'mock' },
  { id: 'anna', name: 'Anna T.', role: 'Nearby parent friend', phone: '(555) 013-3310', hint: 'Likely to want TimeOut too', source: 'mock' },
];

const INVITER_NAME = 'Sarah';
const INVITE_LINK = 'https://timeout.example/invite/sarah-circle';

function buildInviteMessage(inviteeName: string) {
  const firstName = inviteeName.split(' ')[0] || inviteeName;
  return `Hi ${firstName} — ${INVITER_NAME} invited you to join their private TimeOut babysitting circle. TimeOut helps trusted friends trade occasional babysitting. No strangers, no public listing, no credit card needed. Open your invite: ${INVITE_LINK}`;
}

function buildSmsUrl(contact: InviteContact) {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  return `sms:${encodeURIComponent(contact.phone)}${separator}body=${encodeURIComponent(buildInviteMessage(contact.name))}`;
}

function mapDeviceContact(contact: Contacts.Contact): InviteContact | null {
  const phone = contact.phoneNumbers?.[0]?.number;
  if (!phone) return null;

  return {
    id: `device-${contact.id ?? `${contact.name}-${phone}`}`,
    name: contact.name || contact.firstName || 'Unnamed contact',
    role: 'From native contacts',
    phone,
    hint: 'You choose whether this is a good TimeOut invite',
    source: 'device',
  };
}

export default function InviteFriendsScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [contacts, setContacts] = useState<InviteContact[]>(MOCK_CONTACTS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['sarah', 'emily', 'jen']);
  const [searchText, setSearchText] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [sentInvites, setSentInvites] = useState<InviteContact[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [contactsMessage, setContactsMessage] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [smsQueueIndex, setSmsQueueIndex] = useState(0);

  const selectedContacts = useMemo(
    () => contacts.filter((contact) => selectedIds.includes(contact.id)),
    [contacts, selectedIds]
  );

  const filteredContacts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) =>
      `${contact.name} ${contact.role} ${contact.hint} ${contact.phone}`.toLowerCase().includes(query)
    );
  }, [contacts, searchText]);

  function toggleContact(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((candidateId) => candidateId !== id) : [...current, id]
    );
  }

  async function loadDeviceContacts() {
    setIsLoadingContacts(true);
    setContactsMessage('');

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setContactsMessage('Contact access was not granted. You can still enter phone numbers manually.');
        return;
      }

      const result = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        pageSize: 250,
        sort: Contacts.SortTypes.FirstName,
      });

      const deviceContacts = result.data.map(mapDeviceContact).filter(Boolean) as InviteContact[];

      if (deviceContacts.length === 0) {
        setContactsMessage('No phone contacts were found. You can still enter phone numbers manually.');
        return;
      }

      setContacts(deviceContacts);
      setSelectedIds([]);
      setContactsLoaded(true);
      setContactsMessage(`Loaded ${deviceContacts.length} phone contacts. Choose only trusted people you want to invite.`);
    } catch (error) {
      setContactsMessage('Could not load contacts on this device. The mock list and manual phone entry are still available.');
    } finally {
      setIsLoadingContacts(false);
    }
  }

  function useMockContacts() {
    setContacts(MOCK_CONTACTS);
    setSelectedIds(['sarah', 'emily', 'jen']);
    setContactsLoaded(false);
    setContactsMessage('Using the safe mock contact list for product review.');
  }

  function addManualInvite() {
    const phone = manualPhone.trim();
    if (!phone) return;
    const id = `manual-${Date.now()}`;
    const manualContact: InviteContact = {
      id,
      name: 'Manual invite',
      role: 'Entered by phone number',
      phone,
      hint: 'No contact permission needed',
      source: 'manual',
    };
    setContacts((current) => [manualContact, ...current]);
    setSelectedIds((current) => [...current, id]);
    setManualPhone('');
  }

  async function openSmsForContact(contact: InviteContact) {
    const smsUrl = buildSmsUrl(contact);
    const canOpen = await Linking.canOpenURL(smsUrl);

    if (!canOpen) {
      Alert.alert('SMS not available', 'This device or browser cannot open a text message. The invite is still saved in this screen for review.');
      return false;
    }

    await Linking.openURL(smsUrl);
    return true;
  }

  async function sendInvites() {
    if (selectedContacts.length === 0) return;

    const nextContact = selectedContacts[smsQueueIndex];
    const opened = await openSmsForContact(nextContact);

    if (opened) {
      const nextQueueIndex = smsQueueIndex + 1;
      setSmsQueueIndex(nextQueueIndex);
      if (nextQueueIndex < selectedContacts.length) {
        Alert.alert(
          'Send next invite',
          `After you send or cancel the text to ${nextContact.name}, return to TimeOut and tap Send next invite.`
        );
        return;
      }
    }

    setSentInvites(selectedContacts);
    setStep(5);
  }

  function resetSmsQueue() {
    setSmsQueueIndex(0);
    setSentInvites([]);
  }

  function openInviteePreview() {
    router.push('/invitee-preview');
  }

  const smsPreviewContact = selectedContacts[0];
  const smsPreviewText = smsPreviewContact ? buildInviteMessage(smsPreviewContact.name) : buildInviteMessage('[Name]');
  const nextInviteName = selectedContacts[smsQueueIndex]?.name;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.progressRow}>
        {[0, 1, 2, 3, 4, 5].map((dot) => (
          <View key={dot} style={[styles.progressDot, step >= dot && styles.progressDotActive]} />
        ))}
      </View>

      {step === 0 ? (
        <View>
          <View style={styles.logoCard}>
            <Image source={require('@/assets/images/icon.png')} style={styles.logo} contentFit="cover" />
            <Text style={styles.kicker}>TIMEOUT</Text>
            <Text style={styles.title}>Trusted babysitting with friends</Text>
            <Text style={styles.bodyText}>
              Build a private circle with people you already know. No strangers. No public listing. No credit card needed.
            </Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => setStep(1)}>
            <Text style={styles.primaryButtonText}>See the one-tap pings</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 1 ? (
        <View>
          <Text style={styles.kicker}>ONE-TAP PRESETS</Text>
          <Text style={styles.title}>What would you use TimeOut for?</Text>
          <Text style={styles.bodyText}>Presets show the dream. Most families can still make a custom sit request for everyday needs.</Text>
          <View style={styles.presetGrid}>
            <PresetCard title="Date Night" subtitle="Get a few hours back." icon="🌙" featured />
            <PresetCard title="Emergency Daycare Pickup" subtitle="When life breaks the schedule." icon="🚗" featured emergency />
            <PresetCard title="Custom Sit" subtitle="The usual path for real requests." icon="✏️" />
            <PresetCard title="Playdate" subtitle="Kids play. Parents connect." icon="🧸" />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => setStep(2)}>
            <Text style={styles.primaryButtonText}>How AutoPing works</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 2 ? (
        <View>
          <Text style={styles.kicker}>AUTOPING</Text>
          <Text style={styles.title}>Help without the awkward search</Text>
          <View style={styles.lifecycleCard}>
            <LifecycleRow number="1" title="Create a request" text="Choose a preset or use Custom Sit for the normal day-to-day request." />
            <LifecycleRow number="2" title="AutoPing asks thoughtfully" text="It does not broadcast spam. Trusted members are contacted in a careful order." />
            <LifecycleRow number="3" title="First YES wins" text="When someone says yes, the sitter is confirmed and everyone else gets updated." />
            <LifecycleRow number="4" title="The circle keeps moving" text="Everyone wants TimeOut. Points help create the sitter supply without a long fairness lecture." />
          </View>
          <Text style={styles.softNote}>
            The detailed debt order can be taught later. For now, parents only need to know that the app avoids spamming and helps the circle stay active.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => setStep(3)}>
            <Text style={styles.primaryButtonText}>Build my circle</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 3 ? (
        <View>
          <Text style={styles.kicker}>PRIVATE CIRCLE</Text>
          <Text style={styles.title}>Your circle creates the sitter supply</Text>
          <Text style={styles.bodyText}>
            TimeOut works because your trusted friends want TimeOut too. Start with 3–4 families, then invite more trusted people as you think of them.
          </Text>
          <View style={styles.trustPanel}>
            <TrustBullet text="Invite nearby people when nearby makes sense." />
            <TrustBullet text="Do not make distance feel like a hard rule." />
            <TrustBullet text="Use a local school or landmark name later if the group wants one." />
            <TrustBullet text="Share App comes later, after members love using the group." />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => setStep(4)}>
            <Text style={styles.primaryButtonText}>Choose trusted friends</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 4 ? (
        <View>
          <Text style={styles.kicker}>NATIVE CONTACTS</Text>
          <Text style={styles.title}>Choose trusted families</Text>
          <Text style={styles.bodyText}>
            TimeOut can open your phone contacts so you can choose trusted friends. It will not invite anyone unless you select them and send the text.
          </Text>
          <View style={styles.trustPanel}>
            <TrustBullet text="We do not invite anyone automatically." />
            <TrustBullet text="We do not spam your contacts." />
            <TrustBullet text="No one joins unless they accept." />
            <TrustBullet text="No credit card needed. Cancel anytime." />
          </View>

          <View style={styles.contactActionRow}>
            <Pressable style={styles.contactLoadButton} onPress={loadDeviceContacts} disabled={isLoadingContacts}>
              <Text style={styles.contactLoadButtonText}>{isLoadingContacts ? 'Loading contacts...' : 'Load phone contacts'}</Text>
            </Pressable>
            <Pressable style={styles.mockButton} onPress={useMockContacts}>
              <Text style={styles.mockButtonText}>Use mock list</Text>
            </Pressable>
          </View>

          {contactsMessage ? <Text style={styles.contactsMessage}>{contactsMessage}</Text> : null}
          {contactsLoaded ? <Text style={styles.contactsSource}>Showing real phone contacts from this device.</Text> : <Text style={styles.contactsSource}>Showing safe mock contacts until phone contacts are loaded.</Text>}

          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts"
            placeholderTextColor="#9c6a82"
            value={searchText}
            onChangeText={setSearchText}
          />

          <View style={styles.manualRow}>
            <TextInput
              style={[styles.searchInput, styles.manualInput]}
              placeholder="Or enter phone number manually"
              placeholderTextColor="#9c6a82"
              value={manualPhone}
              onChangeText={setManualPhone}
              keyboardType="phone-pad"
            />
            <Pressable style={styles.addButton} onPress={addManualInvite}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          <Text style={styles.selectedCount}>{selectedContacts.length} selected</Text>
          {filteredContacts.map((contact) => (
            <Pressable key={contact.id} style={styles.contactCard} onPress={() => toggleContact(contact.id)}>
              <View style={[styles.checkCircle, selectedIds.includes(contact.id) && styles.checkCircleSelected]}>
                <Text style={styles.checkText}>{selectedIds.includes(contact.id) ? '✓' : ''}</Text>
              </View>
              <View style={styles.contactCopy}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{contact.role}</Text>
                <Text style={styles.contactHint}>{contact.hint}</Text>
              </View>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </Pressable>
          ))}

          <Pressable
            style={[styles.primaryButton, selectedContacts.length === 0 && styles.disabledButton]}
            disabled={selectedContacts.length === 0}
            onPress={() => {
              resetSmsQueue();
              setStep(5);
            }}>
            <Text style={styles.primaryButtonText}>Review invites</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 5 ? (
        <View>
          {sentInvites.length === 0 ? (
            <>
              <Text style={styles.kicker}>REVIEW</Text>
              <Text style={styles.title}>Review your invites</Text>
              <Text style={styles.bodyText}>We’ll open one text at a time. No one is added unless they choose to join.</Text>
              {selectedContacts.map((contact) => (
                <View key={contact.id} style={styles.reviewCard}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRole}>{contact.phone}</Text>
                </View>
              ))}
              <View style={styles.smsPreview}>
                <Text style={styles.smsLabel}>SMS preview</Text>
                <Text style={styles.smsText}>{smsPreviewText}</Text>
              </View>
              {nextInviteName ? <Text style={styles.contactsMessage}>Next text: {nextInviteName}</Text> : null}
              <Pressable style={styles.primaryButton} onPress={sendInvites}>
                <Text style={styles.primaryButtonText}>{smsQueueIndex === 0 ? 'Send first invite' : 'Send next invite'}</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setStep(4)}>
                <Text style={styles.secondaryButtonText}>Edit list</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.kicker}>SENT</Text>
              <Text style={styles.title}>Invites started</Text>
              <Text style={styles.bodyText}>
                You’re building your TimeOut circle. When a few friends join, you can send a real sit request and AutoPing can look for the first available sitter.
              </Text>
              {sentInvites.map((contact) => (
                <View key={contact.id} style={styles.reviewCard}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.statusText}>SMS opened for invite</Text>
                </View>
              ))}
              <Pressable style={styles.primaryButton} onPress={() => router.push({ pathname: '/create-sit-request', params: { preset: 'custom' } })}>
                <Text style={styles.primaryButtonText}>Try a custom sit request</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={openInviteePreview}>
                <Text style={styles.secondaryButtonText}>Preview invitee experience</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => Alert.alert('Later v1', 'Share App is intentionally deferred until members love the group and want to help a friend start another circle.')}>
                <Text style={styles.secondaryButtonText}>Share App deferred</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

function PresetCard({ title, subtitle, icon, featured, emergency }: { title: string; subtitle: string; icon: string; featured?: boolean; emergency?: boolean }) {
  return (
    <View style={[styles.presetCard, featured && styles.presetCardFeatured, emergency && styles.presetCardEmergency]}>
      <Text style={styles.presetIcon}>{icon}</Text>
      <Text style={styles.presetTitle}>{title}</Text>
      <Text style={styles.presetSubtitle}>{subtitle}</Text>
    </View>
  );
}

function LifecycleRow({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <View style={styles.lifecycleRow}>
      <Text style={styles.lifecycleNumber}>{number}</Text>
      <View style={styles.lifecycleCopy}>
        <Text style={styles.lifecycleTitle}>{title}</Text>
        <Text style={styles.lifecycleText}>{text}</Text>
      </View>
    </View>
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
  logoCard: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#f4c3dd', borderRadius: 30, borderWidth: 1, padding: 22, marginBottom: 16, shadowColor: '#7e2061', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18 },
  logo: { width: 128, height: 128, borderRadius: 32, marginBottom: 18 },
  kicker: { color: '#be185d', fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginBottom: 8 },
  title: { color: '#4a1038', fontSize: 31, fontWeight: '900', lineHeight: 36, marginBottom: 10 },
  bodyText: { color: '#7b4a65', fontSize: 16, lineHeight: 23, marginBottom: 16 },
  primaryButton: { backgroundColor: '#be185d', borderRadius: 20, padding: 17, marginTop: 12, marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 8 },
  secondaryButtonText: { color: '#8a1859', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  disabledButton: { opacity: 0.5 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  presetCard: { width: '48%', backgroundColor: '#ffffff', borderColor: '#f1d4e4', borderRadius: 22, borderWidth: 1, padding: 14, minHeight: 154 },
  presetCardFeatured: { backgroundColor: '#fff0f7', borderColor: '#f0a8cd' },
  presetCardEmergency: { backgroundColor: '#fff4eb', borderColor: '#ffbf8b' },
  presetIcon: { fontSize: 30, marginBottom: 12 },
  presetTitle: { color: '#4a1038', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  presetSubtitle: { color: '#7b4a65', fontSize: 14, lineHeight: 19 },
  lifecycleCard: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  lifecycleRow: { flexDirection: 'row', marginBottom: 16 },
  lifecycleNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#be185d', color: '#ffffff', fontWeight: '900', lineHeight: 32, marginRight: 12, textAlign: 'center' },
  lifecycleCopy: { flex: 1 },
  lifecycleTitle: { color: '#4a1038', fontSize: 17, fontWeight: '900', marginBottom: 3 },
  lifecycleText: { color: '#7b4a65', fontSize: 15, lineHeight: 21 },
  softNote: { color: '#8a1859', fontSize: 14, fontWeight: '700', lineHeight: 21, marginBottom: 8 },
  trustPanel: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 22, borderWidth: 1, padding: 14, marginBottom: 14 },
  trustBulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  trustBulletIcon: { color: '#be185d', fontSize: 16, fontWeight: '900', marginRight: 10 },
  trustBulletText: { color: '#63324f', flex: 1, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  contactActionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  contactLoadButton: { flex: 1, backgroundColor: '#be185d', borderRadius: 16, padding: 14 },
  contactLoadButtonText: { color: '#ffffff', fontWeight: '900', textAlign: 'center' },
  mockButton: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 16, borderWidth: 1, padding: 14 },
  mockButtonText: { color: '#8a1859', fontWeight: '900', textAlign: 'center' },
  contactsMessage: { color: '#8a1859', fontSize: 14, fontWeight: '800', lineHeight: 20, marginBottom: 8 },
  contactsSource: { color: '#7b4a65', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  searchInput: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 16, borderWidth: 1, color: '#4a1038', fontSize: 16, marginBottom: 10, padding: 14 },
  manualRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  manualInput: { flex: 1 },
  addButton: { backgroundColor: '#4a1038', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 15, marginBottom: 10 },
  addButtonText: { color: '#ffffff', fontWeight: '900' },
  selectedCount: { color: '#be185d', fontSize: 15, fontWeight: '900', marginVertical: 8 },
  contactCard: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#f0d8e7', borderRadius: 20, borderWidth: 1, flexDirection: 'row', marginBottom: 10, padding: 13 },
  checkCircle: { alignItems: 'center', borderColor: '#dcb7cd', borderRadius: 14, borderWidth: 2, height: 28, justifyContent: 'center', marginRight: 11, width: 28 },
  checkCircleSelected: { backgroundColor: '#be185d', borderColor: '#be185d' },
  checkText: { color: '#ffffff', fontWeight: '900' },
  contactCopy: { flex: 1 },
  contactName: { color: '#4a1038', fontSize: 16, fontWeight: '900' },
  contactRole: { color: '#7b4a65', fontSize: 13, marginTop: 2 },
  contactHint: { color: '#a21661', fontSize: 12, fontWeight: '800', marginTop: 4 },
  contactPhone: { color: '#7b4a65', fontSize: 12, fontWeight: '700' },
  reviewCard: { backgroundColor: '#ffffff', borderColor: '#f0d8e7', borderRadius: 18, borderWidth: 1, marginBottom: 9, padding: 13 },
  smsPreview: { backgroundColor: '#ffffff', borderColor: '#f0d8e7', borderRadius: 22, borderWidth: 1, marginTop: 8, padding: 14 },
  smsLabel: { color: '#be185d', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },
  smsText: { color: '#4a1038', fontSize: 15, lineHeight: 22 },
  statusText: { color: '#be185d', fontSize: 13, fontWeight: '900', marginTop: 4 },
});
