import { useRouter } from 'expo-router';
import React from 'react';
import { Image } from 'expo-image';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { SitPresetKey, useTimeoutStore } from '@/components/timeout-store';

export default function HomeScreen() {
  const router = useRouter();
  const { activeRequest, cancelActiveRequest } = useTimeoutStore();

  const buttons: {
    label: string;
    presetKey: SitPresetKey;
    icon: React.ComponentProps<typeof MaterialIcons>['name'];
    meta: string;
  }[] = [
    {
      label: 'Friday Date + Dine',
      presetKey: 'friday-date-night',
      icon: 'favorite-border',
      meta: 'My place sit • 8 to 11 PM',
    },
    {
      label: 'Saturday Date + Dine',
      presetKey: 'saturday-date-night',
      icon: 'favorite-border',
      meta: 'My place sit • 8 to 11:30 PM',
    },
    {
      label: 'Emergency Daycare Pickup',
      presetKey: 'emergency-daycare-pickup',
      icon: 'local-taxi',
      meta: 'Broadcast ping • first YES wins',
    },
    {
      label: 'Playdate',
      presetKey: 'playdate',
      icon: 'celebration',
      meta: 'RSVP flow • multi-YES is okay',
    },
    {
      label: 'Gathering RSVP',
      presetKey: 'gathering-rsvp',
      icon: 'groups',
      meta: 'Weekend coverage • invite the circle',
    },
    {
      label: 'My TimeOut Anytime',
      presetKey: 'custom',
      icon: 'edit-calendar',
      meta: 'Any date • any time • any reason',
    },
  ];

  const handlePress = (presetKey: SitPresetKey) => {
    if (activeRequest && presetKey !== 'custom') {
      Alert.alert(
        'Active AutoPing today',
        'Only one active AutoPing can run per day. You can check the status screen or cancel it and continue.',
        [
          {
            text: 'View Status',
            onPress: () => router.push('/explore'),
          },
          {
            text: 'Cancel & Continue',
            style: 'destructive',
            onPress: () => {
              cancelActiveRequest();
              router.push({ pathname: '/create-sit-request', params: { preset: presetKey } });
            },
          },
          { text: 'Keep Current', style: 'cancel' },
        ]
      );
      return;
    }

    router.push({ pathname: '/create-sit-request', params: { preset: presetKey } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroShell}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />
        <View style={styles.heroCard}>
          <View style={styles.brandRow}>
            <Image source={require('@/assets/images/icon.png')} style={styles.logo} contentFit="cover" />
            <View style={styles.brandCopy}>
              <Text style={styles.eyebrow}>MY TIMEOUT</Text>
              <Text style={styles.title}>No more hunting and begging for a sitter.</Text>
              <Text style={styles.subtitle}>
                Quick-ping presets for the moments you need breathing room fast.
              </Text>
            </View>
          </View>

          {activeRequest ? (
            <View style={styles.activeCard}>
              <Text style={styles.activeLabel}>ACTIVE TODAY</Text>
              <Text style={styles.activeTitle}>{activeRequest.title}</Text>
              <Text style={styles.activeMeta}>
                {activeRequest.dateLabel} at {activeRequest.startTime} for {activeRequest.duration}
              </Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/explore')}>
                <Text style={styles.secondaryButtonText}>Open Status Screen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.marketingCard}>
              <Text style={styles.marketingTitle}>One-tap AutoPing presets</Text>
              <Text style={styles.marketingCopy}>
                Friends make the best sitters. Pick a preset, adjust the time, and let the circle work it out.
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick-Ping Presets</Text>

      {buttons.map(({ label, presetKey, icon, meta }) => (
        <TouchableOpacity
          key={presetKey}
          style={styles.button}
          onPress={() => handlePress(presetKey)}>
          <View style={styles.buttonIconWrap}>
            <MaterialIcons name={icon} size={24} color="#9d174d" />
          </View>
          <View style={styles.buttonCopy}>
            <Text style={styles.buttonText}>{label}</Text>
            <Text style={styles.buttonMeta}>{meta}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#be185d" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff6fb',
    padding: 18,
    paddingBottom: 36,
  },
  heroShell: {
    marginBottom: 20,
    position: 'relative',
  },
  glowOne: {
    backgroundColor: '#f9a8d4',
    borderRadius: 140,
    height: 180,
    opacity: 0.34,
    position: 'absolute',
    right: -30,
    top: -20,
    width: 180,
  },
  glowTwo: {
    backgroundColor: '#c084fc',
    borderRadius: 120,
    height: 150,
    left: -20,
    opacity: 0.22,
    position: 'absolute',
    top: 30,
    width: 150,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderColor: '#f5c2dc',
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
    shadowColor: '#7e2061',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  logo: {
    borderRadius: 22,
    height: 86,
    marginRight: 14,
    width: 86,
  },
  brandCopy: {
    flex: 1,
  },
  eyebrow: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  title: {
    color: '#4a1038',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: '#7a4b68',
    fontSize: 15,
    lineHeight: 21,
  },
  activeCard: {
    backgroundColor: '#fff1f7',
    borderColor: '#f9a8d4',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  activeLabel: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  activeTitle: {
    color: '#6b124e',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  activeMeta: {
    color: '#8b4a6a',
    fontSize: 15,
    marginBottom: 14,
  },
  marketingCard: {
    backgroundColor: '#fff7fb',
    borderColor: '#fbcfe8',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  marketingTitle: {
    color: '#6b124e',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  marketingCopy: {
    color: '#8b4a6a',
    fontSize: 15,
    lineHeight: 21,
  },
  sectionTitle: {
    color: '#8a1859',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 12,
    paddingHorizontal: 6,
    textTransform: 'uppercase',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f3d2e3',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#7e2061',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
  },
  buttonIconWrap: {
    alignItems: 'center',
    backgroundColor: '#ffe4ef',
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    marginRight: 14,
    width: 44,
  },
  buttonCopy: {
    flex: 1,
  },
  buttonText: {
    color: '#5b123d',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonMeta: {
    color: '#8f5a76',
    fontSize: 13,
    marginTop: 3,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#f3b3d5',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#a21661',
    fontSize: 15,
    fontWeight: '600',
  },
});
