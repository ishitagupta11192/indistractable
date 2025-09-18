Focus Lock — Smart Distraction Blocker
==========================================

A Chrome extension that helps students stay focused by blocking distracting websites with smart keyword detection.

## 🚀 Installation Instructions

1. Download or clone this extension folder
2. Open Chrome and navigate to: chrome://extensions/
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" button
5. Select the chrome_extension folder
6. The extension icon should appear in your browser toolbar

## 🔧 How It Works

Focus Lock automatically detects whether a webpage is study-related or distracting:

- **Study-related pages**: Contain keywords like "study", "lecture", "assignment", etc.
- **Distracting pages**: Don't contain any study keywords

When you visit a distracting page, Focus Lock shows a full-screen overlay that:
- Blocks all page interaction
- Shows a countdown timer (default: 5 minutes)
- Requires completing a micro-task to unlock early
- Offers optional educational YouTube videos

## ⚙️ Customization

Click the Focus Lock icon in your browser toolbar to access settings:

### Settings Available:
- **Enable/Disable**: Toggle the extension on/off
- **Lock Duration**: Set how long to block distracting sites (1-60 minutes)
- **Study Keywords**: Customize which keywords identify study-related content

### Default Study Keywords:
study, lecture, assignment, homework, tutorial, course, project, notes, exam, lab, syllabus, research, academic, learning, education, university, college, school, textbook, curriculum, workshop

### Adding Custom Keywords:
- Enter keywords separated by commas
- Keywords are case-insensitive
- Pages containing ANY keyword will be considered study-related

## 🎯 Micro-Tasks

When blocked, you can unlock early by completing a micro-task:
- Type a motivational sentence exactly as shown
- Tasks are randomly selected from a pool of positive affirmations
- Helps reinforce focus mindset

## 📺 Educational Content

The overlay includes curated YouTube videos:
- Educational content from channels like 3Blue1Brown, Crash Course
- Calming nature sounds and study techniques
- Completely optional - watch only if desired

## 🔒 Privacy & Security

- **100% Local Processing**: All logic runs on your device
- **No Data Collection**: No personal information is sent anywhere
- **No External Servers**: Extension works entirely offline
- **Chrome Storage**: Settings stored locally in your browser

## 🛠️ Technical Details

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Permissions**: storage, activeTab, scripting
- **Compatibility**: Chrome 88+ (Manifest V3 support)

## 🐛 Troubleshooting

### Extension Not Working:
1. Check if it's enabled in chrome://extensions/
2. Refresh the page you want to block
3. Verify study keywords are configured correctly

### Overlay Not Appearing:
1. Ensure extension is enabled
2. Check that the page doesn't contain study keywords
3. Try reloading the page

### Settings Not Saving:
1. Click "Save Settings" after making changes
2. Check browser console for errors (F12)
3. Try restoring defaults and reconfiguring

## 📝 Usage Tips

1. **Customize Keywords**: Add subject-specific terms (e.g., "physics", "chemistry")
2. **Adjust Duration**: Start with shorter periods (2-3 minutes) and increase gradually
3. **Use Micro-Tasks**: Complete them mindfully to reinforce focus habits
4. **Whitelist Sites**: Add keywords for legitimate sites you need to access

## 🎓 Study Strategy

Focus Lock works best when combined with:
- Pomodoro Technique (25-minute focused sessions)
- Time-blocking your study schedule
- Creating a distraction-free study environment
- Regular breaks between focus sessions

## 📞 Support

This extension is designed to be simple and self-contained. For issues:
1. Check this README first
2. Verify Chrome extension permissions
3. Try disabling/enabling the extension
4. Restore default settings if needed

---

Stay focused, stay productive! 💪

Focus Lock v1.0.0
