# Connectly — Modern Real-Time Messaging Application

Connectly is a production-grade, responsive messaging web application inspired by modern messaging platforms. Built with original branding, a custom chat-bubble design language, deep teal (`#0F534C`) and fresh green (`#00A884`, `#25D366`) accents, and full light/dark theme support.

---

## Key Features

1. **Authentication (Live & Demo Modes)**:
   - **Live Mode**: Firebase Authentication with Google Popup (`signInWithPopup`) and Email/Password registration, password reset, and session persistence.
   - **Demo Mode**: Instant 1-click persona switching (Sarah Jenkins, Alex Chen, Elena Rostova, Marcus Brody) with simulated real-time replies so any reviewer can test multi-user conversations without needing multiple accounts.

2. **Real-Time Messaging**:
   - Cloud Firestore subcollections (`/conversations/{conversationId}/messages/{messageId}`) synchronized with `onSnapshot`.
   - Rich message types: Text, Voice Notes with audio wave visualizer, Photos with full-screen lightbox preview, Videos, Documents (.pdf, .doc), and System notices.
   - Delivery states: Sending, Sent (single tick), Delivered (double gray tick), Read (double cyan tick).
   - In-chat search, message editing, soft-deletion, copy text, star/pin messages, and reply quote references.
   - Live emoji reactions bar (👍, ❤️, 😂, 😮, 😢, 🙏, 🔥, 🎉) with real-time reaction counters.

3. **Group Chats**:
   - Create group chats with custom subject, description, and multi-selected contacts.
   - Member management, admin role badges, and group description details.

4. **24-Hour Stories & Status**:
   - Post Text stories with vibrant gradient palettes or Photo stories with captions.
   - 24-hour expiration rule enforced.
   - Full-screen animated story viewer with auto-progress bar (5s duration), pause on hold, viewer tracking, and instant story replies.

5. **Voice & Video Calling (WebRTC)**:
   - Voice and Video calling interface.
   - Live camera stream integration, microphone mute/unmute, duration timer, and call status indicators.
   - Call logs & history view with missed call filters and instant callback.

6. **Voice Messaging**:
   - Browser `MediaRecorder` audio recording with live waveform simulation and duration counter.
   - Slide/click to cancel or send with upload progress.

7. **Zero-Trust ABAC Firestore Security Rules**:
   - Rules version 2 deployed to Firebase.
   - Default-deny catch-all.
   - Master gate validation requiring conversation membership to read/post messages.
   - Immutable createdAt fields and strict string length bounds.
   - Isolated user privacy settings.

8. **Protected Superadmin Console**:
   - Available to `muhammadhaziq138mhh@gmail.com`.
   - User analytics, pending user moderation queue with review & resolve actions, security audit trail, and system broadcast announcement tool.

9. **Settings & Customization**:
   - Profile management (name, username, bio, photo upload).
   - Light & Dark theme toggle with persistence.
   - Privacy controls (Last seen, Online status, Read receipts).
   - Notification preferences (Message sounds, Previews).
   - Blocked users manager & Account deletion with safety confirmation dialog.

---

## File Structure

```
├── firebase-applet-config.json     # Provisioned Firebase configuration
├── firebase-blueprint.json         # Intermediate Schema Representation
├── firestore.rules                 # Hardened ABAC Firestore security rules
├── src/
│   ├── types/index.ts              # TypeScript interfaces
│   ├── services/
│   │   ├── firebase.ts             # Firebase app, db, auth, storage, error handlers
│   │   ├── authService.ts          # Auth methods (Google, email, profile sync)
│   │   ├── chatService.ts          # Realtime Firestore subscriptions, messages, reactions
│   │   ├── userService.ts          # User search, profile updates, moderation reports
│   │   ├── statusService.ts        # 24h stories creation and viewer tracking
│   │   └── storageService.ts       # Firebase Storage media uploads
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state, theme, Live/Demo toggle
│   │   └── ChatContext.tsx         # Active chat, messages, calling, filters
│   ├── components/
│   │   ├── common/                 # Logo, Avatar
│   │   ├── chat/                   # Sidebar, ListItem, ChatArea, Bubbles, Input, Details
│   │   ├── status/                 # Story viewer modal, story creation modal, feed
│   │   ├── calls/                  # Call overlay modal, call history log
│   │   ├── settings/               # Profile, Theme, Privacy, Notifications, Deletion
│   │   ├── admin/                  # Superadmin dashboard, moderation queue
│   │   ├── auth/                   # Google sign-in, email auth modal
│   │   └── landing/                # Public landing page with features preview
│   ├── data/demoData.ts            # Believable persona datasets for demo preview
│   └── App.tsx                     # Main layout & modal manager
```
