# WorkHardPlayHard

## Description
WorkHardPlayHard is a Chrome extension designed to help users stay focused by blocking access to distracting websites. It also allows managing a whitelist of allowed sites and displays motivational messages to encourage productivity.

## Features
- **Website Blocking**: Prevents access to unauthorized websites.
- **Whitelist Management**: Add websites to a whitelist to allow access.
- **Motivational Messages**: Displays inspiring phrases to keep you motivated.
- **Random Images**: Shows a random image on the blocking page.
- **Focus Mode**: Enable or disable the filter via a toggle switch.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ShamuCode/WorkHardPlayHard/
   ```
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable Developer Mode.
4. Click "Load unpacked extension."
5. Select the project folder.

## Usage
- **Enable/Disable the Filter**: Use the toggle switch in the extension popup.
- **Add a Site to the Whitelist**:
    * Click "Add this site to the whitelist" to whitelist the active site.
    * Manually add a domain or URL via the input field.
- **Blocking Page**: When a site is blocked, a page displays a random image and a motivational message.

## Project Structure
- `manifest.json`: Extension configuration.
- `popup.html`: Popup user interface.
- `blocked.html`: Page displayed when access to a site is blocked.
- `blocked.js`: Logic for the blocking page.
- `background.js`: Handles navigation events.
- `styles.css`: Styles for the extension pages.
- `motivation.json`: List of motivational phrases.
- `img/`: Folder containing images used in the extension.

## Contributions
Contributions are welcome! Please submit a pull request or open an issue to discuss changes.

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details. 