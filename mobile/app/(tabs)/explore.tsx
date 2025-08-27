import { StyleSheet, TouchableOpacity, Text, View, Alert, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ProfileScreen() {
  const { isSignedIn, signOut: authSignOut } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  const handleSignOut = async () => {
    const performSignOut = async () => {
      try {
        console.log('Starting sign out process...');
        
        if (Platform.OS === 'web') {
          // Try multiple logout approaches for web
          console.log('Web platform detected, trying multiple approaches...');
          
          // Method 1: Try auth signOut first
          try {
            await authSignOut();
            console.log('Auth signOut completed');
          } catch (e) {
            console.log('Auth signOut failed, trying Clerk signOut:', e);
            
            // Method 2: Try clerk.signOut
            try {
              await clerk.signOut();
              console.log('Clerk signOut completed');
            } catch (e2) {
              console.log('Clerk signOut also failed:', e2);
            }
          }
          
          // Method 3: Clear browser storage
          if (typeof window !== 'undefined') {
            try {
              // Clear all Clerk-related storage
              const keys = Object.keys(localStorage);
              keys.forEach(key => {
                if (key.startsWith('__clerk') || key.includes('clerk') || key.includes('session')) {
                  localStorage.removeItem(key);
                }
              });
              
              // Also clear session storage
              const sessionKeys = Object.keys(sessionStorage);
              sessionKeys.forEach(key => {
                if (key.startsWith('__clerk') || key.includes('clerk') || key.includes('session')) {
                  sessionStorage.removeItem(key);
                }
              });
              
              console.log('Cleared Clerk-related storage');
            } catch (e) {
              console.log('Storage clear failed:', e);
            }
          }
          
          // Method 4: Force reload
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = window.location.origin;
            }
          }, 500);
          
        } else {
          // For mobile, use the auth signOut
          await authSignOut();
          console.log('Mobile signOut completed');
          router.replace('/(tabs)');
        }
        
      } catch (error) {
        console.error('All sign out methods failed:', error);
        
        // Last resort: force reload for web
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = window.location.origin;
        } else {
          router.replace('/(tabs)');
        }
      }
    };

    // Check if we're on web - Alert.alert doesn't work properly on Expo Web
    if (Platform.OS === 'web') {
      // For web, sign out immediately without confirmation for smoother UX
      performSignOut();
    } else {
      // For mobile, keep the native confirmation dialog
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performSignOut,
          },
        ]
      );
    }
  };

  if (!isSignedIn) {
    return (
      <ScrollView style={styles.container}>
        <ThemedView style={styles.content}>
          <IconSymbol 
            size={80} 
            color="#808080" 
            name="person.circle" 
            style={styles.emptyIcon} 
          />
          <ThemedText type="title" style={styles.title}>Profile</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to view your profile and manage your account
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

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        
        {/* User Profile Section */}
        <ThemedView style={styles.profileSection}>
          {user?.imageUrl ? (
            <Image 
              source={{ uri: user.imageUrl }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <IconSymbol size={40} color="#808080" name="person.fill" />
            </View>
          )}
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </ThemedText>
            <ThemedText style={styles.userEmail}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </ThemedText>
            <ThemedText style={styles.userDetails}>
              Member since {new Date(user?.createdAt || '').toLocaleDateString()}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Account Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
          >
            <IconSymbol size={24} color="#007AFF" name="person.circle" />
            <ThemedText style={styles.menuItemText}>Account Settings</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/pricing')}
          >
            <IconSymbol size={24} color="#007AFF" name="creditcard" />
            <ThemedText style={styles.menuItemText}>Subscription & Billing</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
          >
            <IconSymbol size={24} color="#007AFF" name="bell" />
            <ThemedText style={styles.menuItemText}>Notifications</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
          >
            <IconSymbol size={24} color="#007AFF" name="lock" />
            <ThemedText style={styles.menuItemText}>Privacy & Security</ThemedText>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
        </ThemedView>

        {/* Sign Out */}
        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleSignOut}
        >
          <ThemedText style={[styles.buttonText, styles.logoutButtonText]}>Sign Out</ThemedText>
        </TouchableOpacity>
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
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
    opacity: 0.7,
  },
  userDetails: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
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
  logoutButton: {
    backgroundColor: '#ff3b30',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
  },
});