# AxumPulse 360 - Landing Page Overhaul Plan

## 🎯 Project Overview
Transform the current landing page into a cinematic, high-performance 3D WebGL experience while preserving all existing links and business logic.

## 📋 Current State Analysis

### **Existing Landing Page Structure**
- **Hero Section**: Transform Your Life with AxumPulse 360
- **Features Section**: 6 key features with icons
- **How It Works**: 4-step process
- **Pricing**: 3 plans (Basic 2 ETB, Premium 5 ETB, Elite 10 ETB)
- **For Trainers**: Application process and benefits
- **Testimonials**: 3 user testimonials
- **Stats**: Key metrics display
- **About**: Mission and values
- **CTA**: Final call-to-action
- **Footer**: Links and contact info

### **Key Links to Preserve**
- `/user/apply` - Trainer application
- `/login` - User login
- SMS signup functionality
- All internal navigation links
- Social media links

### **Files to Update**
- `src/app/page.tsx` - Main landing page
- `src/components/shared/header.tsx` - Navigation header
- `src/app/login/page.tsx` - Login page (Phase 2)

## 🎨 Design Vision

### **Visual Style**
- **Base**: Dark theme with subtle gradients
- **Brand Colors**: AxumPulse blue (#0ea5e9) and purple (#d946ef)
- **Typography**: Modern, clean, premium feel
- **3D Aesthetic**: Minimal, futuristic, cinematic
- **Animations**: Smooth, purposeful, accessible

### **Performance Targets**
- Lighthouse Score: 90+
- WebGL Fallback: Static parallax with Framer Motion
- Mobile Optimization: Touch-friendly interactions
- Accessibility: WCAG compliance, reduced motion support

## 🏗️ Technical Architecture

### **Tech Stack**
- **Framework**: Next.js 14 with App Router
- **3D Engine**: Three.js + react-three-fiber + drei
- **Animation**: GSAP + ScrollTrigger + Framer Motion
- **Styling**: Tailwind CSS
- **Smooth Scrolling**: Lenis
- **Performance**: Code splitting, lazy loading

### **Folder Structure**
```
src/
├── components/
│   ├── landing/
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── ForTrainersSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   └── CTASection.tsx
│   │   ├── webgl/
│   │   │   ├── Scene1Hero.tsx
│   │   │   ├── Scene2Languages.tsx
│   │   │   ├── Scene3HowItWorks.tsx
│   │   │   ├── Scene4Pricing.tsx
│   │   │   ├── Scene5Services.tsx
│   │   │   ├── Scene6Trainers.tsx
│   │   │   ├── Scene7About.tsx
│   │   │   └── Scene8CTA.tsx
│   │   ├── ui/
│   │   │   ├── MagneticButton.tsx
│   │   │   ├── RippleEffect.tsx
│   │   │   └── LoadingScreen.tsx
│   │   └── fallback/
│   │       └── FallbackHero.tsx
│   └── shared/
│       └── header.tsx (UPDATE REQUIRED)
├── hooks/
│   ├── useWebGLSupport.ts
│   ├── useReducedMotion.ts
│   ├── usePerformanceMode.ts
│   ├── useLenis.ts
│   └── useMagneticCursor.ts
├── lib/
│   ├── scene-config.json
│   ├── performance-utils.ts
│   └── webgl-utils.ts
└── styles/
    └── landing.module.css
```

## 🎬 Scene Breakdown

### **Scene 1: Hero - AI Coach**
- **3D Elements**: Luminous orb with particle trails
- **Image Ring**: Revolving carousel with dissolve shader
- **Interactions**: Mouse parallax, camera yaw
- **Content**: "Transform Your Life" headline, CTA buttons
- **Animation**: Progressive loader with AxumPulse branding

### **Scene 2: Languages**
- **3D Elements**: Four floating panels (Amharic, Oromifa, Tigrigna, English)
- **Animation**: Glide into formation on scroll
- **Content**: Multilingual support messaging

### **Scene 3: How It Works**
- **3D Elements**: Three beat steps with icons
- **Animation**: Pin section, animate icons on scroll
- **Content**: Text to subscribe, set goals, start training
- **Interaction**: Step-by-step reveal

### **Scene 4: Pricing**
- **3D Elements**: Big 2 ETB/day tile
- **Animation**: Flip into view, gentle glow on "first 3 days free"
- **Content**: Pricing plans with emphasis on 2 ETB daily
- **Interaction**: Pulse animation, then settle

### **Scene 5: Services**
- **3D Elements**: Orbiting tiles for services
- **Services**: In-Person Training, Digital Coaching, Medical Integration, Nutrition, Community, Analytics
- **Animation**: Slide on z-axis during scroll
- **Interaction**: Click tile to zoom camera to detail micro-scene

### **Scene 6: For Trainers**
- **3D Elements**: Stat board in 3D
- **Animation**: Appears with verification label glint
- **Content**: Trainer benefits and application process
- **Interaction**: Hover effects on stats

### **Scene 7: About Compound BST**
- **3D Elements**: Location card rising from ground plane
- **Animation**: Subtle city light map
- **Content**: Partnership information and location details

### **Scene 8: CTA**
- **3D Elements**: Calm particle field
- **Animation**: Two glowing buttons
- **Content**: Final call-to-action
- **Interaction**: Magnetic cursor effects

## 🚀 Implementation Phases

### **Phase 1: Project Setup & Dependencies** ⏱️ 30 mins
- [ ] Install required packages
- [ ] Create folder structure
- [ ] Set up environment variables
- [ ] Configure Next.js for 3D assets

### **Phase 2: Core Infrastructure** ⏱️ 45 mins
- [ ] Create performance and accessibility hooks
- [ ] Set up scene configuration system
- [ ] Implement feature flags
- [ ] Create utility functions

### **Phase 3: WebGL Scene Components** ⏱️ 90 mins
- [ ] Build Hero scene with image ring
- [ ] Implement dissolve shader
- [ ] Create particle system
- [ ] Add camera controls and mouse parallax
- [ ] Build progressive loader

### **Phase 4: Scroll-Triggered Scenes** ⏱️ 90 mins
- [ ] Implement ScrollTrigger setup
- [ ] Create Languages floating panels
- [ ] Build How It Works step animations
- [ ] Design Pricing card with glow effects
- [ ] Create Services orbiting tiles
- [ ] Build Trainers stat board
- [ ] Design Compound BST location card
- [ ] Create CTA particle field

### **Phase 5: UI Components & Interactions** ⏱️ 45 mins
- [ ] Implement magnetic cursor
- [ ] Add hover ripple effects
- [ ] Create 3D card flips
- [ ] Build staggered text animations
- [ ] Add touch-friendly interactions

### **Phase 6: Fallback & Optimization** ⏱️ 30 mins
- [ ] Create no-WebGL fallback
- [ ] Implement static parallax
- [ ] Add performance monitoring
- [ ] Optimize for mobile devices
- [ ] Test Lighthouse scores

### **Phase 7: Content Management & Documentation** ⏱️ 30 mins
- [ ] Create scene configuration JSON
- [ ] Add multilingual content structure
- [ ] Write README with scene controls
- [ ] Document performance flags
- [ ] Create content editing guide

## 🔧 Technical Requirements

### **Dependencies to Install**
```json
{
  "@react-three/fiber": "^8.15.11",
  "@react-three/drei": "^9.88.13",
  "@react-three/postprocessing": "^2.15.11",
  "three": "^0.158.0",
  "gsap": "^3.12.2",
  "@gsap/react": "^2.1.1",
  "framer-motion": "^10.16.16",
  "lenis": "^1.0.42",
  "@types/three": "^0.158.3"
}
```

### **Environment Variables**
```env
NEXT_PUBLIC_WEBGL_ENABLED=true
NEXT_PUBLIC_PERFORMANCE_MODE=false
NEXT_PUBLIC_DEBUG_SCENES=false
```

### **Performance Targets**
- **Lighthouse Performance**: 90+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🎯 Success Criteria

### **Functional Requirements**
- [ ] All existing links preserved and functional
- [ ] SMS signup functionality maintained
- [ ] Responsive design across all devices
- [ ] WebGL fallback for unsupported devices
- [ ] Accessibility compliance (WCAG 2.1)

### **Performance Requirements**
- [ ] Lighthouse score 90+
- [ ] Smooth 60fps animations
- [ ] Fast loading times
- [ ] Optimized 3D assets
- [ ] Efficient memory usage

### **User Experience Requirements**
- [ ] Intuitive navigation
- [ ] Smooth scrolling experience
- [ ] Engaging 3D interactions
- [ ] Clear call-to-actions
- [ ] Mobile-friendly touch interactions

## 📝 Content Strategy

### **Multilingual Support**
- Amharic, Oromifa, Tigrigna, English
- JSON-based content management
- Easy content updates without code changes
- Cultural sensitivity in design

### **Brand Consistency**
- AxumPulse color scheme
- Consistent typography
- Brand voice and tone
- Professional, premium feel

## 🔄 Testing Strategy

### **Cross-Browser Testing**
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Android Chrome)
- WebGL support detection
- Fallback functionality

