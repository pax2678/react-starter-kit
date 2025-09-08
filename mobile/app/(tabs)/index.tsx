import React, { useRef, useEffect } from 'react';
import HomepageScreen, { type HomepageScreenRef } from '../homepage';
import { useScrollToTop } from '../../contexts/ScrollToTopContext';

export default function HomeScreen() {
  const homepageRef = useRef<HomepageScreenRef>(null);
  const { homeScrollRef } = useScrollToTop();

  // Register the scroll function with the context
  useEffect(() => {
    homeScrollRef.current = () => {
      homepageRef.current?.scrollToTop();
    };
  }, [homeScrollRef]);


  return <HomepageScreen ref={homepageRef} />;
}
