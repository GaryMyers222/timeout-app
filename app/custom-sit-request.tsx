import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTimeoutStore } from '@/components/timeout-store';
import { calculateSitPoints, durationToHours, KidCount, LocationType } from '@/constants/timeout-rules';

type Meridiem = 'AM' | 'PM';

const HOURS = ['7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6'];
const MINUTES = ['00', '15', '30', '45'];
const DURATION_HOURS = ['1', '2', '3', '4', '5', '6'];
const DURATION_MINUTES = ['00', '30'];
const DATE_CHOICES = ['Today', 'Tomorrow', 'This Weekend'];

function displayDuration(hour: string, minute: string) {
  return `${hour}:${minute}`;
}

export default function CustomSitRequestScreen() {
  const router = useRouter();
  const { createRequest } = useTimeoutStore();
  const [dateLabel, setDateLabel] = useState('Tomorrow');
  const [selectedHour, setSelectedHour] = useState('7');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedMeridiem, setSelectedMeridiem] = useState<Meridiem>('PM');
  const [durationHour, setDurationHour] = useState('3');
  const [durationMinute, setDurationMinute] = useState('00');
  const [selectedKids, setSelectedKids] = useState<KidCount>('1 Child');
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('Drop-off');
  const [comments, setComments] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [showReview, setShowReview] = useState(false);

  const startTimeDisplay = `${selectedHour}:${selectedMinute} ${selectedMeridiem}`;
  const durationDisplay = displayDuration(durationHour, durationMinute);

  const pointBreakdown = useMemo(() => calculateSitPoints({
    durationHours: durationToHours(durationHour, durationMinute),
    kidCount: selectedKids,
    location: selectedLocation,
    isEmergency: false,
  }), [durationHour, durationMinute, selectedKids, selectedLocation]);

  function validate() {
    if (!dateLabel.trim()) return 'Add a date so friends know when you need help.';
    if (durationHour === '0' && durationMinute === '00') return 'Choose a duration.';
    return '';
  }

  function postCustomSit() {
    const request = createRequest({
      presetKey: 'custom',
      title: 'Custom Sit Request',
      dateLabel,
      startTime: startTimeDisplay,
      duration: durationDisplay,
      kidsLabel: selectedKids,
      locationLabel: selectedLocation,
      comments: comments || 'Custom sit request.',
      isPastSit: false,
      autoPingMode: 'sequential',
    });

    router.replace({ pathname: '/explore', params: { requestId: request.id } });
  }

  function handlePrimaryAction() {
    const error = validate();
    if (error) {
      setValidationMessage(error);
      setShowReview(false);
      return;
    }

    setValidationMessage('');
    if (!showReview) {
      setShowReview(true);
      return;
    }

    postCustomSit();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>CUSTOM SIT REQUEST V1 DRAFT</Text>
        <Text style={styles.title}>Ask for the sit you actually need</Text>
        <Text style={styles.bodyText}>Presets sell the dream, but most real use may start here. Review before AutoPing so the parent stays in control.</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>AutoPing behavior</Text>
          <Text style={styles.infoText}>This is not broadcast spam. TimeOut asks trusted members in a careful order until the first YES.</Text>
        </View>
      </View>

      {validationMessage ? <View style={styles.errorBox}><Text style={styles.errorText}>{validationMessage}</Text></View> : null}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>When?</Text>
        <View style={styles.dateRow}>
          {DATE_CHOICES.map((choice) => (
            <Pressable key={choice} style={[styles.choiceButton, dateLabel === choice && styles.choiceButtonSelected]} onPress={() => setDateLabel(choice)}>
              <Text style={[styles.choiceText, dateLabel === choice && styles.choiceTextSelected]}>{choice}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput style={styles.input} value={dateLabel} onChangeText={setDateLabel} placeholder="Or type a date" placeholderTextColor="#9c6a82" />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Start time</Text>
        <Text style={styles.selectedValue}>Selected: {startTimeDisplay}</Text>
        <Text style={styles.gridLabel}>Hour</Text>
        <View style={styles.grid}>{HOURS.map((hour) => <GridButton key={hour} label={hour} selected={selectedHour === hour} onPress={() => setSelectedHour(hour)} />)}</View>
        <Text style={styles.gridLabel}>Minute</Text>
        <View style={styles.grid}>{MINUTES.map((minute) => <GridButton key={minute} label={`:${minute}`} selected={selectedMinute === minute} onPress={() => setSelectedMinute(minute)} />)}</View>
        <Text style={styles.gridLabel}>AM / PM</Text>
        <View style={styles.row}>
          <OptionButton title="AM" selected={selectedMeridiem === 'AM'} onPress={() => setSelectedMeridiem('AM')} />
          <OptionButton title="PM" selected={selectedMeridiem === 'PM'} onPress={() => setSelectedMeridiem('PM')} />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <Text style={styles.selectedValue}>Selected: {durationDisplay} hours</Text>
        <Text style={styles.gridLabel}>Hours</Text>
        <View style={styles.grid}>{DURATION_HOURS.map((hour) => <GridButton key={hour} label={hour} selected={durationHour === hour} onPress={() => setDurationHour(hour)} />)}</View>
        <Text style={styles.gridLabel}>Minutes</Text>
        <View style={styles.grid}>{DURATION_MINUTES.map((minute) => <GridButton key={minute} label={`:${minute}`} selected={durationMinute === minute} onPress={() => setDurationMinute(minute)} />)}</View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Sit details</Text>
        <Text style={styles.gridLabel}>Kids</Text>
        <View style={styles.row}>
          <OptionButton title="One Child" subtitle="Standard ask" selected={selectedKids === '1 Child'} onPress={() => setSelectedKids('1 Child')} />
          <OptionButton title="2+ Children" subtitle="Bigger ask" selected={selectedKids === '2+ Children'} onPress={() => setSelectedKids('2+ Children')} />
        </View>
        <Text style={styles.gridLabel}>Location</Text>
        <View style={styles.row}>
          <OptionButton title="Drop-off" subtitle="At sitter's place" selected={selectedLocation === 'Drop-off'} onPress={() => setSelectedLocation('Drop-off')} />
          <OptionButton title="My Place" subtitle="Sitter comes to you" selected={selectedLocation === 'My Place'} onPress={() => setSelectedLocation('My Place')} />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={comments}
          onChangeText={setComments}
          multiline
          placeholder="Optional: bedtime, snacks, pickup detail, or anything a friend should know."
          placeholderTextColor="#9c6a82"
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Point estimate</Text>
        <View style={styles.pointRow}><Text style={styles.pointNumber}>{pointBreakdown.totalPoints}</Text><Text style={styles.pointText}>points</Text></View>
        <Text style={styles.pointDetail}>Base {pointBreakdown.basePoints} + kids {pointBreakdown.kidsBonus} + location {pointBreakdown.locationBonus}</Text>
        <Text style={styles.bodyText}>Points help create sitter supply because friends earn toward their own TimeOut later.</Text>
      </View>

      {showReview ? (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>Review before AutoPing</Text>
          <Text style={styles.reviewText}>{dateLabel} • {startTimeDisplay} • {durationDisplay} hours</Text>
          <Text style={styles.reviewText}>{selectedKids} • {selectedLocation} • {pointBreakdown.totalPoints} points</Text>
          <Text style={styles.reviewNote}>AutoPing will start after you confirm. First YES wins; other members get updated.</Text>
        </View>
      ) : null}

      <Pressable style={styles.primaryButton} onPress={handlePrimaryAction}>
        <Text style={styles.primaryButtonText}>{showReview ? 'Confirm and Start AutoPing' : 'Review Custom Sit'}</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

function GridButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.gridButton, selected && styles.gridButtonSelected]} onPress={onPress}>
      <Text style={[styles.gridButtonText, selected && styles.gridButtonTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function OptionButton({ title, subtitle, selected, onPress }: { title: string; subtitle?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.optionButton, selected && styles.optionButtonSelected]} onPress={onPress}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{title}</Text>
      {subtitle ? <Text style={[styles.optionSubtext, selected && styles.optionSubtextSelected]}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff6fb' },
  content: { padding: 18, paddingBottom: 42 },
  heroCard: { backgroundColor: '#ffffff', borderColor: '#f4c3dd', borderRadius: 28, borderWidth: 1, marginBottom: 16, padding: 18, shadowColor: '#7e2061', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18 },
  kicker: { color: '#be185d', fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginBottom: 8 },
  title: { color: '#4a1038', fontSize: 31, fontWeight: '900', lineHeight: 36, marginBottom: 10 },
  bodyText: { color: '#7b4a65', fontSize: 15, lineHeight: 22, marginTop: 8 },
  infoBox: { backgroundColor: '#fff0f7', borderColor: '#f0a8cd', borderRadius: 18, borderWidth: 1, marginTop: 12, padding: 13 },
  infoTitle: { color: '#8a1859', fontSize: 15, fontWeight: '900', marginBottom: 4 },
  infoText: { color: '#7b4a65', fontSize: 14, lineHeight: 20 },
  sectionCard: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 24, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { color: '#4a1038', fontSize: 21, fontWeight: '900', marginBottom: 10 },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  choiceButton: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11 },
  choiceButtonSelected: { backgroundColor: '#be185d', borderColor: '#be185d' },
  choiceText: { color: '#5b123d', fontWeight: '900' },
  choiceTextSelected: { color: '#ffffff' },
  input: { backgroundColor: '#fffafd', borderColor: '#ecc3d9', borderRadius: 16, borderWidth: 1, color: '#4a1038', fontSize: 16, padding: 14 },
  multilineInput: { minHeight: 105, textAlignVertical: 'top' },
  selectedValue: { color: '#7b4a65', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  gridLabel: { color: '#a21661', fontSize: 13, fontWeight: '900', letterSpacing: 0.7, marginBottom: 8, marginTop: 8, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  gridButton: { alignItems: 'center', backgroundColor: '#fffafd', borderColor: '#ead2e2', borderRadius: 14, borderWidth: 1, minWidth: 58, paddingHorizontal: 10, paddingVertical: 12 },
  gridButtonSelected: { backgroundColor: '#be185d', borderColor: '#be185d' },
  gridButtonText: { color: '#5b123d', fontSize: 16, fontWeight: '900' },
  gridButtonTextSelected: { color: '#ffffff' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  optionButton: { flex: 1, backgroundColor: '#fffafd', borderColor: '#ead2e2', borderRadius: 18, borderWidth: 1, minHeight: 86, padding: 12, justifyContent: 'center' },
  optionButtonSelected: { backgroundColor: '#be185d', borderColor: '#be185d' },
  optionText: { color: '#5b123d', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  optionTextSelected: { color: '#ffffff' },
  optionSubtext: { color: '#9c6a82', fontSize: 12, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  optionSubtextSelected: { color: '#ffd9ea' },
  pointRow: { alignItems: 'baseline', flexDirection: 'row', gap: 8 },
  pointNumber: { color: '#be185d', fontSize: 42, fontWeight: '900' },
  pointText: { color: '#7b4a65', fontSize: 18, fontWeight: '900' },
  pointDetail: { color: '#7b4a65', fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 4 },
  reviewBox: { backgroundColor: '#fff4eb', borderColor: '#ffbf8b', borderRadius: 22, borderWidth: 1, marginBottom: 14, padding: 16 },
  reviewTitle: { color: '#7a3000', fontSize: 19, fontWeight: '900', marginBottom: 6 },
  reviewText: { color: '#7a4b2a', fontSize: 15, fontWeight: '800', lineHeight: 22 },
  reviewNote: { color: '#7a3000', fontSize: 14, fontWeight: '800', lineHeight: 20, marginTop: 8 },
  errorBox: { backgroundColor: '#fff0f0', borderColor: '#e87b7b', borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 14 },
  errorText: { color: '#9a1f1f', fontSize: 15, fontWeight: '900' },
  primaryButton: { backgroundColor: '#be185d', borderRadius: 20, padding: 17, marginTop: 4, marginBottom: 10 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 4 },
  secondaryButtonText: { color: '#8a1859', fontSize: 16, fontWeight: '900', textAlign: 'center' },
});
