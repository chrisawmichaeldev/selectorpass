# SelectorPass v2.0 Video Production Guide

## 🎬 Video Overview
**Title**: SelectorPass v2.0 - Enterprise Security Meets Developer Precision  
**Duration**: ~5 minutes  
**Format**: Silent screen recording with subtitles  
**Target Audience**: Developers & Security-Conscious Users

## 🎯 Key Messages
- Enterprise-grade AES-256-GCM encryption
- Per-credential encryption control
- CSS selector precision targeting
- Local-only storage (no cloud sync)
- Real-time login synchronization

---

## 📋 Demo Script

### 🔧 Part 1: Quick Setup (60 seconds)
**[Screen: Demo page with login form]**
1. Navigate to https://chrisawmichaeldev.github.io/selectorpass/demo.html
2. Click extension icon → Show "No configuration found"
3. Click "Settings" button
4. **Highlight**: Domain auto-populates from current tab
5. Enter CSS selectors:
   - Username: `#username`
   - Password: `#password`
6. Click "Save Domain"
7. **Show**: Domain appears in domains list

### 🔐 Part 2: Security Setup (90 seconds)
**[Screen: Options page Security section]**
1. Expand "🔐 Security" section
2. Click "Setup Master Password"
3. **Demo validation**: Enter <8 characters → Show error
4. Enter valid password (8+ characters)
5. Confirm password
6. Click "Set Master Password"
7. **Show**: "🔓 Logged in" status
8. **Highlight**: "Enterprise-grade AES-256-GCM with PBKDF2"

### 💾 Part 3: Mixed Credential Types (75 seconds)
**[Screen: Add credentials section]**
1. **Add unencrypted credential**:
   - Username: "demo_user"
   - Password: "demo_pass"
   - **Don't check** encryption box
   - Click "Add"
2. **Add encrypted credential**:
   - Username: "secure_user" 
   - Password: "secure_pass"
   - **Check** "Encrypt this credential"
   - Click "Add"
3. **Show**: 🔐 icon next to encrypted credential
4. **Highlight**: Per-credential encryption control

### ⚡ Part 4: Seamless Usage (60 seconds)
**[Screen: Demo page]**
1. Navigate back to demo page
2. Click extension icon
3. **Show**: Both credentials listed with clear indicators
4. **Test unencrypted**: Click "Fill" → Instant filling
5. Clear form
6. **Test encrypted**: Click "Fill" on 🔐 credential → Instant filling (already logged in)
7. **Show**: Form fills without password prompt

### 🔄 Part 5: Real-time Sync Demo (45 seconds)
**[Screen: Split view - Options + Popup]**
1. Open popup in one tab, options in another
2. **Show**: Both display "🔓 Logged in"
3. Click "Logout" in options page
4. **Show confirmation dialog**: "Are you sure you want to logout?"
5. Confirm logout
6. **Demonstrate**: Popup instantly updates to "🚫 Logged out"
7. **Highlight**: Real-time synchronization

### 🛡️ Part 6: Security Features (30 seconds)
**[Screen: Options page security section]**
1. **Show**: Reset Master Password option
2. **Mention**: Stateless architecture
3. **Highlight**: Local-only storage
4. **Show**: GitHub and demo links in footer

---

## 📝 SRT Subtitle File

```srt
1
00:00:00,000 --> 00:00:03,000
SelectorPass v2.0 - Enterprise Security Meets Developer Precision

2
00:00:03,000 --> 00:00:06,000
Starting with a fresh login form on the demo page

3
00:00:06,000 --> 00:00:09,000
Extension shows "No configuration found" - let's set it up

4
00:00:09,000 --> 00:00:12,000
Click Settings to open configuration page

5
00:00:12,000 --> 00:00:15,000
Domain auto-populates from current tab

6
00:00:15,000 --> 00:00:18,000
Enter CSS selectors: #username and #password

7
00:00:18,000 --> 00:00:21,000
Save Domain - one-time setup per website

8
00:00:21,000 --> 00:00:25,000
NEW: Enterprise-grade security with AES-256-GCM encryption

9
00:00:25,000 --> 00:00:28,000
Setup Master Password for encrypted credentials

10
00:00:28,000 --> 00:00:31,000
Password validation: minimum 8 characters required

11
00:00:31,000 --> 00:00:34,000
PBKDF2 key derivation with 100,000 iterations

12
00:00:34,000 --> 00:00:37,000
Status shows "🔓 Logged in" - ready for encryption

13
00:00:37,000 --> 00:00:40,000
Adding unencrypted credential: demo_user / demo_pass

14
00:00:40,000 --> 00:00:43,000
Adding encrypted credential: secure_user / secure_pass

15
00:00:43,000 --> 00:00:46,000
Check "Encrypt this credential" for AES-256-GCM protection

16
00:00:46,000 --> 00:00:49,000
🔐 icon indicates encrypted credentials

17
00:00:49,000 --> 00:00:52,000
Per-credential encryption control - mix encrypted & plain text

18
00:00:52,000 --> 00:00:55,000
Testing on demo page - both credentials available

19
00:00:55,000 --> 00:00:58,000
Unencrypted credential fills instantly

20
00:00:58,000 --> 00:01:01,000
Encrypted credential (🔐) also fills instantly - already logged in

21
00:01:01,000 --> 00:01:04,000
Real-time sync: Options page and popup stay synchronized

22
00:01:04,000 --> 00:01:07,000
Logout confirmation prevents accidental logouts

23
00:01:07,000 --> 00:01:10,000
Popup updates immediately - no refresh needed

24
00:01:10,000 --> 00:01:13,000
Stateless security: no persistent sessions

25
00:01:13,000 --> 00:01:16,000
Local-only storage - your data never leaves your device

26
00:01:16,000 --> 00:01:19,000
Perfect for developers who need precision and security

27
00:01:19,000 --> 00:01:22,000
Try it yourself - links in description
```

