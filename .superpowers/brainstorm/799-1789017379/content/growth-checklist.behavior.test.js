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
  ['itemModal', new Element('div')],
  ['editorTitle', new Element('h3')],
  ['itemDateInput', new Element('input')],
  ['itemTitleInput', new Element('input')],
  ['itemNoteInput', new Element('textarea')],
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

const context = vm.createContext({
  console,
  Date,
  URLSearchParams,
  localStorage,
  window: { location: { search: '', href: '' } },
  document: {
    getElementById(id) { return elements.get(id); },
    createElement(tagName) { return new Element(tagName); }
  }
});
vm.runInContext(script, context);

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

context.openItemEditor(1997, null);
setEditor('2024-01-02', '第一次攀岩', '完成了第一次室内攀岩');
saveEditor();
const firstItem = context.state.items[1997][0];
const firstItemSnapshot = JSON.parse(JSON.stringify(firstItem));
assert.deepStrictEqual({ date: firstItem.date, title: firstItem.title, note: firstItem.note }, {
  date: '2024-01-02', title: '第一次攀岩', note: '完成了第一次室内攀岩'
}, '1997 应保存新项目的日期、标题和备注');

context.openItemEditor(1998, null);
setEditor('2025-03-04', '学习潜水', '拿到证书');
saveEditor();
const otherYearItem = context.state.items[1998][0];
const otherYearItemSnapshot = JSON.parse(JSON.stringify(otherYearItem));

context.openItemEditor(1997, firstItem.id);
setEditor('2024-02-03', '第二次攀岩', '改成户外攀岩');
elements.get('cancelButton').click();
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[1997][0])), firstItemSnapshot, '取消编辑不应改变原项目');

context.openItemEditor(1997, firstItem.id);
setEditor('2024-02-03', '第二次攀岩', '改成户外攀岩');
saveEditor();
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[1997][0])), {
  id: firstItem.id, date: '2024-02-03', title: '第二次攀岩', note: '改成户外攀岩'
}, '编辑应只更新当前年份的项目');
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[1998][0])), otherYearItemSnapshot, '编辑1997不应影响1998');

const blockText = findBlock(1997, '第二次攀岩').textContent;
assert(!blockText.includes('改成户外攀岩'), '项目方块正面不应显示备注');

context.openItemEditor(1997, firstItem.id);
elements.get('deleteButton').click();
assert.strictEqual(context.state.items[1997].length, 0, '删除应移除1997的当前项目');
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.state.items[1998][0])), otherYearItemSnapshot, '删除1997不应影响1998');

console.log('成长清单行为测试通过：新增、编辑、取消、删除、年份隔离和备注隐藏');
