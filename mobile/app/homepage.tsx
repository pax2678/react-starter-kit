import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAction, useQuery, useMutation } from 'convex/react';
import { router } from 'expo-router';
import { api } from 'convex/_generated/api';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

// Team members data
const members = [
  {
    name: "Michael Shimeles",
    role: "Co-Founder & CEO",
    avatar: "https://pbs.twimg.com/profile_images/1927552295291564033/U8DD7JlB_400x400.jpg",
  },
  {
    name: "Ras Mic",
    role: "Co-Founder & CTO", 
    avatar: "https://pbs.twimg.com/media/GsOcrswWMAALjCG?format=jpg&name=medium",
  },
  {
    name: "Micky",
    role: "Co-Founder & CMO",
    avatar: "https://pbs.twimg.com/media/GrQYfZ7WAAAMy7i?format=jpg&name=medium",
  },
  {
    name: "Mike",
    role: "Co-Founder & COO",
    avatar: "https://pbs.twimg.com/media/GoRePdpXEAAb06Q?format=jpg&name=4096x4096",
  },
];

export default function HomepageScreen() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [plans, setPlans] = useState<any>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getPlans = useAction(api.subscriptions.getAvailablePlans);
  const subscriptionStatus = useQuery(
    api.subscriptions.checkUserSubscriptionStatus,
    isSignedIn ? { userId: user?.id } : "skip"
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

  // Debug logging for subscription data
  useEffect(() => {
    console.log('🔍 Homepage Debug - subscriptionStatus:', subscriptionStatus);
    console.log('🔍 Homepage Debug - userSubscription:', userSubscription);
    console.log('🔍 Homepage Debug - isSignedIn:', isSignedIn);
    console.log('🔍 Homepage Debug - user?.id:', user?.id);
    console.log('🔍 Homepage Debug - user object:', user);
  }, [subscriptionStatus, userSubscription, isSignedIn, user?.id, user]);

  // Load plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getPlans();
        console.log('🔍 Homepage Debug - loaded plans:', result);
        setPlans(result);
      } catch (error) {
        console.error('Failed to load plans:', error);
      }
    };
    loadPlans();
  }, [getPlans]);

  const handleGetStarted = () => {
    if (!isSignedIn) {
      router.push('/sign-up');
    } else if (subscriptionStatus?.hasActiveSubscription) {
      // Navigate to dashboard when implemented
      router.push('/(tabs)');
    } else {
      router.push('/pricing');
    }
  };

  const handleGitHubPress = async () => {
    await Linking.openURL('https://github.com/michaelshimeles/react-starter-kit');
  };

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
        subscriptionStatus?.hasActiveSubscription &&
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

  const getStartedText = () => {
    if (!isSignedIn) return 'Get Started (Demo)';
    if (subscriptionStatus?.hasActiveSubscription) return 'Go to Dashboard (Demo)';
    return 'Subscribe Now (Demo)';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header/Navbar */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleGitHubPress} style={styles.githubButton}>
              <IconSymbol size={20} color="#007AFF" name="chevron.left.forwardslash.chevron.right" />
            </TouchableOpacity>
            {!isSignedIn && (
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={() => router.push('/sign-in')}
              >
                <ThemedText style={styles.signInButtonText}>Login</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ThemedView>

      {/* Hero/Integrations Section */}
      <ThemedView style={styles.heroSection}>
        <View style={styles.integrationGrid}>
          <View style={styles.integrationRow}>
            <ThemedView style={styles.integrationCard}>
              <ThemedText style={styles.integrationText}>React Router</ThemedText>
            </ThemedView>
            <ThemedView style={styles.integrationCard}>
              <ThemedText style={styles.integrationText}>Convex</ThemedText>
            </ThemedView>
          </View>
          <View style={styles.integrationRow}>
            <ThemedView style={styles.integrationCard}>
              <ThemedText style={styles.integrationText}>React</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.integrationCard, styles.mainCard]}>
              <Image source={require('@/assets/images/icon.png')} style={styles.cardLogo} />
            </ThemedView>
            <ThemedView style={styles.integrationCard}>
              <ThemedText style={styles.integrationText}>Tailwind</ThemedText>
            </ThemedView>
          </View>
          <View style={styles.integrationRow}>
            <ThemedView style={styles.integrationCard}>
              <ThemedText style={styles.integrationText}>TypeScript</ThemedText>
            </ThemedView>
            <ThemedView style={styles.integrationCard}>
              <ThemedText style={styles.integrationText}>Polar</ThemedText>
            </ThemedView>
          </View>
        </View>

        <View style={styles.heroContent}>
          <ThemedText type="title" style={styles.heroTitle}>
            React Starter Kit
          </ThemedText>
          <ThemedText style={styles.heroDescription}>
            This powerful starter kit is designed to help you launch your SAAS application quickly and efficiently.
          </ThemedText>
          
          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <ThemedText style={styles.primaryButtonText}>{getStartedText()}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGitHubPress}>
              <ThemedText style={styles.secondaryButtonText}>⭐️ Star on GitHub</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>

      {/* Content/Features Section */}
      <ThemedView style={styles.featuresSection}>
        <ThemedText type="title" style={styles.featuresTitle}>
          The Starter Kit you need to start your SaaS application.
        </ThemedText>
        <View style={styles.featuresContent}>
          <ThemedText style={styles.featuresDescription}>
            Stop rebuilding the same foundation over and over. RSK eliminates months of integration work by providing a complete, production-ready SaaS template with authentication, payments, and real-time data working seamlessly out of the box.
          </ThemedText>
          <ThemedText style={styles.featuresDescription}>
            <ThemedText style={styles.boldText}>From idea to launch in weeks,</ThemedText> not months. With TypeScript safety, modern UI components, and scalable architecture built-in, you can validate your business concept and start generating revenue while your competitors are still setting up their development environment.
          </ThemedText>
          <TouchableOpacity style={styles.learnMoreButton}>
            <ThemedText style={styles.learnMoreText}>Learn More</ThemedText>
            <IconSymbol size={16} color="#007AFF" name="chevron.right" />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Team Section */}
      <ThemedView style={styles.teamSection}>
        <ThemedText type="title" style={styles.teamTitle}>Our team</ThemedText>
        <ThemedText style={styles.teamSubtitle}>Leadership</ThemedText>
        <View style={styles.teamGrid}>
          {members.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
              <ThemedText style={styles.memberName}>{member.name}</ThemedText>
              <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Pricing Section */}
      <ThemedView style={styles.pricingSection}>
        <ThemedText type="title" style={styles.pricingTitle}>
          Pricing that Scales with You
        </ThemedText>
        <ThemedText style={styles.pricingSubtitle}>
          Choose the plan that fits your needs. All plans include full access to our platform.
        </ThemedText>

        {!plans ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Loading plans...</ThemedText>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {plans.items
              .sort((a: any, b: any) => a.prices[0].amount - b.prices[0].amount)
              .map((plan: any, index: number) => {
                const isPopular = plans.items.length === 2 
                  ? index === 1 
                  : index === Math.floor(plans.items.length / 2);
                const price = plan.prices[0];
                const isCurrentPlan = 
                  userSubscription?.status === "active" &&
                  userSubscription?.amount === price.amount;
                  
                // Debug logging for plan matching (matching web app logic)
                console.log(`🔍 Plan ${plan.name} (${price.amount}) - isCurrentPlan: ${isCurrentPlan}`);
                console.log(`  - userSubscription?.status: ${userSubscription?.status}`);
                console.log(`  - userSubscription?.amount: ${userSubscription?.amount}`);
                console.log(`  - price.amount: ${price.amount}`);
                console.log(`  - status === "active": ${userSubscription?.status === "active"}`);
                console.log(`  - amount match: ${userSubscription?.amount === price.amount}`);
                
                return (
                  <ThemedView key={plan.id} style={[
                    styles.planCard, 
                    isPopular && !isCurrentPlan && styles.popularCard,
                    isCurrentPlan && styles.currentPlanCard
                  ]}>
                    {isPopular && !isCurrentPlan && (
                      <View style={styles.popularBadge}>
                        <ThemedText style={styles.badgeText}>Popular</ThemedText>
                      </View>
                    )}
                    {isCurrentPlan && (
                      <View style={styles.currentPlanBadge}>
                        <ThemedText style={styles.badgeText}>Current Plan</ThemedText>
                      </View>
                    )}
                    <View style={styles.planHeader}>
                      <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                      <View style={styles.priceContainer}>
                        <ThemedText style={styles.price}>
                          ${(price.amount / 100).toFixed(0)}
                        </ThemedText>
                        <ThemedText style={styles.interval}>/{price.interval || 'mo'}</ThemedText>
                      </View>
                      <ThemedText style={styles.planDescription}>{plan.description}</ThemedText>
                    </View>
                    
                    <View style={styles.features}>
                      <View style={styles.feature}>
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                        <ThemedText style={styles.featureText}>All features included</ThemedText>
                      </View>
                      <View style={styles.feature}>
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                        <ThemedText style={styles.featureText}>Priority support</ThemedText>
                      </View>
                      <View style={styles.feature}>
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                        <ThemedText style={styles.featureText}>Cancel anytime</ThemedText>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={[
                        styles.planButton, 
                        isCurrentPlan && styles.currentPlanButton,
                        isPopular && !isCurrentPlan && styles.popularButton,
                        loadingPriceId === price.id && styles.loadingButton
                      ]}
                      onPress={() => handleSubscribe(price.id)}
                      disabled={loadingPriceId === price.id}
                    >
                      {loadingPriceId === price.id ? (
                        <View style={styles.loadingButtonContent}>
                          <ActivityIndicator size="small" color="#fff" />
                          <ThemedText style={styles.planButtonText}>Setting up...</ThemedText>
                        </View>
                      ) : (
                        <ThemedText style={[
                          styles.planButtonText, 
                          isCurrentPlan && styles.currentPlanButtonText,
                          isPopular && !isCurrentPlan && styles.popularButtonText
                        ]}>
                          {isCurrentPlan
                            ? "✓ Current Plan"
                            : userSubscription?.status === "active"
                            ? (() => {
                                const currentAmount = userSubscription.amount || 0;
                                const newAmount = price.amount;
                                if (newAmount > currentAmount) {
                                  return `Upgrade (+$${((newAmount - currentAmount) / 100).toFixed(0)}/mo)`;
                                } else if (newAmount < currentAmount) {
                                  return `Downgrade (-$${((currentAmount - newAmount) / 100).toFixed(0)}/mo)`;
                                } else {
                                  return "Manage Plan";
                                }
                              })()
                            : "Get Started"
                          }
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </ThemedView>
                );
              })}
          </View>
        )}
      </ThemedView>

      {/* Footer Section */}
      <ThemedView style={styles.footer}>
        <Image source={require('@/assets/images/icon.png')} style={styles.footerLogo} />
        <TouchableOpacity 
          style={styles.socialLink}
          onPress={() => Linking.openURL('https://x.com/rasmickyy')}
        >
          <IconSymbol size={24} color="#666" name="person.circle" />
        </TouchableOpacity>
        <ThemedText style={styles.copyright}>
          © {new Date().getFullYear()} RSK, All rights reserved
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  githubButton: {
    padding: 8,
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 6,
  },
  signInButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  integrationGrid: {
    alignItems: 'center',
    marginBottom: 40,
  },
  integrationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  integrationCard: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mainCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  integrationText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardLogo: {
    width: 24,
    height: 24,
  },
  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.7,
  },
  heroButtons: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 32,
    lineHeight: 36,
  },
  featuresContent: {
    gap: 24,
  },
  featuresDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  boldText: {
    fontWeight: '700',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Team Section
  teamSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  teamTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
  },
  teamSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    opacity: 0.7,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  teamMember: {
    width: (screenWidth - 80) / 2,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },

  // Pricing Section
  pricingSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  pricingTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  pricingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    borderRadius: 12,
    padding: 24,
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
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  interval: {
    fontSize: 16,
    marginLeft: 4,
    opacity: 0.7,
  },
  planDescription: {
    fontSize: 14,
    opacity: 0.7,
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
    fontWeight: '700',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  planButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#007AFF',
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
  planButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  popularButtonText: {
    color: '#fff',
  },
  currentPlanButtonText: {
    color: '#fff',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginBottom: 20,
  },
  socialLink: {
    marginBottom: 20,
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});