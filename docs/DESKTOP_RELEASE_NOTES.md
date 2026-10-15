Untangle now runs as an offline desktop application. No Node.js installation, terminal or local web server is required.

Downloads:
- Windows x64: `setup.exe` installer or `portable.exe`.
- Linux x64: AppImage or Debian/Ubuntu `.deb`.
- macOS: `.dmg` or `.zip`; choose `x64` for Intel or `arm64` for Apple Silicon.

The application uses its own storage directory. Analysed source persists between launches. Export JSON for backups and transfers. Browser-session data is separate from desktop-app data.

This release is unsigned and macOS builds are not notarized. Windows or macOS can show an unknown-publisher or verification prompt. Follow your organisation's installation policy. Linux AppImage requires executable permission and may require FUSE; the `.deb` is an alternative for Debian/Ubuntu.

Each platform build runs analysis tests, a production build and an unpacked desktop smoke test before publication. SHA256SUMS.txt provides integrity checks for all downloads. Installer installation, Gatekeeper acceptance and every supported OS version are not covered by the automated smoke test.

Untangle is a heuristic technical-writing aid, not an ASD-STE100 compliance certificate or an operational aircraft-maintenance validator.
