# Sport Link FE

Frontend mobile/web app for Sport Link, built with Flutter.

## Requirements

- Flutter SDK (stable)
- Dart SDK (comes with Flutter)
- Android Studio (for Android SDK, emulator, and build tools)
- (Optional) Xcode for iOS/macOS builds

## Quick Start

1. Install dependencies:

	```bash
	flutter pub get
	```

2. Check environment:

	```bash
	flutter doctor -v
	```

3. Run on a target:

	```bash
	# Android emulator/device
	flutter run -d emulator-5554

	# Web (Chrome)
	flutter run -d chrome

	# macOS desktop (requires full Xcode)
	flutter run -d macos
	```

## Android Setup (Android Studio)

If `flutter doctor` reports missing Android tools:

1. Open Android Studio → **Settings/Preferences** → **Android SDK**.
2. In **SDK Tools**, install:
	- Android SDK Command-line Tools (latest)
	- Android SDK Platform-Tools
	- Android Emulator
3. Accept licenses:

	```bash
	flutter doctor --android-licenses
	```

4. Verify:

	```bash
	flutter doctor -v
	```

## Common Commands

```bash
# List devices
flutter devices

# List emulators
flutter emulators

# Launch emulator
flutter emulators --launch Pixel_7a

# Run tests
flutter test
```

## Project Structure

- `lib/` – app source code (`main.dart` entry point)
- `test/` – widget/unit tests
- `android/`, `ios/`, `macos/`, `web/`, `linux/`, `windows/` – platform runners

## Notes

- You can develop and run Android/Web without Xcode.
- Xcode is required only for iOS/macOS builds.
