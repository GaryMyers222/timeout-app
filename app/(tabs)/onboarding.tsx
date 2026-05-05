import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const STORY_CARDS = [
  {
    title: 'Imagine date nights again.',
    body: 'TimeOut helps trusted friends trade babysitting so parents can get a little breathing room.',
  },
  {
    title: 'Friends make the best sitters.',
    body: 'TimeOut is private and invitation-only. It is not a marketplace and does not connect strangers.',
  },
  {
    title: 'One tap AutoPing finds help.',
    body: 'Create a sit request and AutoPing quietly contacts sitter-friends until the first YES.',
  },
  {
    title: 'The points will work out.',
    body: 'Everyone starts at zero. Zero is half full. Going negative is normal when families are actively helping each other.',
  },
  {
    title: 'Your circle is private.',
    body: 'Invite trusted local sitter-friends. Share the app only when a non-local friend wants to start their own circle.',
  },
  {
    title: 'Free to start. No spam.',
    body: 'Early startup should feel safe to explore. Invite friends when you are ready to test the circle.',
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const card = STORY_CARDS[index];
  const atStart = index === 0;
  const atEnd = index === STORY_CARDS.length - 1;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>TimeOut</Text>
        <Text style={styles.title}>A small circle can make life easier.</Text>
        <Text style={styles.tagline}>Use this story to explain the app before asking a new parent to commit.</Text>
      </View>

      <View style={styles.storyCard}>
        <Text style={styles.stepText}>Story {index + 1} of {STORY_CARDS.length}</Text>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardBody}>{card.body}</Text>
        <View style={styles.dotsRow}>
          {STORY_CARDS.map((_, dotIndex) => (
            <View key={dotIndex} style={[styles.dot, dotIndex === index && styles.activeDot]} />
          ))}
        </View>
        <View style={styles.buttonRow}>
          <Pressable disabled={atStart} onPress={() => setIndex((current) => Math.max(0, current - 1))} style={[styles.secondaryButton, atStart && styles.disabledButton]}>
            <Text style={[styles.secondaryButtonText, atStart && styles.disabledButtonText]}>Back</Text>
          </Pressable>
          <Pressable onPress={() => setIndex((current) => atEnd ? 0 : current + 1)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{atEnd ? 'Replay Story' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Startup tone</Text>
        <Text style={styles.helperText}>A first user from the Play Store is still exploring. The experience should reduce fear: this is not a contract, not a payment step, and not a public listing.</Text>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>1</Text><Text style={styles.ruleText}>Emphasize private circle and no strangers.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>2</Text><Text style={styles.ruleText}>Invite language should feel like “please help me test this.”</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>3</Text><Text style={styles.ruleText}>No credit card and no commitment before trust is built.</Text></View>
        <View style={styles.ruleRow}><Text style={styles.ruleDot}>4</Text><Text style={styles.ruleText}>Profile details can come later after the parent sees value.</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invite handoff</Text>
        <Text style={styles.helperText}>After this story, the user can invite trusted local friends from native contacts, or share the app with a non-local friend who wants to start their own circle.</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>Startup invite feel</Text>
          <Text style={styles.messageText}>Please help me test this TimeOut app. It helps trusted friends trade babysitting in a private circle. No strangers, no spam, and free to start.</Text>
        </View>
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
  storyCard: { backgroundColor: 'white', borderRadius: 28, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  stepText: { color: '#8b2bbf', fontWeight: '900', marginBottom: 12 },
  cardTitle: { color: '#372333', fontSize: 29, fontWeight: '900', lineHeight: 34 },
  cardBody: { color: '#76566a', fontSize: 17, lineHeight: 25, marginTop: 12 },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 18 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ead2e2' },
  activeDot: { backgroundColor: '#8b2bbf', width: 24 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  primaryButton: { flex: 1, backgroundColor: '#8b2bbf', borderRadius: 16, padding: 14, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontWeight: '900', fontSize: 16 },
  secondaryButton: { flex: 1, backgroundColor: '#fff0f7', borderColor: '#e3bfd6', borderWidth: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#8b2bbf', fontWeight: '900', fontSize: 16 },
  disabledButton: { opacity: 0.45 },
  disabledButtonText: { color: '#9a6b7c' },
  section: { backgroundColor: 'white', borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0d8e7' },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#372333', marginBottom: 8 },
  helperText: { color: '#76566a', lineHeight: 20, marginBottom: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ruleDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f4e6ff', color: '#8b2bbf', fontWeight: '900', textAlign: 'center', lineHeight: 28, marginRight: 10 },
  ruleText: { flex: 1, color: '#372333', fontWeight: '700', lineHeight: 20 },
  messageBox: { backgroundColor: '#fffafd', borderColor: '#ead2e2', borderWidth: 1, borderRadius: 16, padding: 14 },
  messageTitle: { color: '#372333', fontWeight: '900', marginBottom: 6 },
  messageText: { color: '#52364b', lineHeight: 20 },
});
