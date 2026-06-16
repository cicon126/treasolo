/**
 * 碰撞检测工具类
 * 提供AABB（轴对齐包围盒）碰撞检测方法
 * 支持单车检测和玩家与多敌车的批量检测
 */
import type { Car, Player, Enemy } from './types';

/**
 * 碰撞检测静态工具类
 * 所有方法均为静态方法，无需实例化
 */
export class Collision {
  /**
   * 两辆车的AABB碰撞检测
   * 基于世界坐标（车道索引 + 深度值）进行检测
   * 考虑伪3D透视缩放，不同深度处的碰撞盒大小不同
   * @param a - 车辆A
   * @param b - 车辆B
   * @returns 是否发生碰撞
   */
  public static checkAABB(a: Car, b: Car): boolean {
    const depthThreshold = 0.08;
    const depthDiff = Math.abs(a.z - b.z);
    if (depthDiff > depthThreshold) return false;

    const avgDepth = (a.z + b.z) / 2;
    const laneWidthA = Collision.getLaneScaleWidth(a, avgDepth);
    const laneWidthB = Collision.getLaneScaleWidth(b, avgDepth);

    const aLaneMin = (a.lane - 1) - laneWidthA / 2;
    const aLaneMax = (a.lane - 1) + laneWidthA / 2;
    const bLaneMin = (b.lane - 1) - laneWidthB / 2;
    const bLaneMax = (b.lane - 1) + laneWidthB / 2;

    if (aLaneMax < bLaneMin || aLaneMin > bLaneMax) return false;

    const heightScale = Collision.getDepthScale(avgDepth);
    const carHeightA = 0.06 * heightScale;
    const carHeightB = 0.06 * heightScale;

    const aDepthMin = a.z - carHeightA;
    const aDepthMax = a.z;
    const bDepthMin = b.z - carHeightB;
    const bDepthMax = b.z;

    if (aDepthMax < bDepthMin || aDepthMin > bDepthMax) return false;

    return true;
  }

  /**
   * 检测玩家与所有敌车的碰撞
   * 遍历所有敌车，返回第一个碰撞的敌车
   * 性能优化：按深度快速过滤不可能碰撞的敌车
   * @param player - 玩家车辆
   * @param enemies - 敌车数组
   * @returns 碰撞的敌车，若无碰撞则返回null
   */
  public static checkPlayerEnemies(player: Player, enemies: Enemy[]): Enemy | null {
    const playerDepth = player.z;
    const playerHeight = 0.06 * Collision.getDepthScale(playerDepth);
    const playerMinZ = playerDepth - playerHeight;
    const playerMaxZ = playerDepth + 0.02;

    for (const enemy of enemies) {
      if (!enemy.active) continue;

      if (enemy.z < playerMinZ - 0.05 || enemy.z > playerMaxZ + 0.05) {
        continue;
      }

      if (Collision.checkPlayerEnemyCollision(player, enemy)) {
        return enemy;
      }
    }

    return null;
  }

  /**
   * 精确的玩家-敌车碰撞检测
   * 考虑玩家车道切换插值，获取玩家实际车道位置
   * @param player - 玩家车辆
   * @param enemy - 敌车
   * @returns 是否碰撞
   */
  private static checkPlayerEnemyCollision(player: Player, enemy: Enemy): boolean {
    const avgDepth = (player.z + enemy.z) / 2;
    const depthThreshold = 0.07 + Collision.getDepthScale(avgDepth) * 0.01;
    const depthDiff = Math.abs(player.z - enemy.z);
    if (depthDiff > depthThreshold) return false;

    const playerLaneValue = Collision.getInterpolatedLane(player);
    const enemyLaneValue = enemy.lane - 1;

    const laneScale = Collision.getLaneScaleWidthAtDepth(avgDepth);
    const playerHalfWidth = 0.30 * laneScale;
    const enemyHalfWidth = 0.32 * laneScale;

    const playerLaneMin = playerLaneValue - playerHalfWidth;
    const playerLaneMax = playerLaneValue + playerHalfWidth;
    const enemyLaneMin = enemyLaneValue - enemyHalfWidth;
    const enemyLaneMax = enemyLaneValue + enemyHalfWidth;

    if (playerLaneMax < enemyLaneMin || playerLaneMin > enemyLaneMax) {
      return false;
    }

    const heightScale = Collision.getDepthScale(avgDepth);
    const playerCarHeight = 0.055 * heightScale;
    const enemyCarHeight = 0.055 * heightScale;

    const playerDepthMin = player.z - playerCarHeight;
    const playerDepthMax = player.z;
    const enemyDepthMin = enemy.z - enemyCarHeight;
    const enemyDepthMax = enemy.z;

    if (playerDepthMax < enemyDepthMin || playerDepthMin > enemyDepthMax) {
      return false;
    }

    return true;
  }

