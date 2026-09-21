const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const vm = require('vm');

const sourceCommit = process.env.GROWTH_SOURCE_COMMIT;
const html = sourceCommit
  ? childProcess.execFileSync('git', ['show', sourceCommit + ':.superpowers/brainstorm/799-1789017379/content/wood-growth-checklist.html'], { encoding: 'utf8' })
  : fs.readFileSync(__dirname + '/wood-growth-checklist.html', 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.className = '';
    this.value = '';
    this.hidden = false;
    this._textContent = '';
    this.classList = { add: () => {}, remove: () => {} };
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  insertBefore(child, reference) {
    const index = this.children.indexOf(reference);
    this.children.splice(index < 0 ? this.children.length : index, 0, child);
    return child;
  }

  set textContent(value) {
    this._textContent = String(value);
    this.children = [];
  }

  get textContent() {
    return this._textContent + this.children.map((child) => child.textContent).join('');
  }

  set innerHTML(value) {
    this._textContent = String(value).replace(/<[^>]+>/g, '');
    this.children = [];
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  click() {
    this.listeners.click();
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  focus() {}
}

const elements = new Map([
  ['years', new Element('main')],
  ['itemCount', new Element('span')],
  ['itemModal', new Element('div')],
  ['editorTitle', new Element('h3')],
  ['itemDateInput', new Element('input')],
  ['itemTitleInput', new Element('input')],
  ['itemNoteInput', new Element('textarea')],
  ['itemColorInput', new Element('input')],
  ['yearModal', new Element('div')],
  ['yearInput', new Element('input')],
  ['yearDeleteButton', new Element('button')],
  ['yearCancelButton', new Element('button')],
  ['yearSaveButton', new Element('button')],
  ['deleteButton', new Element('button')],
  ['cancelButton', new Element('button')],
  ['saveButton', new Element('button')],
  ['backButton', new Element('button')]
]);

const localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, value) { this.data[key] = String(value); }
};

let confirmCalls = 0;
const context = vm.createContext({
  console,
  Date,
  URLSearchParams,
  localStorage,
  window: { location: { search: '', href: '' }, confirm: () => { confirmCalls += 1; return true; } },
  document: {
    getElementById(id) { return elements.get(id); },
    createElement(tagName) { return new Element(tagName); },
    addEventListener() {}
  }
});
vm.runInContext(script, context);

assert.strictEqual(context.ageAtYear(2026), 29, '2026年应显示29岁');
assert.strictEqual(context.ageAtYear(2027), 30, '2027年应显示30岁');

const growthHeader = elements.get('years').children[0];
const yearAddButton = growthHeader.children.find((child) => child.attributes['aria-label'] === '新增年份');
assert(yearAddButton, '页面顶部应提供新增年份按钮');
assert(growthHeader.textContent.includes('存款记录'), '页面顶部应显示存款记录标题');
assert(growthHeader.textContent.includes('状态'), '页面顶部应显示状态标题');
assert(growthHeader.textContent.includes('技能学习'), '页面顶部应显示技能学习标题');
const newestYearRow = elements.get('years').children[1];
assert(!newestYearRow.children[1].children.some((child) => child.attributes['aria-label'] === '新增年份'), '年份方块不应额外提供新增年份按钮');
yearAddButton.click();
assert(context.state.years.includes(2027), '新增年份按钮应创建最大年份后的新年份');
const newYearRow = elements.get('years').children[1];
assert(newYearRow.children[0].textContent.includes('2027'), '新增年份应显示在年份列表中');
assert(newYearRow.children[1].children.some((child) => child.attributes['aria-label'] === '2027 年新增第一个成长项目'), '新增年份应保留首个项目新增按钮');
newYearRow.children[0].listeners.dblclick();
assert.strictEqual(String(elements.get('yearInput').value), '2027', '双击年份应打开重命名窗口');
elements.get('yearInput').value = '2026';
elements.get('yearSaveButton').click();
assert(context.state.years.includes(2027), '年份重复时不应保存重命名');
elements.get('years').scrollTop = 240;
elements.get('yearDeleteButton').click();
assert.strictEqual(elements.get('years').scrollTop, 240, '年份编辑后应保持当前年份所在视图位置');
assert(!context.state.years.includes(2027), '确认删除后应移除年份及其项目');
assert.strictEqual(confirmCalls, 0, '删除年份不应再次确认');

