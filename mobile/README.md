# Mobile App - React Native with Expo

This is a React Native mobile application built with Expo that integrates with the same backend services as the web app:

- **Convex**: Real-time backend database and API
- **Clerk**: Authentication and user management  
- **Polar**: Subscription payments and billing

## Setup

1. **Environment Configuration**: 
   Add your environment variables to `app.json`:
   ```json
   "extra": {
     "convexUrl": "your-convex-deployment-url",
     "clerkPublishableKey": "your-clerk-publishable-key"
   }
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Features

### Authentication (Clerk)
- Sign in/Sign up screens with email verification
- Automatic session management
- Protected routes and user state

### Backend (Convex)
- Real-time data synchronization with web app
- Shared database and API functions
- TypeScript-safe API calls

### Payments (Polar)
- Native pricing screen
- Subscription management
- Customer portal integration
- Mobile-optimized checkout flow

## File Structure

```
app/
├── (auth)/          # Authentication screens
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── _layout.tsx
├── (tabs)/          # Main app tabs
│   ├── index.tsx    # Home screen with auth integration
│   └── ...
├── pricing.tsx     # Pricing and subscription screen
└── _layout.tsx     # Root layout with providers
```

## Integration Details

The mobile app shares the same backend services as the web application:

- **Convex functions**: Located in `/convex` directory (shared)
- **Database schema**: Shared between web and mobile
- **Authentication**: Same Clerk application
- **Subscriptions**: Same Polar integration

This ensures data consistency and feature parity between platforms.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
