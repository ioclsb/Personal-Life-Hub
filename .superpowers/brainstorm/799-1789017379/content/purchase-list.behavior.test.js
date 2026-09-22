const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync(__dirname + '/wood-kitchen-template.html', 'utf8');

assert.doesNotMatch(source, /function setPurchaseChecked\(checked\)[\s\S]{0,420}saveState\(\)/, '全选不应在点击确定前保存');
assert.match(source, /function openPurchaseList\(\)[\s\S]{0,260}openPurchaseDraft/, '打开采购清单应建立临时编辑状态');
assert.match(source, /function closePurchaseList\(\)[\s\S]{0,260}restorePurchaseDraft/, '未点击确定关闭时应撤销采购清单修改');
assert.match(source, /function confirmPurchaseList\(\)[\s\S]{0,180}saveState\(\)[\s\S]{0,100}closePurchaseList/, '确定按钮应保存采购清单修改后关闭');
assert.match(source, /pageType === 'travel'[\s\S]{0,120}statIds\('new'\)/, '旅行计划应统计当前月份足迹而不是需添置');
assert.match(source, /计划出行/, '旅行计划列表标题应使用计划出行');
assert.match(source, /勾选[\s\S]{0,80}城市[\s\S]{0,80}备注[\s\S]{0,80}所属省份/, '旅行计划列表应显示勾选、城市、备注、所属省份');
assert.match(source, /travelPlanNotes/, '旅行计划应使用独立备注数据');
assert.match(source, /travelPlanChecked/, '旅行计划应使用独立勾选数据');
assert.match(source, /travelPlanCleared/, '旅行计划应使用独立清空数据');
assert.match(source, /var sourceIds = isTravel \? statIds\('new'\) : statIds\('need'\)/, '旅行计划不应读取需添置数据');

console.log('采购清单未确认保存约束通过');
