/**
 * 车辆管理器
 * 负责管理玩家车辆和敌车的创建、更新、渲染和对象池管理
 * 实现车道平滑切换、敌车随机生成与间距检查
 */
import type { Player, Enemy, Car } from './types';
import { RoadRenderer } from './RoadRenderer';

/**
 * 车辆管理器类
 * 管理所有车辆的生命周期和渲染逻辑
 */
export class CarManager {
  /** 玩家车辆实例 */
  public player: Player;
  /** 敌车对象池数组 */
  public enemies: Enemy[];
  /** 对象池最大容量 */
  private maxEnemies: number = 20;
  /** 敌车生成最小间距（深度方向） */
  private minSpawnDistance: number = 0.18;
  /** 敌车颜色池，随机选取 */
  private enemyColors: string[] = [
    '#ff4444', '#ff8844', '#ffcc44', '#44ff44',
    '#44ffff', '#4488ff', '#8844ff', '#ff44ff',
    '#ff6666', '#66ffcc', '#cc66ff', '#ffaa33'
  ];
  /** 车道切换动画速度（越大越快） */
  private laneChangeSpeed: number = 6;

  /**
   * 构造函数
   * 初始化玩家车辆和敌车对象池
   */
  constructor() {
    this.player = this.createDefaultPlayer();
    this.enemies = this.initEnemyPool();
  }

  /**
   * 创建默认玩家车辆
   * @returns 初始化的玩家车辆对象
   */
  private createDefaultPlayer(): Player {
    return {
      x: 0,
      y: 0,
      width: 60,
      height: 100,
      lane: 1,
      targetLane: 1,
      moveProgress: 1,
      color: '#00ddff',
      speed: 0,
      z: 0.85,
      active: true,
      trail: []
    };
  }

  /**
   * 初始化敌车对象池
   * 预创建指定数量的敌车对象，设置为非激活状态
   * @returns 敌车对象数组
   */
  private initEnemyPool(): Enemy[] {
    const pool: Enemy[] = [];
    for (let i = 0; i < this.maxEnemies; i++) {
      pool.push({
        x: 0,
        y: 0,
        width: 60,
        height: 100,
        lane: 0,
        color: '#ffffff',
        speed: 0,
        z: 0,
        active: false
      });
    }
    return pool;
  }

  /**
   * 初始化/重置玩家车辆到初始状态
   * 将玩家放置在中间车道，清除尾迹
   */
  public initPlayer(): void {
    this.player = this.createDefaultPlayer();
  }

  /**
   * 请求玩家切换车道
   * @param direction - 切换方向：-1=向左，1=向右
   */
  public changeLane(direction: -1 | 1): void {
    const newLane = this.player.targetLane + direction;
    if (newLane >= 0 && newLane <= 2) {
      this.player.targetLane = newLane;
      if (this.player.moveProgress >= 1) {
        this.player.moveProgress = 0;
      }
    }
  }

  /**
   * 生成一辆敌车
   * 随机选择车道，检查间距避免重叠
   * @param gameSpeed - 当前游戏速度倍率
   * @returns 是否成功生成
   */
  public spawnEnemy(gameSpeed: number): boolean {
    const inactiveEnemy = this.enemies.find(e => !e.active);
    if (!inactiveEnemy) return false;

    const lane = Math.floor(Math.random() * 3);

    const tooClose = this.enemies.some(e => {
      if (!e.active) return false;
      if (e.lane !== lane) return false;
      return e.z < this.minSpawnDistance;
    });

    if (tooClose) return false;

    inactiveEnemy.lane = lane;
    inactiveEnemy.z = 0;
    inactiveEnemy.active = true;
    inactiveEnemy.color = this.enemyColors[Math.floor(Math.random() * this.enemyColors.length)];
    inactiveEnemy.speed = 0.25 + Math.random() * 0.15;

    return true;
  }

  /**
   * 更新所有车辆状态
   * 处理玩家车道切换插值、敌车移动、尾迹更新等
   * @param dt - 时间增量（秒）
   * @param gameSpeed - 当前游戏速度倍率
   */
  public updateAll(dt: number, gameSpeed: number): void {
    this.updatePlayer(dt);
    this.updateEnemies(dt, gameSpeed);
    this.updatePlayerTrail();
  }

  /**
   * 更新玩家车辆状态
   * 处理车道切换平滑插值动画
   * @param dt - 时间增量（秒）
   */
  private updatePlayer(dt: number): void {
    if (this.player.moveProgress < 1) {
      this.player.moveProgress = Math.min(1, this.player.moveProgress + dt * this.laneChangeSpeed);
      if (this.player.moveProgress >= 1) {
        this.player.lane = this.player.targetLane;
      }
    }
  }

