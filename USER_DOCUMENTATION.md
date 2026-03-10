# HeliiX — User Documentation

> **HeliiX** is a federated social networking platform that lets you connect, share, and communicate across multiple independent instances — including Mastodon-compatible servers via ActivityPub.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard & Feed](#2-dashboard--feed)
3. [Creating Posts](#3-creating-posts)
4. [Interacting with Posts](#4-interacting-with-posts)
5. [User Profile](#5-user-profile)
6. [Connections & Networking](#6-connections--networking)
7. [Search & Discovery](#7-search--discovery)
8. [Real-Time Chat](#8-real-time-chat)
9. [Video & Voice Calls](#9-video--voice-calls)
10. [Notifications](#10-notifications)
11. [Federation](#11-federation)
12. [Mobile Experience](#12-mobile-experience)
13. [Account Security](#13-account-security)
14. [Privacy & Terms](#14-privacy--terms)

---

## 1. Getting Started

### Choosing an Instance

When you first visit HeliiX, you'll land on the **Instance Selection** page. HeliiX is a **federated** platform, meaning there are multiple independent servers (instances) you can join:

| Instance | Description |
|----------|-------------|
| **Social Community** | The default HeliiX cloud community |
| **Local Dev Backend** | For local development/testing |

Click on an instance card to select it. Your choice is saved in your browser — you can switch instances later from the dashboard.

### Registration

1. Click **Sign Up** on the auth page.
2. Fill in your **Username**, **Email** (optional), and **Password**.
3. After registering, you'll be prompted with the **Avatar Nudge** — a playful two-step modal encouraging you to upload a profile picture. You can skip this step, but we recommend uploading one!
4. Once done, you'll be redirected to **Login**.

### Logging In

1. Enter your **Username** and **Password**.
2. Click **Sign In**.
3. You'll be taken to the **Dashboard**.

### Forgot Password

1. Click **Forgot Password?** on the login page.
2. Enter your registered **email address**.
3. You'll receive a **one-time password (OTP)** via email.
4. Enter the OTP to verify your identity.
5. Set a **new password** and log in.

---

## 2. Dashboard & Feed

The Dashboard is your home screen. It consists of three sections:

### Left Sidebar (Desktop)
- **Available Users** — Suggested users to connect with, showing their display name and @username.
- **Pending Invites** — Incoming connection requests you can accept.

### Center Feed
- **Global Feed** — Posts from all users on the instance.
- **Following Feed** — Posts only from users you're connected with.
- Toggle between feeds using the **Global / Following** tabs at the top.
- **Pull-to-refresh** or use the refresh button to load new posts.
- A **scroll-to-top** button appears when you scroll down.

### Right Sidebar (Desktop)
- **Notifications Panel** — Shows recent likes, comments, mentions, and connection activity with real-time polling.

---

## 3. Creating Posts

### On Desktop
1. Click the **"What's on your mind?"** bar at the top of the feed.
2. A **Post Modal** opens where you can:
   - Write text content (up to the character limit).
   - **Attach an image** — click the image icon to upload. Images are automatically checked for inappropriate content via the moderation service.
   - **Use Voice Dictation** — click the microphone icon to dictate your post using speech-to-text.
   - **AI Enhance** — click "Enhance" to get an AI-generated improved version of your text.
   - **AI Elaborate** — click "Elaborate" to expand your content with more detail.
   - **@Mention users** — type `@` followed by a username to mention someone. A dropdown will appear with suggestions.
   - **Set Visibility** — choose between **Public** (everyone) or **Connections Only**.
3. Click **Post** to publish.

### On Mobile
- Tap the **+** button in the bottom navigation bar.
- The full-screen **Create Post** page opens with the same features as above.

---

## 4. Interacting with Posts

### Liking
- Click the **heart icon** on any post to like it. The heart turns red when liked.
- **Double-tap** on a post image to like it — a heart animation plays.
- Your likes persist across sessions.
- Unread badge: posts show a count (e.g., "4+") for likes exceeding 4.

### Commenting
- Click the **comment icon** to expand the comment section.
- Type your comment and press **Enter** or click the send button.
- You can **delete your own comments** by hovering over them and clicking the × button.
- Comment counts update in real-time.

### Deleting Posts
- On your own posts, a **delete** option is available.
- A confirmation modal will appear before deletion.

---

## 5. User Profile

### Viewing Profiles
- Click on any **username** or **avatar** in the feed to visit their profile.
- Profiles display:
  - Avatar, display name, and username
  - Bio and website
  - **Post count**, **Connection count**
  - A grid/list view of their posts

### Editing Your Profile
1. Navigate to your own profile.
2. Click the **Edit** (pencil) icon.
3. You can update:
   - **Display Name**
   - **Bio**
4. Click **Save** to apply changes.

### Uploading/Changing Avatar
- Click on your avatar on your profile page.
- Select a new image file.
- The avatar updates immediately.

### Connections List
- Click on the **connections count** to see all your connections.
- You can **remove connections** from this list.

---

## 6. Connections & Networking

### Sending Connection Requests
- On the Dashboard, click **Connect** next to a suggested user.
- On a user's profile, click the **Connect** button.
- On the Search page, click the **+** icon next to a user.

### Accepting Invites
- Pending invites appear in:
  - The **left sidebar** on Dashboard (desktop)
  - The **Network** page (mobile)
  - The **Search** page under "Pending Invites"
- Click **Accept** (✓) to approve the request.

### Removing Connections
- Go to your **Profile** → Click on connections count.
- Click the **remove** button next to any connection.

---

## 7. Search & Discovery

### Searching for Users
- **Desktop**: Click the **search icon** in the navbar to open the User Search Modal.
- **Mobile**: Navigate to the **Search** tab in the bottom navigation.
- Type a username or display name — results appear as you type (with debouncing).
- Results show the user's **avatar**, **display name**, **@username**, and **connection status**.

### Discover People
- The **Network** page (mobile) and **Dashboard sidebar** (desktop) show random suggested users you might want to connect with.

---

## 8. Real-Time Chat

### Accessing Chat
- Click the **Messages** icon in the navbar, or navigate to `/chat`.

### Starting a Conversation
1. In the left panel, your existing **conversations** are listed with the last message preview and timestamp.
2. Click the **Connections** section header to expand your connection list.
3. Click on any connection to start or continue a conversation.

### Sending Messages
- Type your message in the input bar at the bottom.
- Press **Enter** or click the **Send** button.
- Messages appear in real-time via WebSocket.

### Emoji Support
- Click the **smiley face** icon to open the emoji picker.
- Select an emoji to insert it into your message.

### Unread Indicators
- Conversations with unread messages show a **blue badge** with the unread count (e.g., "4+" for more than 4).
- Unread conversations have **bold text** in the sidebar.
- Clicking on a conversation clears its unread status and sends a read receipt.

### Searching Conversations
- Use the **search bar** at the top of the chat list to filter conversations by username.

---

## 9. Video & Voice Calls

### Starting a Call
1. Open a chat conversation.
2. In the chat header, click:
   - **📹 Video** icon for a video call
   - **📞 Phone** icon for a voice call
3. The call state changes to **"Calling..."** while waiting for the other person.

### Receiving a Call
- When someone calls you, an **incoming call overlay** appears showing the caller's name and avatar.
- You can **Accept** (green button) or **Decline** (red button).
- After accepting, a **connecting countdown** plays before the call starts.

### During a Call
- **Mute/Unmute** — Toggle your microphone.
- **Video On/Off** — Toggle your camera (video calls only).
- **Call Timer** — Shows elapsed call time.
- **End Call** — Click the red phone button to hang up.

### Call Features
- Uses **WebRTC** for peer-to-peer communication.
- Includes **STUN/TURN** servers for NAT traversal.
- Camera fallback: if the camera is busy, video calls automatically fall back to voice.
- After ending a call, your camera and microphone are **fully released**.

### Resizable Call Panel (Desktop)
- Drag the edge of the call panel to resize it while chatting.

---

## 10. Notifications

### Types of Notifications
| Type | Description |
|------|-------------|
| ❤️ **Like** | Someone liked your post |
| 💬 **Comment** | Someone commented on your post |
| 👤 **Follow / Connection** | Someone connected with you |
| 📩 **Mention** | Someone mentioned you in a post |

### Viewing Notifications
- **Desktop**: Notifications appear in the **right sidebar** of the Dashboard.
- **Mobile**: Tap the **Bell** icon in the bottom navigation bar.
- Notifications auto-refresh every **5 seconds**.
- Each notification links to the relevant profile.

---

## 11. Federation

HeliiX supports the **ActivityPub** protocol, meaning you can interact with users on other federated platforms like **Mastodon**.

### How It Works
- **WebFinger Discovery** — Remote users can find your profile using `@username@yourdomain.com`.
- **Following Remote Users** — When you follow a remote user, HeliiX sends a Follow activity to their instance.
- **Receiving Remote Posts** — Posts from remote users you follow appear in your **Following** feed.
- **Cross-Instance Interactions** — Likes, comments, and follows work across federated instances.

### Creating Your Own Community
- Visit the **Documentation** page (`/docs/create-community`) for a step-by-step guide on deploying your own HeliiX instance.

---

## 12. Mobile Experience

HeliiX is fully responsive with a dedicated mobile experience:

### Bottom Navigation Bar
| Icon | Page |
|------|------|
| 🏠 Home | Dashboard / Feed |
| 🔗 Network | Connections & Invites |
| ➕ Create | New Post |
| 🔍 Search | Find Users |
| 🔔 Notifications | Activity Feed |

### Swipe Navigation
- Swipe **left/right** between pages for quick navigation.

### Mobile-Optimized Features
- Full-screen post creation with speech-to-text.
- Touch-friendly chat interface with swipe gestures.
- Responsive call overlay and controls.
- Safe area support for devices with notches/home indicators.

---

## 13. Account Security

- **JWT Authentication** — Secure token-based auth with automatic refresh.
- **Password Reset** — Email-based OTP verification flow.
- **Session Management** — Expired sessions redirect to the login page automatically.
- **Content Moderation** — Uploaded images are scanned for inappropriate content before posting.

---

## 14. Privacy & Terms

- **Privacy Policy** — Available at `/privacy`. Details how your data is collected, used, and protected.
- **Terms of Service** — Available at `/terms`. Outlines the rules and guidelines for using the platform.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message (Chat) |
| `Enter` | Submit comment |
| `@` + typing | Trigger @mention dropdown |

---

## Browser Requirements

- **Recommended**: Chrome, Firefox, Edge (latest versions)
- **Camera/Mic**: Required for video/voice calls — grant permissions when prompted
- **WebRTC**: Must be enabled for calls to work
- **Cookies/LocalStorage**: Required for authentication and instance selection

---

