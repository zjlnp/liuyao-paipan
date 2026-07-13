// ===== 六爻装卦引擎 v1.0 — 京房八宫纳甲法 =====
// 参考《增删卜易》《卜筮正宗》装卦方法

const TIAN_GAN = '甲乙丙丁戊己庚辛壬癸';
const DI_ZHI = '子丑寅卯辰巳午未申酉戌亥';

// ===== 纳甲表：按上下卦分别纳甲 (京房八宫纳甲法) =====
// 内卦纳甲（初爻/二爻/三爻）
const NAJIA_NEI = {
  '乾': ['甲子','甲寅','甲辰'],
  '坎': ['戊寅','戊辰','戊午'],
  '艮': ['丙辰','丙午','丙申'],
  '震': ['庚子','庚寅','庚辰'],
  '巽': ['辛丑','辛亥','辛酉'],
  '离': ['己卯','己丑','己亥'],
  '坤': ['乙未','乙巳','乙卯'],
  '兑': ['丁巳','丁卯','丁丑'],
};
// 外卦纳甲（四爻/五爻/上爻）
const NAJIA_WAI = {
  '乾': ['壬午','壬申','壬戌'],
  '坎': ['戊申','戊戌','戊子'],
  '艮': ['丙戌','丙子','丙寅'],
  '震': ['庚午','庚申','庚戌'],
  '巽': ['辛未','辛巳','辛卯'],
  '离': ['己酉','己未','己巳'],
  '坤': ['癸丑','癸亥','癸酉'],
  '兑': ['丁亥','丁酉','丁未'],
};

// 上下卦相同的八纯卦纳甲（用于伏神计算）
const NAJIA_BAGONG = {
  '乾': ['甲子','甲寅','甲辰','壬午','壬申','壬戌'],
  '坤': ['乙未','乙巳','乙卯','癸丑','癸亥','癸酉'],
  '震': ['庚子','庚寅','庚辰','庚午','庚申','庚戌'],
  '巽': ['辛丑','辛亥','辛酉','辛未','辛巳','辛卯'],
  '坎': ['戊寅','戊辰','戊午','戊申','戊戌','戊子'],
  '离': ['己卯','己丑','己亥','己酉','己未','己巳'],
  '艮': ['丙辰','丙午','丙申','丙戌','丙子','丙寅'],
  '兑': ['丁巳','丁卯','丁丑','丁亥','丁酉','丁未'],
};

// ===== 八宫首卦ID映射 =====
const PALACE_SHOU_GUA = {
  '乾宫': 1,   // 乾为天
  '坤宫': 2,   // 坤为地
  '震宫': 51,  // 震为雷
  '巽宫': 57,  // 巽为风
  '坎宫': 29,  // 坎为水
  '离宫': 30,  // 离为火
  '艮宫': 52,  // 艮为山
  '兑宫': 58,  // 兑为泽
};

// ===== 宫名到八纯卦名（纳甲key）=====
const PALACE_TO_GUA_NAME = {
  '乾宫': '乾', '坤宫': '坤', '震宫': '震', '巽宫': '巽',
  '坎宫': '坎', '离宫': '离', '艮宫': '艮', '兑宫': '兑',
};

// ===== 地支五行 =====
const DIZHI_WUXING = {
  '子':'水','丑':'土','寅':'木','卯':'木',
  '辰':'土','巳':'火','午':'火','未':'土',
  '申':'金','酉':'金','戌':'土','亥':'水',
};

// ===== 八卦五行 =====
const BAGUA_WUXING = {
  '乾':'金','兑':'金',
  '震':'木','巽':'木',
  '坎':'水','离':'火',
  '坤':'土','艮':'土',
};

// ===== 六兽 =====
const LIU_SHOU = ['青龙','朱雀','勾陈','腾蛇','白虎','玄武'];

// 日干起六兽初爻
const LIUSHOU_START = {
  '甲':0,'乙':0,
  '丙':1,'丁':1,
  '戊':2,
  '己':3,
  '庚':4,'辛':4,
  '壬':5,'癸':5,
};

// ===== 六亲 =====
const LIU_QIN = ['父母','兄弟','官鬼','妻财','子孙'];

