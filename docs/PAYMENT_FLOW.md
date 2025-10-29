# Payment Flow Documentation

## Overview
This document describes the payment flow implementation for booking deposits using Stripe.

## Flow Description

### 1. Booking Creation
- User fills out booking details (Artist, Details, Schedule steps)
- On "Submit Request", booking is created in the database with `paymentStatus: "unpaid"`
- System checks if artist has `payoutsEnabled: true`

### 2. Payment Step (Conditional)
**Shown only if:** `artist.payoutsEnabled === true`

- After booking creation, user sees Payment step
- PaymentStep component displays:
  - Information about deposit requirement
  - Security features
  - "Pay Deposit" button

### 3. Payment Processing
When user clicks "Pay Deposit":
1. `CREATE_BOOKING_PAYMENT_MUTATION` is called with booking ID
2. Backend creates Stripe checkout session
3. Response contains `sessionUrl`
4. App uses `useStripe.openStripeUrl()` to redirect:
   - **Native (iOS/Android)**: Opens in-app browser via Capacitor Browser
   - **Web**: Opens in new tab

### 4. Payment Completion
After successful payment:
- Stripe redirects to `/payment-success` page
- User sees success message
- User can navigate to "My Bookings" page

## Components

### PaymentStep.vue
Location: `src/components/Dialogs/CreateBookingSteps/PaymentStep.vue`

Props:
- `loading: boolean` - Loading state during payment processing
- `disabled: boolean` - Disabled state
- `depositAmount: number` - Deposit amount to be paid (in USD)

Events:
- `onPay` - Emitted when user clicks Pay Deposit

Display Features:
- Shows simple pricing card with the amount to pay
- Security and confirmation features list

### PaymentSuccessPage.vue
Location: `src/pages/PaymentSuccessPage.vue`

Route: `/payment-success`

Displays:
- Success icon
- Success message
- "View My Bookings" button

## CreateBookingDialog Changes

### New State
- `selectedArtist: IUser | null` - Full artist object with payoutsEnabled
- `createdBooking: IBookingCreateResponse | null` - Booking created before payment
- `isPaymentProcessing: boolean` - Payment processing state

### New Steps
- Step 4: Payment (conditional)

### Step Visibility Logic
```typescript
visibleSteps = computed(() => {
  // Filter out Artist step if artistDocumentId is provided
  let steps = isArtistSelectionRequired ? allSteps : stepsWithoutArtist;
  
  // Filter out Payment step if artist doesn't accept payments
  if (!selectedArtist.payoutsEnabled) {
    steps = steps.filter(step => step.id !== 4);
  }
  
  return steps;
});
```

### Key Methods

#### onSubmit()
1. Validates schedule
2. Uploads reference files
3. Creates booking
4. Checks `shouldShowPaymentStep`
5. If true: moves to Payment step
6. If false: shows success and closes dialog

#### handlePayment()
1. Calls `createBookingPayment` mutation
2. Gets `sessionUrl` from response
3. Opens Stripe URL using `openStripeUrl()`
4. Closes dialog

## GraphQL Mutations

### CREATE_BOOKING_PAYMENT_MUTATION
```graphql
mutation CreateBookingPayment($bookingId: ID!) {
  createBookingPayment(bookingId: $bookingId) {
    booking {
      documentId
    }
    sessionId
    sessionUrl
  }
}
```

## Routes

New route added to `routes.ts`:
```typescript
{
  path: 'payment-success',
  component: () => import('pages/PaymentSuccessPage.vue'),
  meta: { title: 'Payment Success' }
}
```

## Artist Data Loading

When `artistDocumentId` prop is provided:
- Uses `USER_QUERY` to fetch full artist data including `payoutsEnabled`
- Stores in `selectedArtist` state
- Used to determine if Payment step should be shown

## Composables Used

### useStripe
Location: `src/composables/useStripe.ts`

Method: `openStripeUrl(url: string)`
- Handles opening Stripe URL on both web and native platforms
- Uses Capacitor Browser for native apps
- Uses window.open for web
