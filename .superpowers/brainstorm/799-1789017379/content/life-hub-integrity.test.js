const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = __dirname;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'life-hub-manifest.json'), 'utf8'));
const server = fs.readFileSync(path.join(root, 'life-hub-server.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'wood-rename.html'), 'utf8');

assert.equal(manifest.entry, 'wood-rename.html', '固定入口应为生活台主界面');
assert.deepEqual(manifest.requiredPages, [
  'wood-rename.html',
  'wood-growth-checklist.html',
  'wood-life-timeline.html',
  'wood-kitchen-template.html'
], '核心页面清单不能缺失');
manifest.requiredPages.forEach(function(file) {
  assert.ok(fs.existsSync(path.join(root, file)), file + ' 必须存在');
});
assert.match(server, /http\.createServer/, '应提供固定本地服务');
assert.match(server, /wood-rename\.html/, '服务根路径应打开固定入口');
assert.match(server, /path\.resolve|path\.normalize/, '服务应限制在生活台目录内');
assert.match(server, /Cache-Control.*no-store/, '固定服务应禁止浏览器缓存页面');
assert.match(main, /life-hub-manifest\.json/, '主界面应加载页面清单');
assert.match(main, /完整性检查|integrity/, '主界面应显示完整性检查状态');