/**
 * 五行生克 → 六亲
 * @param {string} gongWuxing - 卦宫五行
 * @param {string} yaoWuxing - 爻地支五行
 * @returns {string} 六亲名称
 */
function getLiuQin(gongWuxing, yaoWuxing) {
  // 五行生序: 木→火→土→金→水→木
  const SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
  // 五行克序: 木→土→水→火→金→木
  const KE = { '木':'土','土':'水','水':'火','火':'金','金':'木' };

  if (yaoWuxing === gongWuxing) return '兄弟';
  if (SHENG[yaoWuxing] === gongWuxing) return '父母';  // 生我者父母
  if (SHENG[gongWuxing] === yaoWuxing) return '子孙';  // 我生者子孙
  if (KE[yaoWuxing] === gongWuxing) return '官鬼';     // 克我者官鬼
  if (KE[gongWuxing] === yaoWuxing) return '妻财';     // 我克者妻财
  return '?';
}

/**
 * 从纳甲干支字符串中提取地支
 * @param {string} nazhi - e.g. "甲子"
 * @returns {string} 地支 e.g. "子"
 */
function getDiZhi(nazhi) {
  return nazhi.charAt(1);
}

/**
 * 获取卦宫五行
 * @param {string} palaceName - e.g. "乾宫"
 * @returns {string} 五行
 */
function getGongWuxing(palaceName) {
  const guaName = PALACE_TO_GUA_NAME[palaceName];
  return BAGUA_WUXING[guaName] || '?';
}

/**
 * 完整的六爻装卦
 * @param {Object} hexagram - 卦象数据（含 bagong）
 * @param {Object} gzData - 干支历法数据（含日干日支月支）
 * @param {Object} hexagramData - 全部卦象数据（用于查本宫卦）
 * @returns {Object} 装卦结果
 */
