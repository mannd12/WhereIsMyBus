import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '../store/settings';
import { Colors } from '../constants/colors';

export default function SetupScreen() {
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  function handleSave() {
    const trimmed = key.trim();
    if (trimmed.length < 8) {
      setError('Please enter a valid API key (at least 8 characters).');
      return;
    }
    setApiKey(trimmed);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Text style={styles.appName}>Whereismybus</Text>
        <Text style={styles.tagline}>Real-time TransLink arrivals</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Get your free API key</Text>

        <Text style={styles.step}>1. Go to developer.translink.ca</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://developer.translink.ca')}>
          <Text style={styles.link}>Open registration page →</Text>
        </TouchableOpacity>

        <Text style={styles.step}>2. Create a free account and register an app.</Text>
        <Text style={styles.step}>3. Copy your API key and paste it below.</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Paste your API key here"
          placeholderTextColor="#999"
          value={key}
          onChangeText={(t) => { setKey(t); setError(''); }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, !key.trim() && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!key.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        The free tier allows 1,000 requests/day — plenty for personal use.
        Your key is stored only on this device.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.primary,
    padding: 24,
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  heading: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  step: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  link: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
  },
  inputError: { borderColor: Colors.due },
  error: { fontSize: 12, color: Colors.due },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  note: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
