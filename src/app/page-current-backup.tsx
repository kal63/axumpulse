// 'use client';

// import { useEffect, useState } from 'react';
// import { HeroSection } from '@/components/landing/sections/HeroSection';
// import { FeaturesSection } from '@/components/landing/sections/FeaturesSection';
// import { Navigation } from '@/components/landing/Navigation';
// import { LoadingScreen } from '@/components/landing/LoadingScreen';
// import { Providers } from '@/components/landing/Providers';
// import { useWebGLSupport } from '@/hooks/useWebGLSupport';
// import { useReducedMotion } from '@/hooks/useReducedMotion';
// import styles from '@/styles/landing.module.css';

// export default function HomePage() {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const webglSupported = useWebGLSupport();
//   const prefersReducedMotion = useReducedMotion();

//   useEffect(() => {
//     // Simulate loading time
//     const timer = setTimeout(() => {
//       setIsLoaded(true);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, []);

//   if (!isLoaded) {
//     return (
//       <Providers>
//         <LoadingScreen />
//       </Providers>
//     );
//   }

//   return (
//     <Providers>
//       <main className={styles.landingPage}>
//         <Navigation />
        
//         {/* WebGL Canvas - only render if supported and not reduced motion */}
//         {webglSupported && !prefersReducedMotion && (
//           <div className={styles.landingWebglCanvas} />
//         )}

//         <HeroSection />
//         <FeaturesSection />
        
//         {/* Placeholder sections - we'll add more sections later */}
//         <section className="min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-white mb-4">More Sections Coming Soon</h2>
//             <p className="text-gray-300">We're building amazing features for you!</p>
//           </div>
//         </section>
//       </main>
//     </Providers>
//   );
// }

