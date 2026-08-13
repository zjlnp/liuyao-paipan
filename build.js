// ===== build.js — 从源码确定性构建单文件 app.html =====
// 用法：node build.js
// 产出：app.html（内联 style.css + zhuanggua.js + ganzhi.js + data.js + app.js + hexagrams.json）
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

// 1. 读取源码
const indexHtml = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const styleCss  = fs.readFileSync(path.join(DIR, 'style.css'), 'utf8');
const zhuangguaJs = fs.readFileSync(path.join(DIR, 'zhuanggua.js'), 'utf8');
const ganzhiJs    = fs.readFileSync(path.join(DIR, 'ganzhi.js'), 'utf8');
const dataJs      = fs.readFileSync(path.join(DIR, 'data.js'), 'utf8');
const appJs       = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const hexagramsJson = fs.readFileSync(path.join(DIR, 'data', 'hexagrams.json'), 'utf8');

// 2. 内联 style.css
let html = indexHtml.replace(
  '<link rel="stylesheet" href="style.css">',
  '<style>\n' + styleCss + '\n</style>'
);

// 3. 组装内联脚本块（顺序与 index.html 的 <script src> 一致）
//    - zhuanggua.js 用 IIFE 包裹（其内部无顶层 const 冲突，且避免与 ganzhi 的常量冲突）
//    - ganzhi.js 顶层（定义 TIAN_GAN/DI_ZHI/calcGanZhi 等全局函数）
//    - 注入内联数据 window.__LIUYAO_DATA__（data.js 优先读取，回退 fetch）
//    - data.js 自身已是 IIFE
//    - app.js 顶层
const scriptBlock =
  '<script>(function(){\n' + zhuangguaJs + '\n})();\n' +
  ganzhiJs + '\n' +
  'window.__LIUYAO_DATA__ = ' + hexagramsJson + ';\n' +
  dataJs + '\n' +
  appJs + '\n' +
  '</script>';

// 4. 用脚本块替换 index.html 中从 <script src="zhuanggua.js"> 到 </body> 的部分
const scriptStart = html.indexOf('<script src="zhuanggua.js"></script>');
if (scriptStart === -1) {
  console.error('✗ 未找到 <script src="zhuanggua.js"></script>，请检查 index.html');
  process.exit(1);
}
const bodyEnd = html.indexOf('</body>');
const headAndBody = html.slice(0, scriptStart);
const tail = html.slice(bodyEnd); // 从 </body> 开始

const out = headAndBody + scriptBlock + '\n' + tail;

// 5. 写出 app.html
fs.writeFileSync(path.join(DIR, 'app.html'), out, 'utf8');
console.log('✓ app.html 构建完成（' + (Buffer.byteLength(out, 'utf8') / 1024 / 1024).toFixed(2) + ' MB）');
