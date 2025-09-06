import React, { useRef, useEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import HomepageScreen, { HomepageScreenRef } from '../homepage';

export default function HomeScreen() {
  const homepageRef = useRef<HomepageScreenRef>(null);
  const navigation = useNavigation();

  // Listen for tab press events (when already on the tab)
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Only scroll to top if we're already on this screen
      if (navigation.isFocused()) {
        homepageRef.current?.scrollToTop();
      }
    });

    return unsubscribe;
  }, [navigation]);

  return <HomepageScreen ref={homepageRef} />;
}
