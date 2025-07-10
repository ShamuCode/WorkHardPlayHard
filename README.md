# 🚀 WorkHardPlayHard

<img src="./img/icon.png" alt="Logo" style="width:100px;"/>

## 🌟 Description
**WorkHardPlayHard** is a Chrome extension designed to help you stay focused by blocking access to distracting websites. It also lets you manage a whitelist of allowed sites and displays motivational messages to boost your productivity.

## ✨ Features
- 🔒 **Website Blocking**: Prevent access to unauthorized websites.
- ✅ **Whitelist Management**: Add websites to a whitelist to allow access.
- 💬 **Motivational Messages**: Displays inspiring phrases to keep you motivated.
- 🖼️ **Random Images**: Shows a random image on the blocking page.
- 🕹️ **Focus Mode**: Enable or disable the filter via a toggle switch.

## 🛠️ Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ShamuCode/WorkHardPlayHard/
   ```
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer Mode**.
4. Click **Load unpacked extension**.
5. Select the project folder.

## 📖 Usage
- **Enable/Disable the Filter**: Use the toggle switch in the extension popup.
- **Add a Site to the Whitelist**:
    - Click "Add this site to the whitelist" to whitelist the active site.
    - Manually add a domain or URL via the input field.
- **Add a Site to the Blacklist**:
    - Click "Add this site to the blacklist" to block the active site.
    - Manually add a domain or URL via the input field.
- **Blocking Page**: When a site is blocked, a page displays:
    - A random motivational message.
    - A random image (optional).
- **Modes**:
    - Save your current settings as a mode.
    - Switch between modes easily.
    - Export and import modes for backup or sharing.

## 📂 Project Structure
- `manifest.json`: Extension configuration.
- `popup.html`: Popup user interface.
- `blocked.html`: Page displayed when access to a site is blocked.
- `blocked.js`: Logic for the blocking page.
- `background.js`: Handles navigation events.
- `styles.css`: Styles for the extension pages.
- `motivation.json`: List of motivational phrases.
- `languages.json`: Multi-language support.
- `img/`: Folder containing list of images used in the extension.

## 🤝 Contributing
1. **Fork the project** and create your branch.
2. **Commit changes** with clear messages.
3. **Push to your fork** and create a Pull Request.

## 💡 Future Improvements
- Add more languages.

## 📜 License
This project is **open-sourced** under the **MIT License**. Feel free to use, modify, and distribute following the license terms.