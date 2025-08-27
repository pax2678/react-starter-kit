import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery, useAction, useMutation } from 'convex/react';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { api } from 'convex/_generated/api';

export default function SettingsScreen() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const subscription = useQuery(api.subscriptions.fetchUserSubscription);
  const subscriptionStatus = useQuery(
    api.subscriptions.checkUserSubscriptionStatus,
    isSignedIn ? { userId } : "skip"
  );
  const createPortalUrl = useAction(api.subscriptions.createCustomerPortalUrl);
  const upsertUser = useMutation(api.users.upsertUser);

  // Sync user when signed in (same as pricing screen)
  useEffect(() => {
    if (isSignedIn) {
      upsertUser().catch(console.error);
    }
  }, [isSignedIn, upsertUser]);

  // Debug logging
  useEffect(() => {
    console.log('⚙️ Settings Debug - subscription:', subscription);
    console.log('⚙️ Settings Debug - subscriptionStatus:', subscriptionStatus);
    console.log('⚙️ Settings Debug - isSignedIn:', isSignedIn);
    console.log('⚙️ Settings Debug - userId:', userId);
    
    // Additional debugging for subscription data
    if (subscription === null) {
      console.log('⚠️ fetchUserSubscription returned null - using fallback approach');
    }
  }, [subscription, subscriptionStatus, isSignedIn, userId]);

  const handleManageSubscription = async () => {
    if (!subscription?.customerId) {
      Alert.alert('Error', 'No customer ID found');
      return;
    }

    setLoadingPortal(true);
    try {
      const result = await createPortalUrl({
        customerId: subscription.customerId,
      });
      await Linking.openURL(result.url);
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      Alert.alert('Error', 'Failed to open customer portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return '#10B981'; // green
      case "canceled":
        return '#EF4444'; // red
      case "past_due":
        return '#F59E0B'; // yellow
      default:
        return '#6B7280'; // gray
    }
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return '$0.00';
    return `$${(amount / 100).toFixed(2)} ${(currency || 'USD').toUpperCase()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isSignedIn) {
    return (
      <ScrollView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>Settings</ThemedText>
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Sign In Required</ThemedText>
            <ThemedText style={styles.description}>
              Please sign in to access settings
            </ThemedText>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/sign-in')}
            >
              <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol size={24} color="#007AFF" name="chevron.left" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Settings</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* User Information */}
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account Information</ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <ThemedText style={styles.value}>
              {user?.firstName} {user?.lastName}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Member Since</ThemedText>
            <ThemedText style={styles.value}>
              {new Date(user?.createdAt || '').toLocaleDateString()}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Subscription Status */}
        <ThemedView style={styles.card}>
          <View style={styles.subscriptionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Subscription Status</ThemedText>
            {(subscription || subscriptionStatus?.hasActiveSubscription) && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription?.status || 'active') }]}>
                <ThemedText style={styles.statusText}>
                  {subscription?.status || 'active'}
                </ThemedText>
              </View>
            )}
          </View>
          
          {subscription === undefined ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <ThemedText style={styles.loadingText}>Loading subscription details...</ThemedText>
            </ThemedView>
          ) : !subscriptionStatus?.hasActiveSubscription ? (
            <View>
              <ThemedText style={styles.description}>
                You don't have an active subscription
              </ThemedText>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => router.push('/pricing')}
              >
                <ThemedText style={styles.buttonText}>View Plans</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.subscriptionDetails}>
              {subscription ? (
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailHeader}>
                      <IconSymbol size={16} color="#6B7280" name="creditcard" />
                      <ThemedText style={styles.detailLabel}>Amount</ThemedText>
                    </View>
                    <ThemedText style={styles.detailValue}>
                      {formatAmount(subscription.amount, subscription.currency)}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <View style={styles.detailHeader}>
                      <IconSymbol size={16} color="#6B7280" name="bell" />
                      <ThemedText style={styles.detailLabel}>Next Billing</ThemedText>
                    </View>
                    <ThemedText style={styles.detailValue}>
                      {formatDate(subscription.currentPeriodEnd)}
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <View style={styles.fallbackContainer}>
                  <ThemedText style={styles.description}>
                    You have an active subscription. For detailed billing information and management, use the button below.
                  </ThemedText>
                </View>
              )}

              {subscription?.cancelAtPeriodEnd && (
                <View style={styles.warningCard}>
                  <ThemedText style={styles.warningText}>
                    Your subscription will be canceled at the end of the current billing period.
                  </ThemedText>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.button, styles.outlineButton]}
                onPress={() => router.push('/pricing')}
                disabled={loadingPortal}
              >
                {loadingPortal ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <ThemedText style={[styles.buttonText, styles.outlineButtonText]}>
                    Manage Subscription
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>

        {/* Settings Options */}
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Preferences</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol size={24} color="#007AFF" name="bell" />
            <ThemedText style={styles.settingText}>Notifications</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol size={24} color="#007AFF" name="lock" />
            <ThemedText style={styles.settingText}>Privacy & Security</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/pricing')}
          >
            <IconSymbol size={24} color="#007AFF" name="creditcard" />
            <ThemedText style={styles.settingText}>Billing & Plans</ThemedText>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    opacity: 0.7,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    opacity: 0.7,
  },
  description: {
    opacity: 0.7,
    marginBottom: 16,
  },
  subscriptionDetails: {
    gap: 16,
  },
  fallbackContainer: {
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    gap: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButtonText: {
    color: '#007AFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});