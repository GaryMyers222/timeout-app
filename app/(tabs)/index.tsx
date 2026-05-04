import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TIMEOUT_PRESETS, TimeoutPreset } from '@/constants/timeout-rules';

export default function TimeOutHomeScreen() {
  const router = useRouter();

  function openPreset(preset: TimeoutPreset) {
    router.push({ pathname: '/create-sit-request', params: { preset: preset.key } });
  }

  function openCustom() {
    router.push({ pathname: '/create-sit-request', params: { preset: 'custom' } });
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
        <View style={[styles.modeButton, styles.modeSelected]}>
          <Text style={[styles.modeText, styles.modeSelectedText]}>QuickPing Presets</Text>
        </View>
        <Pressable onPress={openCustom} style={styles.modeButton}>
          <Text style={styles.modeText}>Custom Sit Request</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pick the kind of help you need</Text>
        <Text style={styles.helperText}>One tap starts a familiar request. Review the details before AutoPing sends.</Text>
        {TIMEOUT_PRESETS.map((preset) => (
          <Pressable
            key={preset.key}
            onPress={() => openPreset(preset)}
            style={[styles.presetCard, preset.emergency && styles.emergencyPreset]}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How TimeOut works</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>Invite trusted sitter-friends into a private circle.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>Create a sit request with presets or custom details.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>AutoPing finds the first YES and points keep the circle moving.</Text></View>
      </View>
    </ScrollView>
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
  emergencyPreset: { borderColor: '#ffbf8b', backgroundColor: '#fff4eb' },
  presetIcon: { fontSize: 30, width: 42, color: '#8b2bbf', textAlign: 'center', fontWeight: '900' },
  emergencyIcon: { color: '#c65300' },
  presetCopy: { flex: 1, paddingLeft: 10 },
  promiseText: { color: '#8b2bbf', fontWeight: '900', marginBottom: 2 },
  presetTitle: { color: '#372333', fontWeight: '900', fontSize: 16 },
  presetSubtitle: { color: '#76566a', marginTop: 3 },
  chevron: { fontSize: 30, color: '#8b2bbf' },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
});
