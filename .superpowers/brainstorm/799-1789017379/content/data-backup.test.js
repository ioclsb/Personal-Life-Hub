const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync(__dirname + '/wood-rename.html', 'utf8');

assert.match(source, /id="exportDataButton"/, '主界面应提供导出数据按钮');
assert.match(source, /id="importDataButton"/, '主界面应提供导入数据按钮');
assert.match(source, /id="importDataInput"/, '主界面应提供备份文件选择器');
assert.match(source, /function exportAllData/, '应提供完整数据导出函数');
assert.match(source, /function importAllData/, '应提供完整数据导入函数');
assert.match(source, /personal-life-hub-/, '备份应覆盖生活台存储空间');
assert.match(source, /application\/json/, '备份文件应使用 JSON 格式');
