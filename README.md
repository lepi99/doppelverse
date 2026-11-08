# doppelverse

Website

## Local configuration

Copy `.env.example` to `.env.local` and fill in the Firebase web app values from
Firebase Console → Project settings → Your apps. The `NEXT_PUBLIC_FIREBASE_*`
values are public Firebase client configuration and will be included in the
browser build; they are not a way to protect Firebase data. Use Firebase
Security Rules (and App Check where appropriate) to secure Firestore and
Storage.

Never put Gemini or other privileged API keys in client-side code or in a
`NEXT_PUBLIC_*` variable. Store those in your hosting provider's server-side
environment settings and call the API from server-side code.

Environment files are ignored by Git. A GitHub Actions secret scan runs on
pushes and pull requests to help catch credentials before merging.
