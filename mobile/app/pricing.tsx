import { useAuth } from '@clerk/clerk-expo';
import { useAction, useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { api } from 'convex/_generated/api';

export default function PricingScreen() {
  const { isSignedIn, userId } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getPlans = useAction(api.subscriptions.getAvailablePlans);
  const subscriptionStatus = useQuery(
    api.subscriptions.checkUserSubscriptionStatus,
    {
      userId: isSignedIn ? userId : undefined,
    }
  );
  const userSubscription = useQuery(api.subscriptions.fetchUserSubscription);
  const createCheckout = useAction(api.subscriptions.createCheckoutSession);
  const createPortalUrl = useAction(api.subscriptions.createCustomerPortalUrl);
  const upsertUser = useMutation(api.users.upsertUser);

  // Sync user when signed in
  useEffect(() => {
    if (isSignedIn) {
      upsertUser().catch(console.error);
    }
  }, [isSignedIn, upsertUser]);

  // Load plans on component mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getPlans();
        setPlans(result);
      } catch (error) {
        console.error('Failed to load plans:', error);
        setError('Failed to load pricing plans. Please try again.');
      }
    };
    loadPlans();
  }, [getPlans]);

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setLoadingPriceId(priceId);
    setError(null);

    try {
      // Ensure user exists in database before action
      await upsertUser();

      // If user has active subscription, redirect to customer portal for plan changes
      if (
        userSubscription?.status === 'active' &&
        userSubscription?.customerId
      ) {
        const portalResult = await createPortalUrl({
          customerId: userSubscription.customerId,
        });
        await Linking.openURL(portalResult.url);
        setLoadingPriceId(null);
        return;
      }

      // Otherwise, create new checkout for first-time subscription
      const checkoutUrl = await createCheckout({ priceId });
      await Linking.openURL(checkoutUrl);
    } catch (error) {
      console.error('Failed to process subscription action:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to process request. Please try again.';
      setError(errorMessage);
      setLoadingPriceId(null);
      Alert.alert('Error', errorMessage);
    }
  };

  if (!plans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading plans...</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Simple, transparent pricing</Text>
        <Text style={styles.subtitle}>Choose the plan that fits your needs</Text>
        
        {isSignedIn && !subscriptionStatus?.hasActiveSubscription && (
          <View style={styles.signedInBanner}>
            <Text style={styles.bannerTitle}>📋 Complete your setup</Text>
            <Text style={styles.bannerText}>
              You're signed in! Choose a plan below to access your dashboard and start using all features.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.plansContainer}>
        {plans.items
          .sort((a: any, b: any) => {
            const priceComparison = a.prices[0].amount - b.prices[0].amount;
            return priceComparison !== 0
              ? priceComparison
              : a.name.localeCompare(b.name);
          })
          .map((plan: any, index: number) => {
            const isPopular =
              plans.items.length === 2
                ? index === 1
                : index === Math.floor(plans.items.length / 2);
            const price = plan.prices[0];
            const isCurrentPlan =
              userSubscription?.status === 'active' &&
              userSubscription?.amount === price.amount;

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  isPopular && styles.popularCard,
                  isCurrentPlan && styles.currentPlanCard,
                ]}
              >
                {isPopular && !isCurrentPlan && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Most Popular</Text>
                  </View>
                )}
                {isCurrentPlan && (
                  <View style={[styles.badge, styles.currentBadge]}>
                    <Text style={styles.badgeText}>Current Plan</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      ${(price.amount / 100).toFixed(0)}
                    </Text>
                    <Text style={styles.interval}>/{price.interval || 'month'}</Text>
                  </View>
                </View>

                <View style={styles.features}>
                  <View style={styles.feature}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>All features included</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>Priority support</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>Cancel anytime</Text>
                  </View>
                  {plan.isRecurring && (
                    <View style={styles.feature}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.featureText}>Recurring billing</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    isCurrentPlan && styles.currentPlanButton,
                    loadingPriceId === price.id && styles.loadingButton,
                  ]}
                  onPress={() => handleSubscribe(price.id)}
                  disabled={loadingPriceId === price.id}
                >
                  {loadingPriceId === price.id ? (
                    <View style={styles.loadingButtonContent}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.buttonText}>Setting up...</Text>
                    </View>
                  ) : (
                    <Text style={[styles.buttonText, isCurrentPlan && styles.currentPlanButtonText]}>
                      {isCurrentPlan
                        ? '✓ Current Plan'
                        : userSubscription?.status === 'active'
                        ? (() => {
                            const currentAmount = userSubscription.amount || 0;
                            const newAmount = price.amount;

                            if (newAmount > currentAmount) {
                              return `Upgrade (+$${((newAmount - currentAmount) / 100).toFixed(0)}/mo)`;
                            } else if (newAmount < currentAmount) {
                              return `Downgrade (-$${((currentAmount - newAmount) / 100).toFixed(0)}/mo)`;
                            } else {
                              return 'Manage Plan';
                            }
                          })()
                        : 'Get Started'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need a custom plan?{' '}
          <Text style={styles.contactLink}>Contact us</Text>
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {userSubscription &&
          !plans?.items.some(
            (plan: any) => plan.prices[0].id === userSubscription.polarPriceId
          ) && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                You have an active subscription that's not shown above. Contact support for assistance.
              </Text>
            </View>
          )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  signedInBanner: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
    maxWidth: 320,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    textAlign: 'center',
  },
  bannerText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    marginTop: 4,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  popularCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  currentPlanCard: {
    borderColor: '#4caf50',
    borderWidth: 2,
    backgroundColor: '#f1f8e9',
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadge: {
    backgroundColor: '#4caf50',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  interval: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    color: '#4caf50',
    fontSize: 16,
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#6c757d',
  },
  loadingButton: {
    opacity: 0.7,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlanButtonText: {
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  contactLink: {
    color: '#007AFF',
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 14,
  },
  warningContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff9800',
    maxWidth: 320,
  },
  warningText: {
    color: '#e65100',
    textAlign: 'center',
    fontSize: 14,
  },
});