function installZhuangGua(hexagram, gzData, hexagramData) {
  if (!hexagram || !hexagram.bagong) return null;

  const palace = hexagram.bagong.palace;        // e.g. "乾宫"
  // 变卦六亲随本卦宫五行：用 parentPalace 计算六亲
  const liuqinPalace = hexagram.parentPalace || palace;
  const guaName = PALACE_TO_GUA_NAME[liuqinPalace];
  const gongWuxing = BAGUA_WUXING[guaName];     // e.g. "金"
  const shiYao = hexagram.bagong.shiyao;        // 世爻位置
  const yingYao = hexagram.bagong.yingyao;      // 应爻位置

  // 按上下卦分别取纳甲（口诀：乾金甲子外壬午...）
  const upper = hexagram.upper || '';  // 上卦名 e.g. "巽"
  const lower = hexagram.lower || '';  // 下卦名 e.g. "离"
  const neiArr = NAJIA_NEI[lower];     // 内卦纳甲: 初爻/二爻/三爻
  const waiArr = NAJIA_WAI[upper];     // 外卦纳甲: 四爻/五爻/上爻
  if (!neiArr || !waiArr) return null;

  const lines = hexagram.lines || [];
  const linesDisplay = hexagram.lines_display || [];

  // 本宫卦数据（用于伏神）
  const benGongId = PALACE_SHOU_GUA[palace];
  const benGongGua = hexagramData ? hexagramData[benGongId] : null;
  const benGongNajia = benGongGua ? NAJIA_BAGONG[PALACE_TO_GUA_NAME[benGongGua.bagong.palace]] : null;

  // 计算本宫卦的六亲（用于伏神）
  let benGongLiuqin = [];
  if (benGongGua && benGongGua.lines && benGongNajia) {
    benGongLiuqin = benGongNajia.map(nz => {
      const dz = getDiZhi(nz);
      const wx = DIZHI_WUXING[dz];
      return getLiuQin(gongWuxing, wx);
    });
  }

  // 装每一爻
  const yaoList = [];
  const liuqinSet = new Set();

  for (let i = 0; i < 6; i++) {
    const pos = i + 1;
    // 内卦(初二三)取 neiArr，外卦(四五上)取 waiArr
    const nazhi = i < 3 ? neiArr[i] : waiArr[i - 3];
    const dizhi = getDiZhi(nazhi);
    const yaoWuxing = DIZHI_WUXING[dizhi];
    const liuqin = getLiuQin(gongWuxing, yaoWuxing);

    liuqinSet.add(liuqin);

    const lineInfo = linesDisplay.find(l => l.position === pos) || {};

    yaoList.push({
      position: pos,
      name: lineInfo.name || getYaoNameLocal(lines[i], pos),
      isYang: lines[i],
      isChanging: lineInfo.isChanging || false,
      isChanged: lineInfo.isChanged || false,
      nazhi: nazhi,           // 纳甲干支
      dizhi: dizhi,           // 地支
      wuxing: yaoWuxing,      // 爻五行
      liuqin: liuqin,         // 六亲
      isShi: pos === shiYao,
      isYing: pos === yingYao,
      originalValue: lineInfo.originalValue,
    });
  }

  // 装六兽（基于日干）
  const dayGan = gzData ? gzData.day.g : '甲';
  const liushouStart = LIUSHOU_START[dayGan] !== undefined ? LIUSHOU_START[dayGan] : 0;
  for (let i = 0; i < 6; i++) {
    const idx = (liushouStart + i) % 6;
    yaoList[i].liushou = LIU_SHOU[idx];
  }

  // 找伏神：当前卦缺失的六亲，从本宫卦找
  const missingLiuqin = LIU_QIN.filter(lq => !liuqinSet.has(lq));
  const fushenList = [];

  if (missingLiuqin.length > 0 && benGongLiuqin.length > 0) {
    for (let i = 0; i < 6; i++) {
      const benLq = benGongLiuqin[i];
      const curLq = yaoList[i].liuqin;
      // 如果本宫卦此爻的六亲是当前卦缺失的，且与本卦六亲不同
      if (missingLiuqin.includes(benLq) && benLq !== curLq) {
        const benNz = benGongNajia[i];
        const benDz = getDiZhi(benNz);
        fushenList.push({
          position: i + 1,
          fushenNazhi: benNz,
          fushenLiuqin: benLq,
          fushenWuxing: DIZHI_WUXING[benDz],
          feishenNazhi: yaoList[i].nazhi,
          feishenLiuqin: curLq,
        });
      }
    }
  }

  // 月建日辰
  const yueJian = gzData ? gzData.month.z : '子';   // 月支
  const riChen = gzData ? gzData.day.z : '子';       // 日支

  return {
    palace: palace,
    gongWuxing: gongWuxing,
    shiYao: shiYao,
    yingYao: yingYao,
    yaoList: yaoList,           // 6爻装卦结果
    liushou: LIU_SHOU,          // 六兽列表
    fushen: fushenList,         // 伏神列表
    missingLiuqin: missingLiuqin, // 缺失的六亲
    yueJian: yueJian,           // 月建
    riChen: riChen,             // 日辰
    yueJianWuxing: DIZHI_WUXING[yueJian],
    riChenWuxing: DIZHI_WUXING[riChen],
    dayGan: gzData ? gzData.day.g : '甲',
    dayGanZhi: gzData ? (gzData.day.g + gzData.day.z) : '甲子',
  };
}

/**
 * 获取爻名
 */
function getYaoNameLocal(isYang, pos) {
  const yao = isYang ? '九' : '六';
  if (pos === 1) return '初' + yao;
  if (pos === 6) return '上' + yao;
  const names = { 2: '二', 3: '三', 4: '四', 5: '五' };
  return yao + names[pos];
}

/**
 * 六亲颜色映射
 */
function getLiuqinColor(liuqin) {
  const colors = {
    '父母': '#4a90d9',  // 蓝
    '兄弟': '#e8873a',  // 橙
    '官鬼': '#c44536',  // 红
    '妻财': '#4a9e6e',  // 绿
    '子孙': '#8b5cf6',  // 紫
  };
  return colors[liuqin] || '#999';
}

/**
 * 六亲emoji
 */
function getLiuqinEmoji(liuqin) {
  const emoji = {
    '父母': '👨‍👩‍👧',
    '兄弟': '👥',
    '官鬼': '👮',
    '妻财': '💰',
    '子孙': '👶',
  };
  return emoji[liuqin] || '';
}

// ===== 月建日辰对爻的作用判断 =====
/**
 * 月建对地支的作用
 * 旺相休囚死 + 月破
 */