  /**
   * 获取玩家插值后的车道值
   * 支持平滑切换车道时的准确碰撞检测
   * @param player - 玩家车辆
   * @returns 插值后的车道值 (-1~1范围)
   */
  private static getInterpolatedLane(player: Player): number {
    if (player.moveProgress >= 1) {
      return player.lane - 1;
    }

    let fromLane: number;
    if (player.lane === player.targetLane) {
      fromLane = player.lane;
    } else {
      fromLane = player.targetLane > player.lane ? player.lane : player.lane;
    }

    const t = Collision.easeInOutCubic(player.moveProgress);
    const currentLane = fromLane + (player.targetLane - fromLane) * t;
    return currentLane - 1;
  }

  /**
   * 获取车道缩放宽度
   * 基于深度计算单车道在伪3D空间中的相对宽度
   * @param car - 车辆对象（获取其lane属性用于判断）
   * @param depth - 平均深度值
   * @returns 相对宽度值
   */
  private static getLaneScaleWidth(car: Car, depth: number): number {
    const baseWidth = 0.65;
    const scale = Collision.getDepthScale(depth);
    return baseWidth * scale;
  }

  /**
   * 获取指定深度处的车道宽度缩放比例
   * @param depth - 深度值 (0~1)
   * @returns 缩放比例
   */
  private static getLaneScaleWidthAtDepth(depth: number): number {
    const baseScale = Collision.getDepthScale(depth);
    return 0.65 * baseScale;
  }

  /**
   * 深度缩放函数
   * 模拟透视效果：近处大、远处小
   * 使用二次方曲线模拟真实透视衰减
   * @param depth - 深度值 (0=消失点, 1=屏幕底部)
   * @returns 缩放比例
   */
  private static getDepthScale(depth: number): number {
    const clampedDepth = Math.max(0, Math.min(1, depth));
    return 0.05 + clampedDepth * clampedDepth * 0.95;
  }

  /**
   * 缓动函数：三次方缓入缓出
   * 与CarManager中保持一致，确保碰撞检测与渲染使用相同插值
   * @param t - 输入值 (0~1)
   * @returns 缓动后的值
   */
  private static easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * 计算碰撞响应（冲开重叠）
   * 当两辆车发生穿透时，调整敌车位置避免卡死
   * 可选方法，用于需要物理响应的场景
   * @param player - 玩家车辆
   * @param enemy - 碰撞的敌车
   */
  public static resolveCollision(player: Player, enemy: Enemy): void {
    const depthDiff = player.z - enemy.z;

    if (Math.abs(depthDiff) < 0.05) {
      if (player.lane === enemy.lane) {
        enemy.z = Math.max(0, player.z - 0.08);
      }
    }
  }

  /**
   * 检测两辆车是否在碰撞预警范围内
   * 用于提前触发警告效果（如屏幕闪烁、音效提示）
   * @param player - 玩家车辆
   * @param enemy - 敌车
   * @param warningScale - 预警范围缩放系数（默认1.5倍碰撞盒）
   * @returns 是否在预警范围内
   */
  public static isNearCollision(
    player: Player,
    enemy: Enemy,
    warningScale: number = 1.5
  ): boolean {
    if (!enemy.active) return false;

    const avgDepth = (player.z + enemy.z) / 2;
    const depthThreshold = (0.07 + Collision.getDepthScale(avgDepth) * 0.01) * warningScale;
    const depthDiff = Math.abs(player.z - enemy.z);
    if (depthDiff > depthThreshold) return false;

    const playerLaneValue = Collision.getInterpolatedLane(player);
    const enemyLaneValue = enemy.lane - 1;

    const laneScale = Collision.getLaneScaleWidthAtDepth(avgDepth);
    const playerHalfWidth = 0.30 * laneScale * warningScale;
    const enemyHalfWidth = 0.32 * laneScale * warningScale;

    const playerLaneMin = playerLaneValue - playerHalfWidth;
    const playerLaneMax = playerLaneValue + playerHalfWidth;
    const enemyLaneMin = enemyLaneValue - enemyHalfWidth;
    const enemyLaneMax = enemyLaneValue + enemyHalfWidth;

    if (playerLaneMax < enemyLaneMin || playerLaneMin > enemyLaneMax) {
      return false;
    }

    return true;
  }
}
