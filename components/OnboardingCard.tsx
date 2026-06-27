import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

/** First-run intro: sets expectations that BusPulse is a real-time *bus* app. */
export function OnboardingCard({ visible, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="bus" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>Welcome to BusPulse</Text>
          <Text style={styles.body}>
            Real-time bus tracking for Metro Vancouver. See live arrivals, tap a bus to follow it
            on the map, and get a reminder before it comes.
          </Text>
          <Text style={styles.note}>
            Live data covers buses. SkyTrain, SeaBus and West Coast Express aren't tracked in
            TransLink's public feed.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onDismiss}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.buttonText}>Get started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  body: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 21 },
  note: { fontSize: 12, color: '#777', textAlign: 'center', lineHeight: 17 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 28,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
