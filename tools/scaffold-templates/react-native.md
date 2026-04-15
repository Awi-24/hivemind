# Scaffold Template: React Native (Expo)

> Triggered by `/scaffold react-native --name <name>`

## Directory Structure

```
<name>/
├── app/                 ← Expo Router file-based routing
│   ├── (tabs)/
│   ├── _layout.tsx
│   └── index.tsx
├── components/
├── hooks/
├── lib/
│   ├── api.ts
│   └── storage.ts       ← expo-secure-store wrapper
├── types/
├── assets/
├── app.json
├── eas.json
└── package.json
```

## Conventions
- Use Expo Router for navigation
- SecureStore for sensitive data (tokens, keys) — never AsyncStorage for secrets
- expo-image for optimized image loading
- Zod for API response validation
- EAS Build for CI/CD
