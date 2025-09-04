import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Constants from 'expo-constants';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Get Convex site URL for API calls
const getConvexSiteUrl = () => {
  const convexUrl = Constants.expoConfig?.extra?.convexUrl || 'https://energized-hamster-320.convex.cloud';
  const siteUrl = convexUrl.replace(/.cloud$/, '.site');
  console.log('🔍 Chat Debug - convexUrl:', convexUrl);
  console.log('🔍 Chat Debug - siteUrl:', siteUrl);
  return siteUrl;
};

export default function ChatScreen() {
  const { isSignedIn, getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Check authentication
  useEffect(() => {
    if (!isSignedIn) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to use the chat feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') }
        ]
      );
      return;
    }
  }, [isSignedIn]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !isSignedIn) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await getToken();
      const convexSiteUrl = getConvexSiteUrl();
      const fullUrl = `${convexSiteUrl}/api/chat`;
      
      console.log('🔍 Chat Debug - Making request to:', fullUrl);
      console.log('🔍 Chat Debug - token available:', !!token);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            console.log('🔍 Raw chunk:', chunk);
            
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              console.log('🔍 Processing line:', line);
              
              if (line.startsWith('0:')) {
                try {
                  const jsonStr = line.slice(2);
                  console.log('🔍 JSON string:', jsonStr);
                  
                  // The streaming data contains the text directly as a string
                  const textContent = JSON.parse(jsonStr);
                  if (typeof textContent === 'string') {
                    assistantContent += textContent;
                    console.log('🔍 Updated content length:', assistantContent.length);
                    console.log('🔍 Updated content:', assistantContent.substring(0, 100) + '...');
                    
                    // Force update the assistant message content
                    setMessages(prev => {
                      const updated = prev.map(msg => 
                        msg.id === assistantMessageId 
                          ? { ...msg, content: assistantContent }
                          : msg
                      );
                      console.log('🔍 Messages updated, assistant message:', updated.find(m => m.id === assistantMessageId)?.content?.substring(0, 50));
                      return updated;
                    });
                  }
                } catch (e) {
                  console.warn('Failed to parse streaming data:', line, e);
                }
              }
            }
          }
          
          console.log('🔍 Final content:', assistantContent);
        } catch (streamError) {
          console.error('Streaming error:', streamError);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert(
        'Chat Error',
        'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
      
      // Remove the user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol size={80} color="#ccc" name="person.fill.xmark" />
          <ThemedText type="title" style={styles.emptyTitle}>
            Authentication Required
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Please sign in to access the chat feature
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <IconSymbol size={24} color="#007AFF" name="chevron.left" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>AI Chat</ThemedText>
          <View style={styles.placeholder} />
        </ThemedView>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <ThemedView style={styles.emptyChat}>
              <IconSymbol size={60} color="#ccc" name="bubble.left.and.bubble.right" />
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                Start a conversation
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Ask me anything! I'm here to help.
              </ThemedText>
            </ThemedView>
          ) : (
            messages.map((message) => {
              console.log('🔍 Rendering message:', message.id, message.role, message.content?.substring(0, 50));
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Loading indicator */}
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
              <View style={[styles.messageBubble, styles.assistantMessage, styles.loadingMessage]}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={[styles.messageText, styles.assistantMessageText, styles.loadingText]}>
                  Thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <ThemedView style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconSymbol size={20} color="#fff" name="paperplane.fill" />
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Message bubbles
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#e9ecef',
    borderBottomLeftRadius: 4,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Input
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});