function setEditor(date, title, note) {
  elements.get('itemDateInput').value = date;
  elements.get('itemTitleInput').value = title;
  elements.get('itemNoteInput').value = note;
}

function saveEditor() {
  elements.get('saveButton').click();
}

function findBlock(year, title) {
  const rows = elements.get('years').children;
  const row = rows.find((candidate) => candidate.textContent.includes(String(year)));
  return row.children[1].children.find((candidate) => candidate.textContent.includes(title));
}

context.openItemEditor(2018, null);
setEditor('2024-01-02', '第一次攀岩', '完成了第一次室内攀岩');
elements.get('itemColorInput').value = '#b85149';
saveEditor();
const firstItem = context.state.items[2018][0];
const firstItemSnapshot = JSON.parse(JSON.stringify(firstItem));
assert.strictEqual(firstItem.color, '#b85149', '项目应保存选择的颜色');
assert.deepStrictEqual({ date: firstItem.date, title: firstItem.title, note: firstItem.note }, {
  date: '2024-01-02', title: '第一次攀岩', note: '完成了第一次室内攀岩'
}, '2018 应保存新项目的日期、标题和备注');

context.openItemEditor(2019, null);
setEditor('2025-03-04', '学习潜水', '拿到证书');
saveEditor();
const otherYearItem = context.state.items[2019][0];
const otherYearItemSnapshot = JSON.parse(JSON.stringify(otherYearItem));

context.openItemEditor(2018, firstItem.id);
setEditor('2024-02-02', '取消编辑', '不应保存');
elements.get('cancelButton').click();
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[2018][0])), firstItemSnapshot, '取消编辑不应改变原项目');

elements.get('years').scrollTop = 320;
context.openItemEditor(2018, firstItem.id);
setEditor('2024-02-03', '第二次攀岩', '改成户外攀岩');
saveEditor();
assert.strictEqual(elements.get('years').scrollTop, 320, '编辑保存后应保持当前项目所在视图位置');
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[2018][0])), {
  id: firstItem.id, date: '2024-02-03', title: '第二次攀岩', note: '改成户外攀岩', color: '#b85149'
}, '编辑应只更新当前年份的项目');
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[2019][0])), otherYearItemSnapshot, '编辑2018不应影响2019');

const blockText = findBlock(2018, '第二次攀岩').textContent;
assert(blockText.includes('改成户外攀岩'), '项目方块正面应显示备注');

context.openItemEditor(2018, firstItem.id);
elements.get('deleteButton').click();
assert.strictEqual(context.state.items[2018].length, 0, '删除应移除2018的当前项目');
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[2019][0])), otherYearItemSnapshot, '删除2018不应影响2019');
const emptyYearRow = elements.get('years').children.find((candidate) => candidate.textContent.includes('2018'));
assert.strictEqual(emptyYearRow.children[1].children.length, 1, '没有项目的年份应默认显示一个首个项目方块');

console.log('成长清单行为测试通过：新增、编辑、取消、删除、年份隔离和备注隐藏');

localStorage.data['personal-life-hub-growth-checklist-v1'] = JSON.stringify({
  items: {
    2018: [null, { id: 2, title: '字段缺失' }, { id: 3, date: '2026-01-01', title: '合法项目', note: '备注', extra: true }]
  }
});
context.state = context.loadState();
context.render();
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[2018])), [
  { id: 3, date: '2026-01-01', title: '合法项目', note: '备注' }
], '损坏存储中的非法项目应丢弃并保留合法字段');
console.log('成长清单损坏存储回归测试通过');
