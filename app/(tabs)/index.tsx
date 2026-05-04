import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const START_GRID = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', ':00', ':15', ':30', ':45', 'AM', 'PM'];
const DURATION_GRID = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', ':00', ':15', ':30', ':45', 'HOURS', 'AWAY'];

type LocationType = 'Drop-off' | 'My Place';
type KidCount = '1 Child' | '2+ Children';
type RequestMode = 'presets' | 'custom';

type Preset = {
  title: string;
  subtitle: string;
  promise: string;
  icon: string;
  startHour: string;
  startMinute: string;
  ampm: 'AM' | 'PM';
  durationHour: string;
  durationMinute: string;
  location: LocationType;
  kidCount: KidCount;
  emergency?: boolean;
};

const PRESETS: Preset[] = [
  {
    title: 'Friday Date Night',
    subtitle: 'My Place sit, 8-11:30 PM',
    promise: 'Imagine date night again.',
    icon: '♡',
    startHour: '8',
    startMinute: ':00',
    ampm: 'PM',
    durationHour: '3',
    durationMinute: ':30',
    location: 'My Place',
    kidCount: '1 Child',
  },
  {
    title: 'Emergency Daycare Pickup',
    subtitle: 'Broadcast urgent pickup help',
    promise: 'When the day goes sideways.',
    icon: '!',
    startHour: '5',
    startMinute: ':00',
    ampm: 'PM',
    durationHour: '1',
    durationMinute: ':00',
    location: 'Drop-off',
    kidCount: '1 Child',
    emergency: true,
  },
  {
    title: 'Saturday Brunch',
    subtitle: 'Drop-off sit, 9 AM-noon',
    promise: 'A little breathing room.',
    icon: '✿',
    startHour: '9',
    startMinute: ':00',
    ampm: 'AM',
    durationHour: '3',
    durationMinute: ':00',
    location: 'Drop-off',
    kidCount: '1 Child',
  },
  {
    title: 'Sunday Home Project',
    subtitle: 'Drop-off sit, 1-5 PM',
    promise: 'Get one thing finished.',
    icon: '⚒',
    startHour: '1',
    startMinute: ':00',
    ampm: 'PM',
    durationHour: '4',
    durationMinute: ':00',
    location: 'Drop-off',
    kidCount: '1 Child',
  },
];

const CANDIDATES = [
  { name: 'User A', balance: -28 },
  { name: 'User B', balance: -21 },
  { name: 'User C', balance: -11 },
  { name: 'User D', balance: 3 },
  { name: 'User E', balance: 9 },
  { name: 'User F', balance: 23 },
  { name: 'User G', balance: 24 },
  { name: 'Teen helper', balance: null },
  { name: 'Grandma pickup', balance: null },
];

function minutesFromLabel(label: string) {
  return Number(label.replace(':', '')) || 0;
}

function durationHours(hour: string, minute: string) {
  return Number(hour) + minutesFromLabel(minute) / 60;
}

function formatBalance(balance: number | null) {
  if (balance === null) return 'special';
  return balance > 0 ? `+${balance}` : `${balance}`;
}