function yueJianEffect(yueZhi, yaoZhi) {
  const wx = DIZHI_WUXING[yueZhi];
  const yaoWx = DIZHI_WUXING[yaoZhi];
  const SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
  const KE = { '木':'土','土':'水','水':'火','火':'金','金':'木' };

  // 月建是寅卯(木) → 木旺、火相、土死、金囚、水休
  // 当月支五行 == 爻五行 → 旺
  if (yaoWx === wx) return '旺';
  // 月支五行生爻五行 → 相
  if (SHENG[wx] === yaoWx) return '相';
  // 爻五行生月支五行 → 休
  if (SHENG[yaoWx] === wx) return '休';
  // 爻五行克月支五行 → 囚
  if (KE[yaoWx] === wx) return '囚';
  // 月支五行克爻五行 → 死
  if (KE[wx] === yaoWx) return '死';
  return '?';
}

/**
 * 日辰对地支的作用
 * 暗动、日破等
 */
function riChenEffect(riZhi, yaoZhi) {
  const riWx = DIZHI_WUXING[riZhi];
  const yaoWx = DIZHI_WUXING[yaoZhi];
  const SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
  const KE = { '木':'土','土':'水','水':'火','火':'金','金':'木' };

  if (yaoWx === riWx) return '临';
  if (SHENG[riWx] === yaoWx) return '生';
  if (SHENG[yaoWx] === riWx) return '泄';
  if (KE[yaoWx] === riWx) return '囚';
  if (KE[riWx] === yaoWx) return '克';
  return '?';
}

/**
 * 卦身地支：世爻地支的冲支（六冲配对）
 * 子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲
 * 例：世爻丑 → 卦身未
 */
function getGuaShen(shiDizhi) {
  var chongMap = {'子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳'};
  return chongMap[shiDizhi] || '?';
}

/**
 * 世身地支：即世爻本身的地支
 * 例：世爻丑 → 世身丑
 */
function getShiShen(shiDizhi) {
  return shiDizhi;
}

/**
 * 卦身位置（子午持世身居初...）
 */
function getGuaShenPos(shiDizhi) {
  var map = {'子':1,'午':1,'丑':2,'未':2,'寅':3,'申':3,'卯':4,'酉':4,'辰':5,'戌':5,'巳':6,'亥':6};
  return map[shiDizhi] || 0;
}

/**
 * 神煞（以日支起）
 */
function getShenSha(riZhi, dayGan) {
  var result = [];
  // 驿马：申子辰在寅，巳酉丑在亥，寅午戌在申，亥卯未在巳
  var yimaMap = {申:'寅',子:'寅',辰:'寅',巳:'亥',酉:'亥',丑:'亥',寅:'申',午:'申',戌:'申',亥:'巳',卯:'巳',未:'巳'};
  result.push({label:'驿马', value:yimaMap[riZhi] || '?', cls:'shensha-yima'});
  // 咸池(桃花)：申子辰在酉，巳酉丑在午，寅午戌在卯，亥卯未在子
  var xcMap = {申:'酉',子:'酉',辰:'酉',巳:'午',酉:'午',丑:'午',寅:'卯',午:'卯',戌:'卯',亥:'子',卯:'子',未:'子'};
  result.push({label:'桃花', value:xcMap[riZhi] || '?', cls:'shensha-taohua'});
  // 贵人：甲戊庚→丑未，乙己→子申，丙丁→亥酉，壬癸→卯巳，辛→午寅
  var grMap = {甲:'丑未',戊:'丑未',庚:'丑未',乙:'子申',己:'子申',丙:'亥酉',丁:'亥酉',壬:'卯巳',癸:'卯巳',辛:'午寅'};
  result.push({label:'贵人', value:grMap[dayGan] || '?', cls:'shensha-guiren'});
  return result;
}

// 暴露到全局
window.ZhuangGua = {
  installZhuangGua,
  getLiuqinColor,
  getLiuqinEmoji,
  yueJianEffect,
  riChenEffect,
  getGuaShen,
  getShiShen,
  getGuaShenPos,
  getShenSha,
  DIZHI_WUXING,
  BAGUA_WUXING,
  LIU_SHOU,
};
