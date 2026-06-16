/**
 * 游戏核心类型定义
 * 包含车辆、玩家、敌人、粒子、游戏状态等所有核心数据结构
 */

/**
 * 游戏状态枚举
 * - menu: 主菜单
 * - countdown: 倒计时阶段
 * - playing: 游戏进行中
 * - paused: 游戏暂停
 * - gameover: 游戏结束
 */
export type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover';

/**
 * 基础车辆接口
 * 包含所有车辆共有的属性
 * @property x - 车辆中心X坐标（世界坐标）
 * @property y - 车辆中心Y坐标（世界坐标，用于深度排序）
 * @property width - 车辆宽度
 * @property height - 车辆长度（高度方向）
 * @property lane - 当前所在车道索引 (0=左, 1=中, 2=右)
 * @property color - 车身颜色（十六进制字符串）
 * @property speed - 车辆当前速度（像素/秒）
 * @property z - 深度值，用于伪3D透视投影（距离相机越近值越大）
 * @property active - 车辆是否激活（在场景中可见并参与碰撞）
 */
export interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  color: string;
  speed: number;
  z: number;
  active: boolean;
}

/**
 * 玩家车辆接口
 * 扩展基础车辆，添加玩家特有的属性
 * @property targetLane - 目标车道索引（用于平滑切换车道）
 * @property moveProgress - 车道切换进度 (0~1，0=在原车道，1=到达目标车道)
 * @property trail - 尾迹点数组，存储历史位置用于绘制尾焰轨迹
 */
export interface Player extends Car {
  targetLane: number;
  moveProgress: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

/**
 * 敌人车辆接口
 * 扩展基础车辆，目前结构与Car相同，预留扩展空间
 * 未来可添加：类型、AI行为、奖励分数等
 */
export interface Enemy extends Car {
  // 敌人车辆特定属性预留
}

/**
 * 粒子接口
 * 用于尾焰、爆炸等视觉效果
 * @property x - 粒子X坐标（屏幕坐标）
 * @property y - 粒子Y坐标（屏幕坐标）
 * @property vx - X方向速度（像素/秒）
 * @property vy - Y方向速度（像素/秒）
 * @property life - 粒子剩余生命周期（秒）
 * @property maxLife - 粒子最大生命周期（秒）
 * @property color - 粒子颜色（十六进制或rgba字符串）
 * @property size - 粒子半径（像素）
 * @property alpha - 粒子透明度 (0~1)
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
}

/**
 * 游戏统计数据
 * 记录当前游戏的关键指标
 * @property score - 当前得分
 * @property highScore - 历史最高分（持久化存储）
 * @property speed - 当前游戏速度倍率，影响道路流动和敌车生成
 * @property level - 当前游戏等级，随时间/分数提升
 * @property time - 游戏进行时间（秒）
 */
export interface GameStats {
  score: number;
  highScore: number;
  speed: number;
  level: number;
  time: number;
}
