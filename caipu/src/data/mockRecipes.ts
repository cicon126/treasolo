import { Recipe } from '@/types/recipe';

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: '麻婆豆腐',
    category: '川菜',
    image: 'https://picsum.photos/id/292/400/300',
    ingredients: ['豆腐 400g', '牛肉末 100g', '豆瓣酱 2勺', '花椒粉 1勺', '葱姜蒜适量'],
    steps: [
      '豆腐切成小块，放入加盐的开水中焯水2分钟捞出',
      '锅中放油，下入牛肉末炒至变色',
      '加入豆瓣酱炒出红油，加入葱姜蒜爆香',
      '加入适量清水，放入豆腐块，小火炖煮5分钟',
      '勾芡，出锅前撒上花椒粉和葱花'
    ],
    remark: '麻辣鲜香，下饭神器',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5
  },
  {
    id: '2',
    name: '白切鸡',
    category: '粤菜',
    image: 'https://picsum.photos/id/312/400/300',
    ingredients: ['三黄鸡 1只', '姜 50g', '葱 3根', '料酒 2勺', '盐适量'],
    steps: [
      '鸡清洗干净，姜切片，葱打结',
      '锅中加水烧开，放入鸡、姜片、葱结、料酒',
      '小火浸煮20分钟，期间将鸡提起3次让腔内换水',
      '煮好后捞出放入冰水中浸泡10分钟',
      '斩块装盘，配上姜葱蘸料'
    ],
    remark: '皮爽肉滑，原汁原味',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4
  },
  {
    id: '3',
    name: '红烧狮子头',
    category: '苏菜',
    image: 'https://picsum.photos/id/326/400/300',
    ingredients: ['五花肉 500g', '马蹄 100g', '鸡蛋 1个', '葱姜适量', '老抽 1勺'],
    steps: [
      '五花肉剁成肉末，马蹄切碎',
      '肉末中加入马蹄、鸡蛋、葱姜末、盐、料酒，顺时针搅拌上劲',
      '将肉馅分成四份，搓成大肉圆',
      '锅中放油，将肉圆煎至两面金黄',
      '加入清水、老抽、冰糖，小火炖煮40分钟',
      '大火收汁即可出锅'
    ],
    remark: '肥而不腻，入口即化',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3
  },
  {
    id: '4',
    name: '糖醋里脊',
    category: '鲁菜',
    image: 'https://picsum.photos/id/401/400/300',
    ingredients: ['猪里脊肉 300g', '淀粉 50g', '番茄酱 3勺', '白糖 2勺', '白醋 1勺'],
    steps: [
      '里脊肉切成条状，加盐、料酒腌制15分钟',
      '淀粉加水调成糊，将肉条挂糊',
      '锅中油温六成热，下入肉条炸至金黄捞出',
      '油温升至八成热，复炸一次捞出',
      '锅中留底油，加入番茄酱、白糖、白醋调成酱汁',
      '倒入炸好的肉条，翻炒均匀即可'
    ],
    remark: '酸甜可口，外酥里嫩',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    id: '5',
    name: '东坡肉',
    category: '浙菜',
    image: 'https://picsum.photos/id/431/400/300',
    ingredients: ['五花肉 800g', '黄酒 200ml', '酱油 100ml', '冰糖 50g', '葱结姜片适量'],
    steps: [
      '五花肉切成4cm见方的块，冷水下锅焯水',
      '砂锅底部铺上竹垫和葱结、姜片',
      '肉块皮朝下摆入锅中，加入黄酒、酱油、冰糖',
      '大火烧开后转最小火，慢炖2小时',
      '将肉块取出，皮朝上摆入碗中，蒸30分钟',
      '扣入盘中，淋上原汁即可'
    ],
    remark: '色泽红亮，肥而不腻',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: '6',
    name: '佛跳墙',
    category: '闽菜',
    image: 'https://picsum.photos/id/570/400/300',
    ingredients: ['鲍鱼 4只', '海参 2条', '鱼翅 50g', '鸽子蛋 6个', '母鸡 半只'],
    steps: [
      '所有干货提前泡发好，母鸡焯水后熬汤',
      '将各种食材分别焯水去腥',
      '按层次将食材摆入坛中，倒入鸡汤',
      '荷叶封口，大火烧开后转小火煨炖4小时',
      '开封后即可享用'
    ],
    remark: '坛启荤香飘四邻，佛闻弃禅跳墙来',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '7',
    name: '剁椒鱼头',
    category: '湘菜',
    image: 'https://picsum.photos/id/580/400/300',
    ingredients: ['胖头鱼头 1个', '剁椒 150g', '姜蒜适量', '蒸鱼豉油 2勺', '葱花适量'],
    steps: [
      '鱼头处理干净，从中间剖开，抹上盐和料酒腌制20分钟',
      '姜蒜切末，与剁椒混合均匀',
      '将剁椒铺在鱼头上',
      '水开后上锅大火蒸15分钟',
      '取出淋上蒸鱼豉油，撒上葱花',
      '烧热油浇在葱花上即可'
    ],
    remark: '鲜嫩辣爽，风味独特',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000
  },
  {
    id: '8',
    name: '臭鳜鱼',
    category: '徽菜',
    image: 'https://picsum.photos/id/625/400/300',
    ingredients: ['臭鳜鱼 1条', '五花肉末 100g', '笋片 50g', '葱姜蒜适量', '老抽 1勺'],
    steps: [
      '臭鳜鱼洗净沥干，在鱼身上划几刀',
      '锅中放油，将鱼煎至两面金黄捞出',
      '锅中留底油，下入五花肉末炒香',
      '加入笋片、葱姜蒜爆香',
      '加入适量清水，放入鱼，小火炖煮15分钟',
      '大火收汁即可出锅'
    ],
    remark: '闻着臭吃着香，肉质紧实',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000
  }
];