---

## 🎥 Recording Setup

### **Technical Requirements**
- **Screen Resolution**: 1920x1080 for crisp quality
- **Browser Zoom**: 125% for better visibility
- **Recording Software**: OBS Studio, Camtasia, or ScreenFlow
- **Frame Rate**: 30fps minimum
- **Cursor Highlighting**: Enable for better tracking

### **Recording Tips**
- **Slow, deliberate movements** - viewers need time to read subtitles
- **Pause 2-3 seconds** after each major action
- **Clean desktop** - minimal distractions
- **Close unnecessary browser tabs**
- **Use incognito mode** for clean browser appearance

### **Subtitle Timing**
- **3-4 seconds per subtitle** for comfortable reading
- **Sync with actions** - subtitle appears as you perform the action
- **Technical terms** get extra time to read
- **No more than 2 lines per subtitle**

---

## 📺 YouTube Upload Guide

### **Video Details**
**Title**: SelectorPass v2.0 - Enterprise Security Password Manager for Developers

**Description**:
```
SelectorPass v2.0 - Enterprise Security Meets Developer Precision

🔐 NEW SECURITY FEATURES:
• AES-256-GCM encryption with authenticated encryption
• PBKDF2 key derivation (100,000 iterations)
• Per-credential encryption control
• Stateless security architecture
• Real-time login synchronization

🎯 DEVELOPER FEATURES:
• CSS selector precision targeting
• Local-only storage (no cloud sync)
• Multiple credentials per domain
• Auto-sort recent credentials
• Drag & drop reordering

🔗 LINKS:
• Demo Page: https://chrisawmichaeldev.github.io/selectorpass/demo.html
• GitHub: https://github.com/chrisawmichaeldev/selectorpass
• Chrome Web Store: [Coming Soon]

Perfect for developers and security-conscious users who need precise control over their password management.

#PasswordManager #ChromeExtension #WebSecurity #Developer #AES256 #Privacy #LocalStorage #CSS #JavaScript
```

**Tags**: password manager, chrome extension, web security, developer tools, AES encryption, privacy, local storage, CSS selectors, JavaScript, open source

**Thumbnail Ideas**:
- SelectorPass logo with "v2.0" and security icons
- Split screen showing encryption setup and form filling
- "Enterprise Security" text with lock icons

### **Upload Process**
1. **Upload video file**
2. **Add title and description**
3. **Upload SRT subtitle file**: More options → Subtitles → Upload file
4. **Set thumbnail** (custom recommended)
5. **Add to playlist** (if you have a developer tools playlist)
6. **Set visibility**: Public
7. **Add end screen**: Link to GitHub and demo page

---

## 🎯 Success Metrics

### **Engagement Goals**
- **Watch time**: >60% average view duration
- **Click-through rate**: >5% to GitHub/demo links
- **Comments**: Technical questions about implementation
- **Likes**: Positive feedback on security features

### **Call-to-Actions**
1. **Try the demo**: Link in description
2. **Star on GitHub**: Support open source development
3. **Subscribe**: For more developer tools
4. **Comment**: Share your use cases or feedback

---

## 📋 Pre-Recording Checklist

- [ ] Clean browser profile (incognito mode)
- [ ] Demo page loaded and tested
- [ ] Extension installed and working
- [ ] Screen recording software configured
- [ ] Desktop cleaned of distractions
- [ ] Browser zoom set to 125%
- [ ] Cursor highlighting enabled
- [ ] Script reviewed and practiced
- [ ] Backup recording plan ready

## 📋 Post-Recording Checklist

- [ ] Video quality check (1080p minimum)
- [ ] Audio removed (silent video)
- [ ] SRT file created and timed
- [ ] Thumbnail designed
- [ ] Description written
- [ ] Tags selected
- [ ] Upload scheduled
- [ ] Social media promotion planned