### **Performance Testing**
- Lighthouse audits
- Mobile performance
- Low-power device testing
- Network throttling tests

### **Accessibility Testing**
- Screen reader compatibility
- Keyboard navigation
- Reduced motion preferences
- Color contrast validation

## 📚 Documentation Deliverables

### **Technical Documentation**
- README with setup instructions
- Scene configuration guide
- Performance optimization tips
- Troubleshooting guide

### **Content Management**
- JSON configuration examples
- Image carousel management
- Multilingual content structure
- Update procedures

## 🚨 Risk Mitigation

### **Performance Risks**
- **Risk**: Heavy 3D scenes impact performance
- **Mitigation**: Feature flags, progressive enhancement, fallbacks

### **Compatibility Risks**
- **Risk**: WebGL not supported on older devices
- **Mitigation**: Graceful fallback, feature detection

### **Maintenance Risks**
- **Risk**: Complex 3D code difficult to maintain
- **Mitigation**: Clear documentation, modular structure

## 📅 Timeline

**Total Estimated Time**: 5-6 hours
**Start Date**: [To be determined]
**Target Completion**: [To be determined]

## 🎉 Expected Outcomes

1. **Cinematic Landing Experience**: Engaging 3D scroll journey
2. **Preserved Functionality**: All existing links and logic intact
3. **Performance Excellence**: 90+ Lighthouse score
4. **Accessibility Compliance**: WCAG 2.1 standards
5. **Maintainable Code**: Clear structure and documentation
6. **Content Management**: Easy updates without code changes

---

**Next Steps**: Begin with Phase 1 - Project Setup & Dependencies
