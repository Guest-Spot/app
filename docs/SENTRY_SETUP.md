# Sentry Setup

Guide for setting up error monitoring with Sentry.

---

## Step 1: Setup Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Required
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Optional
SENTRY_ENVIRONMENT=development
SENTRY_DEBUG=false
```

> Without `SENTRY_DSN`, Sentry won't be initialized.

---

## Step 2: Verify Integration

Run the app and test in console:

```javascript
// Trigger test error
window.$q?.app?.config?.globalProperties?.$sentry?.captureException(
  new Error('Sentry test')
);
```

Check [Sentry Dashboard](https://sentry.io) → Issues after 1-2 minutes.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SENTRY_DSN` | ✅ | Sentry project DSN |
| `SENTRY_ENVIRONMENT` | ❌ | Environment name (development, staging, production) |
| `SENTRY_RELEASE` | ❌ | Release version (auto-generated from package.json) |
| `SENTRY_DEBUG` | ❌ | Enable debug logs (default: false) |
| `SENTRY_TRACES_SAMPLE_RATE` | ❌ | Performance tracing rate (0-1) |

### For Source Maps Upload (CI/CD)

| Variable | Description |
|----------|-------------|
| `SENTRY_AUTH_TOKEN` | Auth token with `project:releases` permission |
| `SENTRY_ORG` | Organization slug |
| `SENTRY_PROJECT` | Project slug |

---

## How It Works

### Web (Quasar/Vue)

- Initialized in `src/boot/sentry.ts`
- Auto-captures errors and router navigation
- Access via `this.$sentry` in components

### Native (Capacitor)

- Configured in `src-capacitor/capacitor.config.ts`
- Syncs with native Sentry SDKs

---

## Build & Deploy

### Development

```bash
npm run dev
```

### Production with Source Maps

```bash
# Set secrets
export SENTRY_AUTH_TOKEN=...
export SENTRY_ORG=guestspot
export SENTRY_PROJECT=guestspot-app

# Build (auto-uploads source maps)
npm run build
```

### Capacitor Sync

```bash
npm run capacitor:sync:ios
npm run capacitor:sync:android
```

---

## Troubleshooting

### Events not appearing

1. Check `SENTRY_DSN` is set correctly
2. Verify network access
3. Enable `SENTRY_DEBUG=true` to see logs

### Source maps not working

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check token has `project:releases` permission
3. Ensure release version matches

---

## Best Practices

- Use different environments for dev/staging/prod
- Start with low `SENTRY_TRACES_SAMPLE_RATE` (0.1)
- Never commit `.env` files
- Upload source maps in CI/CD

---

## Resources

- [Sentry Vue Guide](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry Capacitor Guide](https://docs.sentry.io/platforms/capacitor/)
