const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('wood-kitchen-template.html', 'utf8');
const parentSource = fs.readFileSync('wood-rename.html', 'utf8');

assert.match(parentSource, /sub2e:\s*'wood-kitchen-template\.html\?type=travel&return=sub2e'/, '旅行标记应进入旅行数据页面');
assert.match(source, /travel:\s*\{[\s\S]{0,500}storageKey:\s*'personal-life-hub-travel-v1'/, '旅行页面应使用独立存储键');
assert.match(source, /var travelProvinceRecords\s*=\s*\{[\s\S]{0,2000}'北京市'\s*:/, '旅行页面应维护省级行政区到城市的映射');

const provinceNames = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
  '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省',
  '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区',
  '香港特别行政区', '澳门特别行政区', '台湾省'
];
provinceNames.forEach(function(name) {
  assert.match(source, new RegExp("['\\\"]" + name + "['\\\"]"), '旅行页面应包含' + name + '序列');
});

assert.match(source, /function travelRecordsForProvince[\s\S]{0,300}record\.category === province/, '点击省级序列时应筛选对应城市');
assert.match(source, /pageType === 'travel'[\s\S]{0,500}travelRecordsForProvince/, '旅行页面右侧应显示当前省份城市');
assert.match(source, /\.sidebar\s*\{[^}]*min-height:\s*0[^}]*overflow:\s*hidden/, '左侧省份序列容器应限制高度');
assert.match(source, /#categories\s*\{[^}]*flex:\s*1[^}]*overflow-y:\s*auto/, '左侧省份序列应支持纵向滚动');
assert.match(source, /\.category-add\s*\{[^}]*flex-shrink:\s*0/, '新增序列按钮应固定在滚动区域底部');
assert.match(source, /function statTitle\(stat\)[\s\S]{0,260}pageType === 'travel'[\s\S]{0,260}currentMonthChineseName\(\) \+ '足迹'/, '旅行标记第二个方块应显示当前月份足迹');
assert.match(source, /function statTitle\(stat\)[\s\S]{0,500}首次踏足[\s\S]{0,180}多次踏足/, '旅行标记第三和第四个方块应显示踏足次数简介');
assert.match(source, /<span id="editNewLabel">新增<\/span>/, '项目编辑框应有可单独更新的新增状态名称');
assert.match(source, /pageType === 'travel'[\s\S]{0,500}editNewLabel[\s\S]{0,220}currentMonthChineseName\(\) \+ '足迹'/, '旅行项目编辑框应显示当前月份足迹');
assert.match(source, /travel-editor[\s\S]{0,300}justify-content:\s*flex-start/, '旅行项目编辑框勾选项应统一左对齐');
assert.match(source, /travel-editor[\s\S]{0,700}compact[\s\S]{0,300}font-size/, '旅行项目编辑框文字过长时应缩小内部内容');
assert.match(source, /pageType === 'travel'[\s\S]{0,260}statIds\('new'\)[\s\S]{0,180}discarded-item/, '旅行项目勾选当月足迹时应显示红色虚线外框');
assert.match(source, /travel-first-item\s*\{[^}]*background-color:/, '旅行项目首次踏足应使用中间深度底色');
assert.match(source, /pageType === 'travel'[\s\S]{0,420}statIds\('discarded'\)[\s\S]{0,180}travel-first-item/, '旅行项目勾选首次踏足时应使用中间深度底色');
assert.match(source, /function categoryTravelClass\(category\)[\s\S]{0,450}statIds\('need'\)[\s\S]{0,260}need-category[\s\S]{0,260}statIds\('discarded'\)[\s\S]{0,220}travel-first-category/, '旅行序列方块应按多次踏足优先、首次踏足其次联动底色');
assert.match(source, /\.category\.travel-first-category\s*\{[^}]*background-color:/, '旅行首次踏足序列方块应使用中间深度底色');
assert.match(source, /\.travel-items\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(/, '旅行项目方块应使用自适应网格容纳较长名称');
assert.match(source, /\.travel-items \.item-name\s*\{[^}]*white-space:\s*normal[^}]*text-overflow:\s*clip/, '旅行项目名称不应被单行省略截断');
assert.match(source, /items\.classList\.toggle\('travel-items',\s*pageType === 'travel'\)/, '自适应项目网格只能应用于旅行标记');
assert.match(source, /\['月份', '省份', '城市', '城市信息'\]/, '旅行年度明细应使用四个简短标题');
assert.match(source, /travelAnnualDetail|省份数量|城市数量/, '旅行年度明细应包含旅行统计逻辑');
assert.match(source, /travelAnnualDetail[\s\S]{0,500}newAssignmentsByMonth/, '旅行年度明细统计应来源于各月份足迹数据');
assert.match(source, /\.travel-annual-table\s*\{[^}]*grid-template-columns:\s*44px\s+44px\s+44px\s+minmax\(160px/, '旅行年度明细应收窄省份和城市并扩大城市信息列');
assert.match(source, /travelOverviewButton/, '旅行主题应提供足迹概览按钮');
assert.match(source, /年度明细/, '旅行顶部应显示年度明细');
assert.match(source, /足迹概览/, '旅行顶部应显示足迹概览');
assert.match(source, /计划出行/, '旅行顶部应显示计划出行');
assert.match(source, /function travelFootprintOverview/, '旅行主题应提供足迹概览统计函数');
assert.match(source, /travelFootprintOverview[\s\S]{0,700}statAssignments\.discarded[\s\S]{0,700}statAssignments\.need/, '足迹概览应统计首次踏足和多次踏足');
assert.match(source, /travelFootprintHistory/, '旅行足迹概览应保存重复访问日期备注');
assert.match(source, /id="travelOverviewModal"/, '足迹概览应使用独立弹窗');

console.log('旅行标记省份与城市数据约束通过');