export default function TimeOutHomeScreen() {
  const [mode, setMode] = useState<RequestMode>('presets');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(PRESETS[0]);
  const [startHour, setStartHour] = useState(PRESETS[0].startHour);
  const [startMinute, setStartMinute] = useState(PRESETS[0].startMinute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(PRESETS[0].ampm);
  const [durationHour, setDurationHour] = useState(PRESETS[0].durationHour);
  const [durationMinute, setDurationMinute] = useState(PRESETS[0].durationMinute);
  const [kidCount, setKidCount] = useState<KidCount>(PRESETS[0].kidCount);
  const [location, setLocation] = useState<LocationType>(PRESETS[0].location);
  const [comments, setComments] = useState('');
  const [daycareDetails, setDaycareDetails] = useState('');

  const isEmergency = selectedPreset?.emergency ?? false;
  const isPresetFlow = mode === 'presets' && selectedPreset !== null;

  const points = useMemo(() => {
    const base = durationHours(durationHour, durationMinute) * 4;
    const kidsBonus = kidCount === '2+ Children' ? 4 : 0;
    const locationBonus = location === 'My Place' ? 4 : 0;
    const emergencyBonus = isEmergency ? 6 : 0;
    return Math.round(base + kidsBonus + locationBonus + emergencyBonus);
  }, [durationHour, durationMinute, kidCount, location, isEmergency]);

  const requestTitle = isPresetFlow ? selectedPreset.title : 'Custom Sit Request';
  const requestMessage = `${requestTitle} • ${startHour}${startMinute} ${ampm} • ${durationHour}${durationMinute} hours • ${kidCount} • ${location} • ${points} points`;

  function applyPreset(preset: Preset) {
    setMode('presets');
    setSelectedPreset(preset);
    setStartHour(preset.startHour);
    setStartMinute(preset.startMinute);
    setAmpm(preset.ampm);
    setDurationHour(preset.durationHour);
    setDurationMinute(preset.durationMinute);
    setLocation(preset.location);
    setKidCount(preset.kidCount);
  }

  function chooseCustom() {
    setMode('custom');
    setSelectedPreset(null);
  }

  function sendAutoPing() {
    Alert.alert(
      isEmergency ? 'Emergency broadcast ready' : 'AutoPing ready',
      isEmergency
        ? 'Emergency Daycare Pickup will broadcast for the first YES. Remember to authorize pickup by the confirmed sitter name.'
        : isPresetFlow
          ? 'Preset AutoPing keeps the ping list simple and sends the request quickly.'
          : 'Custom AutoPing will contact members sequentially by lowest point balance first.'
    );
  }

  function handleStartGrid(value: string) {
    if (value === 'AM' || value === 'PM') setAmpm(value);
    else if (value.startsWith(':')) setStartMinute(value);
    else setStartHour(value);
  }

  function handleDurationGrid(value: string) {
    if (value === 'HOURS' || value === 'AWAY') return;
    if (value.startsWith(':')) setDurationMinute(value);
    else setDurationHour(value);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>TimeOut</Text>
        <Text style={styles.title}>Friends make the best sitters.</Text>
        <Text style={styles.tagline}>Private circles. No strangers. Quick help when parents need breathing room.</Text>
        <View style={styles.trustRow}>
          <Text style={styles.trustPill}>Trusted friends</Text>
          <Text style={styles.trustPill}>AutoPing</Text>
          <Text style={styles.trustPill}>Points balance</Text>
        </View>
      </View>

      <View style={styles.modeSwitch}>
        <Pressable onPress={() => setMode('presets')} style={[styles.modeButton, mode === 'presets' && styles.modeSelected]}>
          <Text style={[styles.modeText, mode === 'presets' && styles.modeSelectedText]}>QuickPing Presets</Text>
        </Pressable>
        <Pressable onPress={chooseCustom} style={[styles.modeButton, mode === 'custom' && styles.modeSelected]}>
          <Text style={[styles.modeText, mode === 'custom' && styles.modeSelectedText]}>Custom Sit Request</Text>
        </Pressable>
      </View>

      {mode === 'presets' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick the kind of help you need</Text>
          <Text style={styles.helperText}>One tap starts a familiar request. You can scroll for more options.</Text>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset.title}
              onPress={() => applyPreset(preset)}
              style={[styles.presetCard, selectedPreset?.title === preset.title && styles.selectedCard, preset.emergency && styles.emergencyPreset]}>
              <Text style={[styles.presetIcon, preset.emergency && styles.emergencyIcon]}>{preset.icon}</Text>
              <View style={styles.presetCopy}>
                <Text style={styles.promiseText}>{preset.promise}</Text>
                <Text style={styles.presetTitle}>{preset.title}</Text>
                <Text style={styles.presetSubtitle}>{preset.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom sit request</Text>
          <Text style={styles.helperText}>Use custom when you want control over details or candidate selection.</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{mode === 'presets' ? 'Review preset details' : 'Build request details'}</Text>
        <Text style={styles.label}>Start time</Text>
        <View style={styles.matrix}>
          {START_GRID.map((item) => {
            const selected = item === startHour || item === startMinute || item === ampm;
            return (
              <Pressable key={item} onPress={() => handleStartGrid(item)} style={[styles.matrixCell, selected && styles.matrixSelected]}>
                <Text style={[styles.matrixText, selected && styles.matrixSelectedText]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>TimeOut duration</Text>
        <View style={styles.matrix}>
          {DURATION_GRID.map((item) => {
            const selected = item === durationHour || item === durationMinute;
            const disabled = item === 'HOURS' || item === 'AWAY';
            return (
              <Pressable key={item} onPress={() => handleDurationGrid(item)} style={[styles.matrixCell, selected && styles.matrixSelected, disabled && styles.matrixLabelCell]}>
                <Text style={[styles.matrixText, selected && styles.matrixSelectedText, disabled && styles.matrixLabelText]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Location and children</Text>
        <View style={styles.twoColumn}>
          <ToggleButton title="Drop-off" selected={location === 'Drop-off'} onPress={() => setLocation('Drop-off')} />
          <ToggleButton title="My Place +4" selected={location === 'My Place'} onPress={() => setLocation('My Place')} />
          <ToggleButton title="1 Child" selected={kidCount === '1 Child'} onPress={() => setKidCount('1 Child')} />
          <ToggleButton title="2+ Children +4" selected={kidCount === '2+ Children'} onPress={() => setKidCount('2+ Children')} />
        </View>

        {isEmergency ? (
          <View style={styles.emergencyBox}>
            <Text style={styles.emergencyTitle}>Emergency pickup details</Text>
            <Text style={styles.helperText}>Add daycare or school location and pickup instructions.</Text>
            <TextInput
              style={styles.input}
              value={daycareDetails}
              onChangeText={setDaycareDetails}
              placeholder="Example: Kindercare on Martin Way"
              placeholderTextColor="#9a6b7c"
            />
          </View>
        ) : null}

        <Text style={styles.label}>Comments</Text>
        <TextInput
          style={[styles.input, styles.comments]}
          value={comments}
          onChangeText={setComments}
          placeholder="Anything the sitter should know?"
          placeholderTextColor="#9a6b7c"
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Review before send</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{requestMessage}</Text>
          {comments ? <Text style={styles.messageNote}>Note: {comments}</Text> : null}
          {daycareDetails ? <Text style={styles.messageNote}>Pickup: {daycareDetails}</Text> : null}
        </View>
        <View style={styles.pointPreview}>
          <Text style={styles.pointNumber}>{points}</Text>
          <Text style={styles.pointLabel}>estimated points</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TimeOut contacts - ping order</Text>
        <Text style={styles.helperText}>
          {isEmergency
            ? 'Emergency uses broadcast. First YES wins.'
            : isPresetFlow
              ? 'Preset flow keeps the ping list simple. Use Custom to manage candidates.'
              : 'Normal AutoPing starts with the lowest point balance first.'}
        </Text>
        {CANDIDATES.map((candidate, index) => (
          <View key={candidate.name} style={styles.candidateRow}>
            <View style={styles.circle}><Text style={styles.circleText}>{index + 1}</Text></View>
            <Text style={styles.candidateName}>{candidate.name}</Text>
            <Text style={styles.balance}>{formatBalance(candidate.balance)}</Text>
          </View>
        ))}
        <Pressable style={styles.sendButton} onPress={sendAutoPing}>
          <Text style={styles.sendText}>{isEmergency ? 'Broadcast Emergency Pickup' : 'AutoPing - Send'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ToggleButton({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggle, selected && styles.toggleSelected]}>
      <Text style={[styles.toggleText, selected && styles.toggleSelectedText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff7fb' },
  content: { padding: 18, paddingBottom: 40 },
  hero: {
    backgroundColor: '#8b2bbf',
    borderRadius: 28,
    padding: 22,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  kicker: { color: '#ffd5ef', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  title: { color: 'white', fontSize: 31, fontWeight: '900', marginTop: 6, lineHeight: 36 },
  tagline: { color: '#ffeaf7', fontSize: 16, marginTop: 8, lineHeight: 22 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  trustPill: { color: 'white', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, fontWeight: '800' },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#f2dced', borderRadius: 18, padding: 4, marginBottom: 14 },
  modeButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  modeSelected: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  modeText: { color: '#76566a', fontWeight: '900', fontSize: 13 },
  modeSelectedText: { color: '#8b2bbf' },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  presetCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ead2e2', borderRadius: 18, padding: 14, marginTop: 10, backgroundColor: '#fffafd' },
  selectedCard: { borderColor: '#8b2bbf', backgroundColor: '#f4e6ff' },
  emergencyPreset: { borderColor: '#ffbf8b', backgroundColor: '#fff4eb' },
  presetIcon: { fontSize: 30, width: 42, color: '#8b2bbf', textAlign: 'center', fontWeight: '900' },
  emergencyIcon: { color: '#c65300' },
  presetCopy: { flex: 1, paddingLeft: 10 },
  promiseText: { color: '#8b2bbf', fontWeight: '900', marginBottom: 2 },
  presetTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  presetSubtitle: { color: '#76566a', marginTop: 3 },
  chevron: { fontSize: 30, color: '#8b2bbf' },
  label: { color: '#372333', fontSize: 15, fontWeight: '900', marginTop: 14, marginBottom: 8 },
  matrix: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#e3bfd6', borderRadius: 14, overflow: 'hidden' },
  matrixCell: { width: '16.666%', paddingVertical: 13, alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e3bfd6', backgroundColor: '#fffafd' },
  matrixSelected: { backgroundColor: '#8b2bbf' },
  matrixText: { color: '#52364b', fontWeight: '800' },
  matrixSelectedText: { color: 'white' },
  matrixLabelCell: { backgroundColor: '#f8edf4' },
  matrixLabelText: { color: '#9a6b7c', fontSize: 11 },
  twoColumn: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toggle: { width: '48%', borderWidth: 1, borderColor: '#e3bfd6', borderRadius: 14, padding: 13, alignItems: 'center', backgroundColor: '#fffafd' },
  toggleSelected: { backgroundColor: '#8b2bbf', borderColor: '#8b2bbf' },
  toggleText: { color: '#52364b', fontWeight: '900' },
  toggleSelectedText: { color: 'white' },
  input: { borderWidth: 1, borderColor: '#e3bfd6', borderRadius: 14, padding: 12, color: '#372333', backgroundColor: '#fffafd' },
  comments: { minHeight: 78, textAlignVertical: 'top' },
  emergencyBox: { backgroundColor: '#fff0e6', borderRadius: 16, padding: 12, marginTop: 14, borderWidth: 1, borderColor: '#ffbf8b' },
  emergencyTitle: { color: '#8a3b00', fontWeight: '900', fontSize: 16 },
  messageBox: { backgroundColor: '#fffafd', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#ead2e2' },
  messageText: { color: '#372333', fontWeight: '800', lineHeight: 22 },
  messageNote: { color: '#76566a', marginTop: 8 },
  pointPreview: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12, gap: 8 },
  pointNumber: { color: '#8b2bbf', fontSize: 42, fontWeight: '900' },
  pointLabel: { color: '#76566a', fontWeight: '800' },
  candidateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0d8e7' },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  circleText: { color: '#8b2bbf', fontWeight: '900' },
  candidateName: { flex: 1, color: '#372333', fontWeight: '800' },
  balance: { color: '#76566a', fontWeight: '900' },
  sendButton: { backgroundColor: '#8b2bbf', padding: 16, borderRadius: 18, alignItems: 'center', marginTop: 16 },
  sendText: { color: 'white', fontSize: 17, fontWeight: '900' },
});
