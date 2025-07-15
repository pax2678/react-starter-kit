import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          {isSignedIn ? `Welcome, ${user?.firstName || 'User'}!` : 'Welcome!'}
        </ThemedText>
        <HelloWave />
      </ThemedView>

      {!isSignedIn ? (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Get Started</ThemedText>
          <ThemedText>
            Sign in to access your dashboard and premium features.
          </ThemedText>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign Up</Text>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Your Dashboard</ThemedText>
          <ThemedText>
            You're signed in and ready to go! Explore the features available to you.
          </ThemedText>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/pricing')}
          >
            <Text style={styles.buttonText}>View Pricing Plans</Text>
          </TouchableOpacity>
        </ThemedView>
      )}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Features</ThemedText>
        <ThemedText>
          • Real-time data with Convex
        </ThemedText>
        <ThemedText>
          • Secure authentication with Clerk
        </ThemedText>
        <ThemedText>
          • Subscription management with Polar
        </ThemedText>
        <ThemedText>
          • Native mobile experience
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Development</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
