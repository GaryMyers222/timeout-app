import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTimeoutStore } from '@/components/timeout-store';
import {
  AutoPingMode,
  calculateSitPoints,
  durationToHours,
  KidCount,
  LocationType,
  PRESET_BY_KEY,
  SitPresetKey,
} from '@/constants/timeout-rules';

const customPreset = {
  key: 'custom' as SitPresetKey,
  title: 'Custom Sit Request',
  dateLabel: 'Select date',
  comments: '',
  autoPingMode: 'sequential' as AutoPingMode,
  startHour: '7',
  startMinute: ':00',
  ampm: 'PM' as const,
  durationHour: '3',
  durationMinute: ':00',
  location: 'Drop-off' as LocationType,
  kidCount: '1 Child' as KidCount,
  emergency: false,
};

type PickupTiming = 'ASAP' | 'Specific time';
type CarSeatNeed = 'Unknown' | 'Needed' | 'Not needed';

function normalizeMinute(minute: string) {
  return minute.startsWith(':') ? minute.replace(':', '') : minute;
}

function displayDuration(hour: string, minute: string) {
  return `${hour}:${normalizeMinute(minute)}`;
}

export default function CreateSitRequestScreen() {
  const router = useRouter();
  const { preset } = useLocalSearchParams<{ preset?: SitPresetKey }>();
  const { activeRequest, cancelActiveRequest, createRequest } = useTimeoutStore();
  const selectedPresetKey: SitPresetKey = preset && PRESET_BY_KEY[preset] ? preset : 'custom';
  const selectedPreset = selectedPresetKey === 'custom' ? customPreset : PRESET_BY_KEY[selectedPresetKey];

  const [selectedHour, setSelectedHour] = useState(selectedPreset.startHour);
  const [selectedMinute, setSelectedMinute] = useState(normalizeMinute(selectedPreset.startMinute));
  const [selectedMeridiem, setSelectedMeridiem] = useState<'AM' | 'PM'>(selectedPreset.ampm);

  const [selectedDurationHour, setSelectedDurationHour] = useState(selectedPreset.durationHour);
  const [selectedDurationMinute, setSelectedDurationMinute] = useState(normalizeMinute(selectedPreset.durationMinute));

  const [selectedKids, setSelectedKids] = useState<KidCount>(selectedPreset.kidCount);
  const [selectedLocation, setSelectedLocation] = useState<LocationType>(selectedPreset.location);
  const [dateLabel, setDateLabel] = useState(selectedPresetKey === 'custom' ? 'Select date' : 'Today');
  const [comments, setComments] = useState(selectedPreset.comments);
  const [requestTitle, setRequestTitle] = useState(selectedPreset.title);
  const [autoPingMode, setAutoPingMode] = useState<AutoPingMode>(selectedPreset.autoPingMode);
  const [isPastSit, setIsPastSit] = useState(false);
  const [pickupTiming, setPickupTiming] = useState<PickupTiming>('ASAP');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupContact, setPickupContact] = useState('');
  const [carSeatNeed, setCarSeatNeed] = useState<CarSeatNeed>('Unknown');
  const [handoffDetails, setHandoffDetails] = useState('');
  const [daycareDetails, setDaycareDetails] = useState('');

  const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const minutes = ['00', '15', '30', '45'];
  const meridiems: Array<'AM' | 'PM'> = ['AM', 'PM'];
  const isEmergency = selectedPresetKey === 'emergency-daycare-pickup';

  const startTimeDisplay = useMemo(
    () => `${selectedHour}:${selectedMinute} ${selectedMeridiem}`,
    [selectedHour, selectedMinute, selectedMeridiem]
  );

  const emergencyStartLabel = pickupTiming === 'ASAP' ? 'ASAP' : startTimeDisplay;

  const durationDisplay = useMemo(
    () => displayDuration(selectedDurationHour, selectedDurationMinute),
    [selectedDurationHour, selectedDurationMinute]
  );

  const pointBreakdown = useMemo(
    () =>
      calculateSitPoints({
        durationHours: durationToHours(selectedDurationHour, selectedDurationMinute),
        kidCount: selectedKids,
        location: selectedLocation,
        isEmergency,
      }),
    [isEmergency, selectedDurationHour, selectedDurationMinute, selectedKids, selectedLocation]
  );

  useEffect(() => {
    setSelectedHour(selectedPreset.startHour);
    setSelectedMinute(normalizeMinute(selectedPreset.startMinute));
    setSelectedMeridiem(selectedPreset.ampm);
    setSelectedDurationHour(selectedPreset.durationHour);
    setSelectedDurationMinute(normalizeMinute(selectedPreset.durationMinute));
    setSelectedKids(selectedPreset.kidCount);
    setSelectedLocation(selectedPreset.location);
    setDateLabel(selectedPresetKey === 'custom' ? 'Select date' : 'Today');
    setComments(selectedPreset.comments);
    setRequestTitle(selectedPreset.title);
    setAutoPingMode(selectedPreset.autoPingMode);
    setIsPastSit(false);
    setPickupTiming('ASAP');
    setPickupLocation('');
    setPickupContact('');
    setCarSeatNeed('Unknown');
    setHandoffDetails('');
    setDaycareDetails('');
  }, [selectedPresetKey]);

  const autoPingSummary = useMemo(() => {
    if (isPastSit) {
      return 'Past Sit Mode: requester-only entry, no AutoPing, immediate ledger posting.';
    }

    if (isEmergency) {
      return 'Emergency broadcast: confirm details, then ping the circle immediately for the first YES.';
    }

    if (autoPingMode === 'broadcast') {
      return 'Broadcast AutoPing: all candidates get pinged at once and the first YES wins.';
    }

    return 'Sequential AutoPing: candidates are contacted in debt-first order until the first YES.';
  }, [autoPingMode, isEmergency, isPastSit]);

  const handleSubmit = () => {
    if (!dateLabel.trim() || dateLabel === 'Select date') {
      Alert.alert('Missing date', 'Add a date label so the request can be posted.');
      return;
    }

    if (isEmergency && !pickupLocation.trim()) {
      Alert.alert('Pickup location needed', 'Add the daycare, school, or pickup location before broadcasting.');
      return;
    }

    const emergencyDetails = isEmergency
      ? [
          `Pickup timing: ${emergencyStartLabel}`,
          `Pickup location: ${pickupLocation.trim()}`,
          pickupContact.trim() ? `Pickup contact: ${pickupContact.trim()}` : '',
          `Car seat: ${carSeatNeed}`,
          handoffDetails.trim() ? `After-pickup / handoff: ${handoffDetails.trim()}` : '',
          daycareDetails.trim() ? `Other details: ${daycareDetails.trim()}` : '',
          'Requester must authorize pickup by the confirmed sitter name.',
          'Exchange phone/address details off app if needed.',
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    const finalComments = isEmergency
      ? `${comments}\n${emergencyDetails}`
      : comments;

    const postRequest = () => {
      const nextRequest = createRequest({
        presetKey: selectedPresetKey,
        title: requestTitle,
        dateLabel,
        startTime: isEmergency ? emergencyStartLabel : startTimeDisplay,
        duration: durationDisplay,
        kidsLabel: selectedKids,
        locationLabel: selectedLocation,
        comments: finalComments,
        isPastSit,
        autoPingMode: isPastSit ? 'disabled' : autoPingMode,
      });
      router.replace({ pathname: '/explore', params: { requestId: nextRequest.id } });
    };

    const confirmEmergency = () => {
      Alert.alert(
        'Broadcast emergency pickup?',
        'This will ping the circle now. First YES wins. You still need to authorize pickup with the daycare/school and share any off-app phone or address details needed for handoff.',
        [
          { text: 'Review Again', style: 'cancel' },
          { text: 'Broadcast Now', style: 'destructive', onPress: postRequest },
        ]
      );
    };

    if (activeRequest && !isPastSit) {
      Alert.alert(
        'Active AutoPing today',
        'Only one active AutoPing can run per day. Cancel the current one first or log this as a past sit.',
        [
          { text: 'Open Status', onPress: () => router.replace('/explore') },
          {
            text: 'Cancel & Post This One',
            style: 'destructive',
            onPress: () => {
              cancelActiveRequest();
              if (isEmergency) confirmEmergency();
              else postRequest();
            },
          },
          { text: 'Keep Current', style: 'cancel' },
        ]
      );
      return;
    }

    if (isEmergency && !isPastSit) {
      confirmEmergency();
      return;
    }

    postRequest();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIdentity}>
            <Image source={require('@/assets/images/icon.png')} style={styles.logo} contentFit="cover" />
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>SCHEDULE MY TIMEOUT</Text>
              <Text style={styles.title}>{requestTitle}</Text>
              <Text style={styles.subtitle}>Friends make the best sitters. The points will work out.</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>AUTOPING MODE</Text>
          <Text style={styles.infoCardText}>{autoPingSummary}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.label}>Request Title</Text>
        <TextInput style={styles.input} value={requestTitle} onChangeText={setRequestTitle} />
        <Text style={styles.label}>Date</Text>
        <TextInput style={styles.input} value={dateLabel} onChangeText={setDateLabel} />
      </View>

      {isEmergency ? (
        <View style={styles.sectionCard}>
          <Text style={styles.label}>Emergency Pickup Timing</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.optionButton, pickupTiming === 'ASAP' ? styles.optionButtonSelected : null]} onPress={() => setPickupTiming('ASAP')}>
              <Text style={[styles.optionText, pickupTiming === 'ASAP' ? styles.optionTextSelected : null]}>ASAP</Text>
              <Text style={[styles.optionSubtext, pickupTiming === 'ASAP' ? styles.optionSubtextSelected : null]}>Default urgent pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, pickupTiming === 'Specific time' ? styles.optionButtonSelected : null]} onPress={() => setPickupTiming('Specific time')}>
              <Text style={[styles.optionText, pickupTiming === 'Specific time' ? styles.optionTextSelected : null]}>Specific Time</Text>
              <Text style={[styles.optionSubtext, pickupTiming === 'Specific time' ? styles.optionSubtextSelected : null]}>Use time picker below</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {(!isEmergency || pickupTiming === 'Specific time') ? (
        <View style={styles.sectionCard}>
          <Text style={styles.label}>{isEmergency ? 'Pickup Time' : 'Start Time'}</Text>
          <Text style={styles.selectedValue}>Selected: {startTimeDisplay}</Text>

          <Text style={styles.gridSectionLabel}>Hour</Text>
          <View style={styles.grid}>
            {hours.map((hour) => (
              <TouchableOpacity
                key={`start-hour-${hour}`}
                style={[styles.gridButton, selectedHour === hour ? styles.gridButtonSelected : null]}
                onPress={() => setSelectedHour(hour)}>
                <Text style={[styles.gridButtonText, selectedHour === hour ? styles.gridButtonTextSelected : null]}>{hour}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.gridSectionLabel}>Minute</Text>
          <View style={styles.grid}>
            {minutes.map((minute) => (
              <TouchableOpacity
                key={`start-minute-${minute}`}
                style={[styles.gridButton, selectedMinute === minute ? styles.gridButtonSelected : null]}
                onPress={() => setSelectedMinute(minute)}>
                <Text style={[styles.gridButtonText, selectedMinute === minute ? styles.gridButtonTextSelected : null]}>:{minute}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.gridSectionLabel}>AM / PM</Text>
          <View style={styles.row}>
            {meridiems.map((meridiem) => (
              <TouchableOpacity
                key={meridiem}
                style={[styles.optionButton, selectedMeridiem === meridiem ? styles.optionButtonSelected : null]}
                onPress={() => setSelectedMeridiem(meridiem)}>
                <Text style={[styles.optionText, selectedMeridiem === meridiem ? styles.optionTextSelected : null]}>{meridiem}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {!isEmergency ? (
        <View style={styles.sectionCard}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.selectedValue}>Selected: {durationDisplay} hours</Text>

          <Text style={styles.gridSectionLabel}>Hours</Text>
          <View style={styles.grid}>
            {hours.map((hour) => (
              <TouchableOpacity
                key={`duration-hour-${hour}`}
                style={[styles.gridButton, selectedDurationHour === hour ? styles.gridButtonSelected : null]}
                onPress={() => setSelectedDurationHour(hour)}>
                <Text style={[styles.gridButtonText, selectedDurationHour === hour ? styles.gridButtonTextSelected : null]}>{hour}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.gridSectionLabel}>Minutes</Text>
          <View style={styles.grid}>
            {minutes.map((minute) => (
              <TouchableOpacity
                key={`duration-minute-${minute}`}
                style={[styles.gridButton, selectedDurationMinute === minute ? styles.gridButtonSelected : null]}
                onPress={() => setSelectedDurationMinute(minute)}>
                <Text style={[styles.gridButtonText, selectedDurationMinute === minute ? styles.gridButtonTextSelected : null]}>:{minute}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {isEmergency ? (
        <View style={styles.sectionCard}>
          <Text style={styles.label}>Pickup Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Daycare or school name and location"
            value={pickupLocation}
            onChangeText={setPickupLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Pickup contact / front desk phone / teacher name"
            value={pickupContact}
            onChangeText={setPickupContact}
          />
          <Text style={styles.gridSectionLabel}>Car seat</Text>
          <View style={styles.row}>
            {(['Unknown', 'Needed', 'Not needed'] as CarSeatNeed[]).map((need) => (
              <TouchableOpacity key={need} style={[styles.optionButton, carSeatNeed === need ? styles.optionButtonSelected : null]} onPress={() => setCarSeatNeed(need)}>
                <Text style={[styles.optionText, carSeatNeed === need ? styles.optionTextSelected : null]}>{need}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Where should the sitter take the child? How will requester retrieve child after work?"
            multiline
            value={handoffDetails}
            onChangeText={setHandoffDetails}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Other details: child name, authorization note, allergies, gate code, etc."
            multiline
            value={daycareDetails}
            onChangeText={setDaycareDetails}
          />
          <Text style={styles.emergencyNote}>Reminder: TimeOut can coordinate the ping, but pickup authorization and phone/address exchange are still handled by the parents and confirmed sitter.</Text>
        </View>
      ) : (
        <View style={styles.sectionCard}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, selectedLocation === 'Drop-off' ? styles.optionButtonSelected : null]}
              onPress={() => setSelectedLocation('Drop-off')}>
              <Text style={[styles.optionText, selectedLocation === 'Drop-off' ? styles.optionTextSelected : null]}>Drop-Off</Text>
              <Text style={[styles.optionSubtext, selectedLocation === 'Drop-off' ? styles.optionSubtextSelected : null]}>At sitter&apos;s place</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, selectedLocation === 'My Place' ? styles.optionButtonSelected : null]}
              onPress={() => setSelectedLocation('My Place')}>
              <Text style={[styles.optionText, selectedLocation === 'My Place' ? styles.optionTextSelected : null]}>My Place</Text>
              <Text style={[styles.optionSubtext, selectedLocation === 'My Place' ? styles.optionSubtextSelected : null]}>Sit happens at home</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Kids</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, selectedKids === '1 Child' ? styles.optionButtonSelected : null]}
              onPress={() => setSelectedKids('1 Child')}>
              <Text style={[styles.optionText, selectedKids === '1 Child' ? styles.optionTextSelected : null]}>One Child</Text>
              <Text style={[styles.optionSubtext, selectedKids === '1 Child' ? styles.optionSubtextSelected : null]}>Standard sit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, selectedKids === '2+ Children' ? styles.optionButtonSelected : null]}
              onPress={() => setSelectedKids('2+ Children')}>
              <Text style={[styles.optionText, selectedKids === '2+ Children' ? styles.optionTextSelected : null]}>2+ Children</Text>
              <Text style={[styles.optionSubtext, selectedKids === '2+ Children' ? styles.optionSubtextSelected : null]}>Bigger ask</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.sectionCard}>
        <Text style={styles.label}>Estimated Points</Text>
        <View style={styles.pointRow}>
          <Text style={styles.pointNumber}>{pointBreakdown.totalPoints}</Text>
          <Text style={styles.pointText}>points</Text>
        </View>
        <Text style={styles.pointDetail}>Base {pointBreakdown.basePoints} + kids {pointBreakdown.kidsBonus} + location {pointBreakdown.locationBonus} + emergency {pointBreakdown.emergencyBonus}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.label}>Comments</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Optional comments"
          multiline
          value={comments}
          onChangeText={setComments}
        />

        {!isEmergency ? (
          <>
            <Text style={styles.label}>Posting Mode</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.optionButton, isPastSit ? null : styles.optionButtonSelected]} onPress={() => setIsPastSit(false)}>
                <Text style={[styles.optionText, isPastSit ? null : styles.optionTextSelected]}>AutoPing</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionButton, isPastSit ? styles.optionButtonSelected : null]} onPress={() => setIsPastSit(true)}>
                <Text style={[styles.optionText, isPastSit ? styles.optionTextSelected : null]}>Past Sit</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>{isEmergency ? 'Confirm & Broadcast Pickup' : isPastSit ? 'Log Past Sit' : 'Start AutoPing'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ghostButton} onPress={() => router.back()}>
        <Text style={styles.ghostButtonText}>Back to My TimeOut</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff6fb', padding: 18, paddingBottom: 36 },
  heroCard: { backgroundColor: '#ffffff', borderColor: '#f4c3dd', borderRadius: 28, borderWidth: 1, marginBottom: 18, padding: 18, shadowColor: '#7e2061', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18 },
  heroTopRow: { marginBottom: 14 },
  heroIdentity: { alignItems: 'center', flexDirection: 'row' },
  logo: { borderRadius: 20, height: 70, marginRight: 14, width: 70 },
  heroCopy: { flex: 1 },
  eyebrow: { color: '#be185d', fontSize: 12, fontWeight: '700', letterSpacing: 1.6, marginBottom: 6 },
  title: { color: '#5b123d', fontSize: 27, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#84516e', fontSize: 15, lineHeight: 20 },
  infoCard: { backgroundColor: '#fff2f8', borderColor: '#f7b7d6', borderRadius: 22, borderWidth: 1, padding: 16 },
  infoCardLabel: { color: '#a21661', fontSize: 12, fontWeight: '700', letterSpacing: 1.3, marginBottom: 6 },
  infoCardText: { color: '#7d345b', fontSize: 15, lineHeight: 22 },
  sectionCard: { backgroundColor: '#ffffff', borderColor: '#f3d2e3', borderRadius: 24, borderWidth: 1, marginBottom: 16, padding: 16 },
  label: { color: '#8a1859', fontSize: 13, fontWeight: '600', letterSpacing: 1.1, marginBottom: 8, marginTop: 4, textTransform: 'uppercase' },
  selectedValue: { color: '#8b4a6a', fontSize: 15, marginBottom: 12 },
  gridSectionLabel: { color: '#a21661', fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#ecc3d9', borderRadius: 16, padding: 14, fontSize: 16, backgroundColor: '#fff8fc', color: '#4a1038', marginBottom: 12 },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  gridButton: { alignItems: 'center', backgroundColor: '#fff8fc', borderColor: '#ebcada', borderRadius: 14, borderWidth: 1, minWidth: 58, paddingHorizontal: 10, paddingVertical: 12 },
  gridButtonSelected: { backgroundColor: '#be185d', borderColor: '#be185d', borderWidth: 2 },
  gridButtonText: { color: '#5b123d', fontSize: 16, fontWeight: '600' },
  gridButtonTextSelected: { color: '#ffffff' },
  optionButton: { flex: 1, backgroundColor: '#fff8fc', borderWidth: 1, borderColor: '#ecc3d9', borderRadius: 18, minHeight: 92, paddingHorizontal: 12, paddingVertical: 14 },
  optionButtonSelected: { backgroundColor: '#be185d', borderColor: '#be185d', borderWidth: 2 },
  optionText: { color: '#5b123d', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  optionTextSelected: { color: '#ffffff' },
  optionSubtext: { color: '#9c6a82', fontSize: 12, marginTop: 6, textAlign: 'center' },
  optionSubtextSelected: { color: '#ffd9ea' },
  emergencyNote: { color: '#8a1859', fontSize: 13, fontWeight: '600', lineHeight: 19, marginTop: 8 },
  pointRow: { alignItems: 'baseline', flexDirection: 'row', gap: 8 },
  pointNumber: { color: '#be185d', fontSize: 42, fontWeight: '800' },
  pointText: { color: '#84516e', fontSize: 18, fontWeight: '700' },
  pointDetail: { color: '#84516e', fontSize: 13, lineHeight: 19, marginTop: 6 },
  primaryButton: { backgroundColor: '#be185d', padding: 18, borderRadius: 20, marginTop: 12, marginBottom: 12 },
  primaryButtonText: { color: '#ffffff', textAlign: 'center', fontSize: 18, fontWeight: '600' },
  ghostButton: { backgroundColor: '#ffffff', borderColor: '#ecc3d9', borderRadius: 20, borderWidth: 1, marginBottom: 24, padding: 16 },
  ghostButtonText: { color: '#8a1859', fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