  /**
   * 更新所有敌车状态
   * 移动敌车（增加深度z值），超出屏幕则回收
   * @param dt - 时间增量（秒）
   * @param gameSpeed - 当前游戏速度倍率
   */
  private updateEnemies(dt: number, gameSpeed: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      enemy.z += (gameSpeed + enemy.speed) * dt * 0.25;

      if (enemy.z > 1.15) {
        enemy.active = false;
      }
    }
  }

  /**
   * 更新玩家车辆尾迹
   * 维护固定长度的历史位置点，透明度递减
   */
  private updatePlayerTrail(): void {
    const maxTrailLength = 12;

    this.player.trail.unshift({
      x: this.getCurrentLaneValue(),
      y: this.player.z,
      alpha: 1
    });

    if (this.player.trail.length > maxTrailLength) {
      this.player.trail.pop();
    }

    for (let i = 0; i < this.player.trail.length; i++) {
      this.player.trail[i].alpha = 1 - i / maxTrailLength;
    }
  }

  /**
   * 获取玩家当前实际车道值（插值结果）
   * 用于平滑切换时的渲染定位
   * @returns 车道值（-1~1范围）
   */
  private getCurrentLaneValue(): number {
    const fromLane = this.player.moveProgress < 1
      ? (this.player.lane === this.player.targetLane
        ? this.player.lane
        : (this.player.targetLane > this.player.lane ? this.player.lane : this.player.lane))
      : this.player.lane;

    const t = this.easeInOutCubic(this.player.moveProgress);
    const currentLane = fromLane + (this.player.targetLane - fromLane) * t;
    return currentLane - 1;
  }

  /**
   * 缓动函数：三次方缓入缓出
   * 使车道切换动画更自然
   * @param t - 输入值 (0~1)
   * @returns 缓动后的值
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * 渲染所有车辆
   * 按深度排序（先远后近），确保正确的遮挡关系
   * @param ctx - Canvas 2D 渲染上下文
   * @param roadRenderer - 道路渲染器（用于坐标转换）
   */
  public renderAll(ctx: CanvasRenderingContext2D, roadRenderer: RoadRenderer): void {
    const renderList: Array<{ car: Car; type: 'player' | 'enemy'; laneValue: number }> = [];

    for (const enemy of this.enemies) {
      if (enemy.active) {
        renderList.push({
          car: enemy,
          type: 'enemy',
          laneValue: enemy.lane - 1
        });
      }
    }

    renderList.push({
      car: this.player,
      type: 'player',
      laneValue: this.getCurrentLaneValue()
    });

    renderList.sort((a, b) => a.car.z - b.car.z);

    for (const item of renderList) {
      if (item.type === 'player') {
        this.renderCar(ctx, roadRenderer, item.car, item.laneValue, true);
      } else {
        this.renderCar(ctx, roadRenderer, item.car, item.laneValue, false);
      }
    }
  }

  /**
   * 渲染单个车辆
   * 使用伪3D效果：梯形车身 + 车窗 + 车灯
   * @param ctx - Canvas 2D 渲染上下文
   * @param roadRenderer - 道路渲染器
   * @param car - 车辆对象
   * @param laneValue - 车道值 (-1~1)
   * @param isPlayer - 是否为玩家车辆
   */
  private renderCar(
    ctx: CanvasRenderingContext2D,
    roadRenderer: RoadRenderer,
    car: Car,
    laneValue: number,
    isPlayer: boolean
  ): void {
    const depthT = Math.max(0.02, Math.min(1, car.z));
    const screen = roadRenderer.worldToScreen(laneValue, depthT);
    const laneWidth = roadRenderer.getLaneWidth(depthT);

    const carWidth = laneWidth * 0.75;
    const carHeight = carWidth * 1.6;

    const left = screen.x - carWidth / 2;
    const top = screen.y - carHeight;
    const right = screen.x + carWidth / 2;
    const bottom = screen.y;

    this.drawCarBody(ctx, left, top, right, bottom, car.color, screen.scale, isPlayer);
    this.drawCarWindows(ctx, left, top, right, bottom, screen.scale, isPlayer);
    this.drawCarLights(ctx, left, top, right, bottom, screen.scale, isPlayer);
  }

  /**
   * 绘制车身
   * 使用梯形形状模拟透视效果
   * @param ctx - Canvas 2D 渲染上下文
   * @param left - 左侧X坐标
   * @param top - 顶部Y坐标
   * @param right - 右侧X坐标
   * @param bottom - 底部Y坐标
   * @param color - 车身颜色
   * @param scale - 透视缩放比例
   * @param isPlayer - 是否为玩家车辆
   */
  private drawCarBody(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    right: number,
    bottom: number,
    color: string,
    scale: number,
    isPlayer: boolean
  ): void {
    const insetTop = (right - left) * 0.12;

    ctx.beginPath();
    ctx.moveTo(left + insetTop, top);
    ctx.lineTo(right - insetTop, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.closePath();

    const bodyGradient = ctx.createLinearGradient(left, 0, right, 0);
    bodyGradient.addColorStop(0, this.darkenColor(color, 0.4));
    bodyGradient.addColorStop(0.5, color);
    bodyGradient.addColorStop(1, this.darkenColor(color, 0.4));
    ctx.fillStyle = bodyGradient;
    ctx.fill();

    if (isPlayer) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15 * scale;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = this.darkenColor(color, 0.6);
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.stroke();
  }

  /**
   * 绘制车窗
   * 包含前挡风玻璃和后窗
   * @param ctx - Canvas 2D 渲染上下文
   * @param left - 左侧X坐标
   * @param top - 顶部Y坐标
   * @param right - 右侧X坐标
   * @param bottom - 底部Y坐标
   * @param scale - 透视缩放比例
   * @param isPlayer - 是否为玩家车辆
   */
  private drawCarWindows(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    right: number,
    bottom: number,
    scale: number,
    isPlayer: boolean
  ): void {
    const carHeight = bottom - top;
    const carWidth = right - left;
    const insetTop = carWidth * 0.12;
    const windowTopY = top + carHeight * 0.12;
    const windowBottomY = top + carHeight * 0.45;
    const sideInset = carWidth * 0.08;

    ctx.beginPath();
    ctx.moveTo(left + insetTop + sideInset * 0.5, windowTopY);
    ctx.lineTo(right - insetTop - sideInset * 0.5, windowTopY);
    ctx.lineTo(right - sideInset, windowBottomY);
    ctx.lineTo(left + sideInset, windowBottomY);
    ctx.closePath();

    const windowGradient = ctx.createLinearGradient(0, windowTopY, 0, windowBottomY);
    if (isPlayer) {
      windowGradient.addColorStop(0, 'rgba(150, 220, 255, 0.9)');
      windowGradient.addColorStop(1, 'rgba(80, 140, 200, 0.85)');
    } else {
      windowGradient.addColorStop(0, 'rgba(80, 80, 120, 0.9)');
      windowGradient.addColorStop(1, 'rgba(40, 40, 80, 0.85)');
    }
    ctx.fillStyle = windowGradient;
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = Math.max(0.5, 1 * scale);
    ctx.stroke();

    const rearWindowTop = top + carHeight * 0.78;
    const rearWindowBottom = top + carHeight * 0.92;
    const rearInset = carWidth * 0.15;

    ctx.beginPath();
    ctx.moveTo(left + rearInset, rearWindowTop);
    ctx.lineTo(right - rearInset, rearWindowTop);
    ctx.lineTo(right - rearInset * 0.8, rearWindowBottom);
    ctx.lineTo(left + rearInset * 0.8, rearWindowBottom);
    ctx.closePath();
    ctx.fillStyle = windowGradient;
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 绘制车灯
   * 玩家车辆：前方白色大灯 + 后方红色尾灯
   * 敌车：前方红色大灯（面向玩家） + 后方白色尾灯
   * @param ctx - Canvas 2D 渲染上下文
   * @param left - 左侧X坐标
   * @param top - 顶部Y坐标
   * @param right - 右侧X坐标
   * @param bottom - 底部Y坐标
   * @param scale - 透视缩放比例
   * @param isPlayer - 是否为玩家车辆
   */
  private drawCarLights(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    right: number,
    bottom: number,
    scale: number,
    isPlayer: boolean
  ): void {
    const carWidth = right - left;
    const carHeight = bottom - top;
    const lightSize = Math.max(2, carWidth * 0.1);
    const lightInset = carWidth * 0.12;
    const frontY = top + carHeight * 0.02;
    const rearY = bottom - carHeight * 0.08;

    const frontColor = isPlayer ? '#ffffff' : '#ff2222';
    const rearColor = isPlayer ? '#ff2222' : '#ffffff';

    ctx.fillStyle = frontColor;
    ctx.shadowColor = frontColor;
    ctx.shadowBlur = 8 * scale;

    ctx.beginPath();
    ctx.arc(left + lightInset + lightSize / 2, frontY + lightSize / 2, lightSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(right - lightInset - lightSize / 2, frontY + lightSize / 2, lightSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = rearColor;
    ctx.shadowColor = rearColor;

    ctx.fillRect(left + lightInset, rearY, lightSize * 1.2, lightSize * 0.8);
    ctx.fillRect(right - lightInset - lightSize * 1.2, rearY, lightSize * 1.2, lightSize * 0.8);

    ctx.shadowBlur = 0;
  }

  /**
   * 颜色加深辅助函数
   * 用于创建车身渐变和阴影效果
   * @param color - 十六进制颜色字符串
   * @param amount - 加深比例 (0~1)
   * @returns 加深后的十六进制颜色字符串
   */
  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.floor(r * (1 - amount));
    const newG = Math.floor(g * (1 - amount));
    const newB = Math.floor(b * (1 - amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * 获取所有激活的敌车数组
   * 用于碰撞检测
   * @returns 激活敌车数组
   */
  public getActiveEnemies(): Enemy[] {
    return this.enemies.filter(e => e.active);
  }

  /**
   * 获取玩家插值后的车道值（-1~1范围）
   * 用于粒子系统定位尾焰位置
   * @returns 玩家当前车道值
   */
  public getPlayerInterpolatedLane(): number {
    return this.getCurrentLaneValue();
  }
}
