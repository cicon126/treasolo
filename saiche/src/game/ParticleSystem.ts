/**
 * 粒子系统
 * 管理尾焰、爆炸等视觉效果的粒子
 * 使用对象池模式优化性能，避免频繁GC开销
 */
import type { Particle } from './types';

/**
 * 粒子系统类
 * 提供尾焰粒子、爆炸粒子的发射、更新和渲染
 */
export class ParticleSystem {
  /** 活动粒子数组 */
  private particles: Particle[];
  /** 对象池最大容量 */
  private maxParticles: number = 300;

  /**
   * 构造函数
   * 初始化粒子对象池
   */
  constructor() {
    this.particles = [];
  }

  /**
   * 发射尾焰粒子
   * 在车辆尾部喷射橙红色渐变粒子，模拟加速尾焰效果
   * @param x - 发射点X坐标（屏幕坐标）
   * @param y - 发射点Y坐标（屏幕坐标）
   */
  public emitTrail(x: number, y: number): void {
    const particleCount = 3;
    for (let i = 0; i < particleCount; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.PI + (Math.random() - 0.5) * 0.6;
      const speed = 30 + Math.random() * 60;
      const life = 0.4 + Math.random() * 0.3;

      const colors = ['#ff6600', '#ffaa00', '#ff3300', '#ff8800'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        color: color,
        size: 3 + Math.random() * 4,
        alpha: 0.9
      });
    }
  }

  /**
   * 发射爆炸粒子
   * 多色放射状粒子，模拟碰撞爆炸效果
   * @param x - 爆炸中心X坐标（屏幕坐标）
   * @param y - 爆炸中心Y坐标（屏幕坐标）
   */
  public emitExplosion(x: number, y: number): void {
    const particleCount = 40;
    const colors = ['#ff3333', '#ffaa00', '#ff6600', '#ffff00', '#ffffff', '#ff0066'];

    for (let i = 0; i < particleCount; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 80 + Math.random() * 180;
      const life = 0.6 + Math.random() * 0.6;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        color: color,
        size: 3 + Math.random() * 6,
        alpha: 1
      });
    }

    this.emitSmoke(x, y);
  }

  /**
   * 发射烟雾粒子（爆炸辅助效果
   * @param x - 烟雾中心X坐标
   * @param y - 烟雾中心Y坐标
   */
  private emitSmoke(x: number, y: number): void {
    const smokeCount = 20;
    for (let i = 0; i < smokeCount; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;
      const life = 1.0 + Math.random() * 0.8;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: life,
        maxLife: life,
        color: '#555555',
        size: 8 + Math.random() * 12,
        alpha: 0.7
      });
    }
  }

  /**
   * 更新所有粒子状态
   * 根据速度移动粒子，减少生命周期，更新透明度
   * 回收过期粒子
   * @param dt - 时间增量（秒）
   */
  public updateAll(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.vx *= 0.98;
      p.vy *= 0.98;
      p.vy += 30 * dt;

      p.life -= dt;

      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.color === '#555555') {
        p.size += 15 * dt;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 渲染所有粒子
   * 按生命周期比例调整透明度和大小，实现渐变消失效果
   * @param ctx - Canvas 2D 渲染上下文
   */
  public renderAll(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = p.alpha;
      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha;

      if (p.color === '#555555') {
        this.renderSmokeParticle(ctx, p);
      } else {
        this.renderFireParticle(ctx, p);
      }
    }
    ctx.globalAlpha = 1;
  }

  /**
   * 渲染火焰/爆炸粒子
   * 使用径向渐变实现发光效果
   * @param ctx - Canvas 2D 渲染上下文
   * @param p - 粒子对象
   */
  private renderFireParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
    const size = p.size * (0.5 + p.alpha * 0.5);
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
    gradient.addColorStop(0, p.color);
    gradient.addColorStop(0.4, this.colorWithAlpha(p.color, p.alpha * 0.8));
    gradient.addColorStop(1, this.colorWithAlpha(p.color, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 渲染烟雾粒子
   * 使用柔和的灰色渐变
   * @param ctx - Canvas 2D 渲染上下文
   * @param p - 粒子对象
   */
  private renderSmokeParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, `rgba(100, 100, 100, ${p.alpha * 0.6})`);
    gradient.addColorStop(1, `rgba(60, 60, 60, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 为十六进制颜色添加透明度
   * 转换为 rgba 格式
   * @param hexColor - 十六进制颜色字符串
   * @param alpha - 透明度 (0~1)
   * @returns rgba 颜色字符串
   */
  private colorWithAlpha(hexColor: string, alpha: number): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * 获取当前活动粒子数量
   * 用于调试和性能监控
   * @returns 活动粒子数量
   */
  public getActiveCount(): number {
    return this.particles.length;
  }

  /**
   * 清空所有粒子
   * 用于游戏重置或场景切换
   */
  public clear(): void {
    this.particles.length = 0;
  }
}
