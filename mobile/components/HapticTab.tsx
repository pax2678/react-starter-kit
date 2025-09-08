import { type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useScrollToTop } from '../contexts/ScrollToTopContext';
import { useNavigation } from '@react-navigation/native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { homeScrollRef } = useScrollToTop();
  const navigation = useNavigation();

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPress={(ev) => {
        // Check if we're currently on the Home route when any tab is pressed
        const currentState = navigation.getState();
        const currentRoute = currentState?.routes?.[currentState.index];
        const isOnHomeRoute = currentRoute?.name === 'index' || currentRoute?.name?.includes('index');
        
        // Scroll to top if on Home route and scroll function is available
        if (isOnHomeRoute && homeScrollRef.current) {
          setTimeout(() => {
            homeScrollRef.current?.();
          }, 150);
        }
        
        props.onPress?.(ev);
      }}
    />
  );
}
