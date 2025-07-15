import { StyleSheet, TouchableOpacity, Text, View, Alert, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ProfileScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = () => {
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
          onPress: () => signOut(),
        },
      ]
    );
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
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign Up</Text>
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
        <View style={styles.profileSection}>
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
        </View>

        {/* Account Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Account</ThemedText>
          
          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol size={24} color="#007AFF" name="person.circle" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/pricing')}
          >
            <IconSymbol size={24} color="#007AFF" name="creditcard" />
            <Text style={styles.menuItemText}>Subscription & Billing</Text>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
        </ThemedView>

        {/* Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Settings</ThemedText>
          
          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol size={24} color="#007AFF" name="bell" />
            <Text style={styles.menuItemText}>Notifications</Text>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <IconSymbol size={24} color="#007AFF" name="lock" />
            <Text style={styles.menuItemText}>Privacy & Security</Text>
            <IconSymbol size={16} color="#C7C7CC" name="chevron.right" />
          </TouchableOpacity>
        </ThemedView>

        {/* Sign Out */}
        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleSignOut}
        >
          <Text style={[styles.buttonText, styles.logoutButtonText]}>Sign Out</Text>
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
    backgroundColor: '#fff',
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
    opacity: 0.7,
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    opacity: 0.5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    color: '#000',
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