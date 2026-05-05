import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MOCK_CANDIDATES } from '@/constants/timeout-rules';

type CandidateOverride = {
  id: string;
  included: boolean;
  reason?: string;
};

function defaultOverrides() {
  return MOCK_CANDIDATES.reduce<Record<string, CandidateOverride>>((acc, candidate) => {
    acc[candidate.id] = { id: candidate.id, included: true };
    return acc;
  }, {});
}

function formatBalance(points: number) {
  if (points > 0) return `+${points}`;
  return `${points}`;
}

function isSpecialCandidate(id: string) {
  return id.includes('grandma') || id.includes('teen');
}

export default function PingOrderScreen() {
  const [overrides, setOverrides] = useState(defaultOverrides);
  const [showEducation, setShowEducation] = useState(true);
  const [presetFlow, setPresetFlow] = useState(false);

  const orderedCandidates = useMemo(() => {
    return [...MOCK_CANDIDATES].sort((a, b) => a.pointsBalance - b.pointsBalance);
  }, []);

  const includedCandidates = orderedCandidates.filter((candidate) => overrides[candidate.id]?.included);
  const excludedCandidates = orderedCandidates.filter((candidate) => !overrides[candidate.id]?.included);

  function toggleCandidate(id: string) {
    if (presetFlow) return;

    setOverrides((current) => ({
      ...current,
      [id]: {
        id,
        included: !current[id]?.included,
        reason: current[id]?.included ? 'Requester safety/comfort exclusion' : undefined,
      },
    }));
  }

  function resetOrder() {
    setOverrides(defaultOverrides());
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Ping Order</Text>
        <Text style={styles.title}>Default order, parent control.</Text>
        <Text style={styles.tagline}>AutoPing starts with the lowest point balance first, but custom requests preserve parent choice and safety.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flow mode</Text>
        <Text style={styles.helperText}>Presets stay low-friction. Custom requests allow candidate control when safety, comfort, or care setting matters.</Text>
        <View style={styles.modeSwitch}>
          <Pressable onPress={() => setPresetFlow(false)} style={[styles.modeButton, !presetFlow && styles.modeSelected]}>
            <Text style={[styles.modeText, !presetFlow && styles.modeSelectedText]}>Custom Request</Text>
          </Pressable>
          <Pressable onPress={() => setPresetFlow(true)} style={[styles.modeButton, presetFlow && styles.modeSelected]}>
            <Text style={[styles.modeText, presetFlow && styles.modeSelectedText]}>Preset Flow</Text>
          </Pressable>
        </View>
        {presetFlow ? (
          <View style={styles.lockBox}>
            <Text style={styles.lockTitle}>Preset ping list is simplified</Text>
            <Text style={styles.lockText}>Preset flows do not invite casual editing. Use Custom Request when the requester wants control over the candidate list.</Text>
          </View>
        ) : null}
      </View>

      {showEducation ? (
        <View style={styles.educationBox}>
          <View style={styles.educationHeader}>
            <Text style={styles.educationTitle}>Why lowest balance first?</Text>
            <Pressable onPress={() => setShowEducation(false)}><Text style={styles.hideText}>Hide</Text></Pressable>
          </View>
          <Text style={styles.educationText}>The member deepest in point debt gets the first chance to earn points back. This keeps the circle moving. It is a circulation mechanic, not a fairness accusation.</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>TimeOut contacts - ping order</Text>
            <Text style={styles.helperText}>{includedCandidates.length} included • {excludedCandidates.length} excluded</Text>
          </View>
          <Pressable onPress={resetOrder} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        {orderedCandidates.map((candidate, index) => {
          const included = overrides[candidate.id]?.included;
          const special = isSpecialCandidate(candidate.id);
          return (
            <Pressable
              key={candidate.id}
              onPress={() => toggleCandidate(candidate.id)}
              style={[styles.candidateCard, !included && styles.excludedCard, presetFlow && styles.lockedCard]}>
              <View style={styles.orderCircle}><Text style={styles.orderText}>{index + 1}</Text></View>
              <View style={styles.candidateCopy}>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <Text style={styles.candidateMeta}>{special ? 'Special contact / edge case' : candidate.channel === 'sms' ? 'SMS fallback' : 'App user'}</Text>
                {!included ? <Text style={styles.exclusionReason}>Excluded: safety/comfort choice</Text> : null}
              </View>
              <View style={styles.balanceBox}>
                <Text style={styles.balance}>{formatBalance(candidate.pointsBalance)}</Text>
                <Text style={styles.balanceLabel}>pts</Text>
              </View>
              <View style={[styles.checkCircle, included && styles.checkCircleIncluded]}>
                <Text style={[styles.checkText, included && styles.checkTextIncluded]}>{included ? '✓' : '–'}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Message preview</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Sara sent you a TimeOut sit request.\n\nFriday 7:00–10:00 PM\n1 child • Drop-off\n\nReply YES if you can help.</Text>
        </View>
        <Text style={styles.helperText}>The responder sees a short message. The requester sees status. After AutoPing starts, the requester waits for first YES.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Implementation rules</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>Default order sorts lowest point balance first.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>Custom requests allow exclusions for parent choice and liability protection.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>Preset requests should not make casual list editing prominent.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>4</Text><Text style={styles.ruleText}>Each outgoing ping must attach to one unique sit request ID.</Text></View>
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#f2dced', borderRadius: 18, padding: 4 },
  modeButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  modeSelected: { backgroundColor: 'white' },
  modeText: { color: '#76566a', fontWeight: '900', fontSize: 13 },
  modeSelectedText: { color: '#8b2bbf' },
  lockBox: { backgroundColor: '#fff4eb', borderColor: '#ffbf8b', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  lockTitle: { color: '#7a3000', fontWeight: '900', marginBottom: 4 },
  lockText: { color: '#7a4b2a', lineHeight: 20 },
  educationBox: { backgroundColor: '#f2fff7', borderColor: '#b8e8c8', borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 14 },
  educationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  educationTitle: { color: '#20894d', fontSize: 18, fontWeight: '900' },
  educationText: { color: '#35634a', lineHeight: 20, marginTop: 8 },
  hideText: { color: '#20894d', fontWeight: '900' },
  resetButton: { backgroundColor: '#f4e6ff', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  resetText: { color: '#8b2bbf', fontWeight: '900' },
  candidateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 10, gap: 10 },
  excludedCard: { backgroundColor: '#fff0f0', borderColor: '#e87b7b' },
  lockedCard: { opacity: 0.72 },
  orderCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f4e6ff', alignItems: 'center', justifyContent: 'center' },
  orderText: { color: '#8b2bbf', fontWeight: '900' },
  candidateCopy: { flex: 1 },
  candidateName: { color: '#372333', fontSize: 16, fontWeight: '900' },
  candidateMeta: { color: '#76566a', marginTop: 2 },
  exclusionReason: { color: '#9a1f1f', fontWeight: '800', marginTop: 4 },
  balanceBox: { alignItems: 'center' },
  balance: { color: '#372333', fontSize: 17, fontWeight: '900' },
  balanceLabel: { color: '#76566a', fontSize: 11, fontWeight: '800' },
  checkCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#e3bfd6', alignItems: 'center', justifyContent: 'center' },
  checkCircleIncluded: { backgroundColor: '#8b2bbf', borderColor: '#8b2bbf' },
  checkText: { color: '#9a1f1f', fontWeight: '900' },
  checkTextIncluded: { color: 'white' },
  messageBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  messageText: { color: '#52364b', lineHeight: 20 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
});
