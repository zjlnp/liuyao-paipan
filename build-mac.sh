#!/bin/bash
# ===== 六爻排盘 macOS 打包脚本 =====
# 1. 重建 app.html
# 2. 编译 Swift WKWebView 壳
# 3. 从 icon.svg 重新生成 icon.icns
# 4. 组装 .app bundle
# 5. 生成 DMG 并复制到桌面
set -euo pipefail
cd "$(dirname "$0")"

APP_NAME="六爻排盘"
BIN_NAME="LiuYaoPaiPan"
BUNDLE_ID="com.liuyao.paipan"
VERSION="4.6.2"
BUILD_DIR="build/mac"
APP_DIR="$BUILD_DIR/${APP_NAME}.app"

echo "==> 1/5 重建 app.html"
node build.js

echo "==> 2/5 编译 Swift 壳"
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"
swiftc -O -target arm64-apple-macosx12.0 macapp/main.swift -o "$APP_DIR/Contents/MacOS/$BIN_NAME"

echo "==> 3/5 生成 Info.plist"
cat > "$APP_DIR/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>zh_CN</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleExecutable</key>
    <string>${BIN_NAME}</string>
    <key>CFBundleIconFile</key>
    <string>app.icns</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundleVersion</key>
    <string>9</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>LSRequiresNativeExecution</key>
    <true/>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo "==> 4/5 生成图标 icon.icns"
ICONSET="$BUILD_DIR/icon.iconset"
rm -rf "$ICONSET"; mkdir -p "$ICONSET"
sips -s format png -z 1024 1024 icons/icon.svg --out "$ICONSET/icon_512x512@2x.png" >/dev/null
sips -z 512 512 "$ICONSET/icon_512x512@2x.png" --out "$ICONSET/icon_512x512.png" >/dev/null
sips -z 256 256 "$ICONSET/icon_512x512@2x.png" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
sips -z 256 256 "$ICONSET/icon_512x512.png" --out "$ICONSET/icon_256x256.png" >/dev/null
sips -z 128 128 "$ICONSET/icon_512x512.png" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
sips -z 128 128 "$ICONSET/icon_512x512.png" --out "$ICONSET/icon_128x128.png" >/dev/null
sips -z 64 64 "$ICONSET/icon_512x512.png" --out "$ICONSET/icon_32x32@2x.png" >/dev/null
sips -z 32 32 "$ICONSET/icon_512x512.png" --out "$ICONSET/icon_32x32.png" >/dev/null
sips -z 32 32 "$ICONSET/icon_512x512.png" --out "$ICONSET/icon_16x16@2x.png" >/dev/null
sips -z 16 16 "$ICONSET/icon_512x512.png" --out "$ICONSET/icon_16x16.png" >/dev/null
iconutil -c icns "$ICONSET" -o "$APP_DIR/Contents/Resources/app.icns"

echo "==> 5/5 复制资源并生成 DMG（含 Applications 拖动安装）"
cp app.html "$APP_DIR/Contents/Resources/app.html"
DMG_STAGE="$BUILD_DIR/dmg-stage"
rm -rf "$DMG_STAGE"; mkdir -p "$DMG_STAGE"
cp -R "$APP_DIR" "$DMG_STAGE/"
ln -s /Applications "$DMG_STAGE/Applications"
rm -f "$BUILD_DIR/${APP_NAME}.dmg"
hdiutil create -volname "${APP_NAME}" -srcfolder "$DMG_STAGE" -ov -format UDZO "$BUILD_DIR/${APP_NAME}.dmg" >/dev/null
cp "$BUILD_DIR/${APP_NAME}.dmg" ~/Desktop/

echo ""
echo "✓ 完成：~/Desktop/${APP_NAME}.dmg"
ls -la ~/Desktop/${APP_NAME}.dmg
