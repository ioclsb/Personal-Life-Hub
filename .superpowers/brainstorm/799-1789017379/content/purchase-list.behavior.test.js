const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync(__dirname + '/wood-kitchen-template.html', 'utf8');

assert.doesNotMatch(source, /function setPurchaseChecked\(checked\)[\s\S]{0,420}saveState\(\)/, '全选不应在点击确定前保存');
assert.match(source, /function openPurchaseList\(\)[\s\S]{0,260}openPurchaseDraft/, '打开采购清单应建立临时编辑状态');
assert.match(source, /function closePurchaseList\(\)[\s\S]{0,260}restorePurchaseDraft/, '未点击确定关闭时应撤销采购清单修改');
assert.match(source, /function confirmPurchaseList\(\)[\s\S]{0,180}saveState\(\)[\s\S]{0,100}closePurchaseList/, '确定按钮应保存采购清单修改后关闭');

console.log('采购清单未确认保存约束通过');
