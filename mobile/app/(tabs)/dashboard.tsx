import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { router } from 'expo-router';
import { api } from 'convex/_generated/api';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MetricsCards from '@/components/dashboard/MetricsCards';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';

export default function DashboardScreen() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const subscriptionStatus = useQuery(
    api.subscriptions.checkUserSubscriptionStatus,
    isSignedIn ? { userId } : "skip"
  );
  const upsertUser = useMutation(api.users.upsertUser);

  // Sync user when signed in
  useEffect(() => {
    if (isSignedIn) {
      upsertUser().catch(console.error);
    }
  }, [isSignedIn, upsertUser]);

  // Handle cases where user is not signed in
  if (!isSignedIn) {
    return (
      <ScrollView style={styles.container}>
        <ThemedView style={styles.content}>
          <IconSymbol 
            size={80} 
            color="#808080" 
            name="chart.bar" 
            style={styles.emptyIcon} 
          />
          <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to access your dashboard and analytics
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/sign-in')}
          >
            <ThemedText style={styles.buttonText}>Sign In</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/sign-up')}
          >
            <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>Sign Up</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    );
  }

  // Loading state
  if (subscriptionStatus === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
      </View>
    );
  }

  // Handle non-subscribers - redirect to subscription required
  if (!subscriptionStatus?.hasActiveSubscription) {
    return (
      <ScrollView style={styles.container}>
        <ThemedView style={styles.content}>
          <IconSymbol 
            size={80} 
            color="#FF6B6B" 
            name="lock.fill" 
            style={styles.emptyIcon} 
          />
          <ThemedText type="title" style={styles.title}>Subscription Required</ThemedText>
          <ThemedText style={styles.subtitle}>
            You need an active subscription to access the dashboard
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/pricing')}
          >
            <ThemedText style={styles.buttonText}>View Plans</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/(tabs)')}
          >
            <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    );
  }

  // Main dashboard content for subscribed users
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>
          <ThemedText style={styles.welcomeText}>
            Welcome back, {user?.firstName || 'User'}!
          </ThemedText>
        </View>

        {/* Dashboard Content */}
        <MetricsCards />
        <AnalyticsChart />

        {/* Quick Actions */}
        <ThemedView style={styles.quickActions}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Chat feature will be implemented next')}
          >
            <IconSymbol size={24} color="#007AFF" name="bubble.left" />
            <ThemedText style={styles.actionButtonText}>AI Chat</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/pricing')}
          >
            <IconSymbol size={24} color="#007AFF" name="gearshape" />
            <ThemedText style={styles.actionButtonText}>Billing & Plans</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  quickActions: {
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
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