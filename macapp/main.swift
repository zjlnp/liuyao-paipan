// ===== 六爻排盘 macOS 壳 — Swift + WKWebView =====
// 加载 Resources/app.html，无网络依赖，纯本地单文件
import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let contentRect = NSRect(x: 0, y: 0, width: 1080, height: 820)
        window = NSWindow(
            contentRect: contentRect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "六爻排盘"
        window.center()
        window.minSize = NSSize(width: 420, height: 640)
        window.isReleasedWhenClosed = false

        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: contentRect, configuration: config)
        webView.autoresizingMask = [.width, .height]

        if let url = Bundle.main.url(forResource: "app", withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }

        window.contentView = webView
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
