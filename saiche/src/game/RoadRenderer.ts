/**
 * 伪3D道路渲染器
 * 使用透视投影原理，将2D坐标转换为具有深度感的3D视觉效果
 * 实现道路、车道线、路肩反光柱、星空背景等元素的绘制
 */
export class RoadRenderer {
  /** HTML Canvas 元素引用 */
  private canvas: HTMLCanvasElement;
  /** Canvas 2D 渲染上下文 */
  private ctx: CanvasRenderingContext2D;
  /** 消失点 Y 坐标（地平线位置，相对于画布高度的比例） */
  private horizonY: number = 0.35;
  /** 道路底部宽度（画布宽度比例） */
  private roadBottomWidth: number = 0.75;
  /** 道路顶部（消失点）宽度 */
  private roadTopWidth: number = 0.05;
  /** 车道数量 */
  private laneCount: number = 3;
  /** 道路条纹动画偏移（用于流动效果） */
  private stripeOffset: number = 0;

  /**
   * 构造函数
   * @param canvas - HTML Canvas 元素
   * @param ctx - Canvas 2D 渲染上下文
   */
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * 主渲染方法
   * 按层次绘制：星空背景 → 地面 → 道路 → 车道线 → 反光柱
   * @param cameraY - 相机Y坐标，用于控制道路流动动画
   * @param speed - 当前游戏速度，影响流动动画速率
   */
  public render(cameraY: number, speed: number): void {
    const { width, height } = this.canvas;

    this.updateStripeOffset(speed);
    this.drawSkyBackground(width, height);
    this.drawStars(width, height);
    this.drawHorizonGlow(width, height);
    this.drawGround(width, height);
    this.drawRoad(width, height);
    this.drawLaneDividers(width, height);
    this.drawRoadEdges(width, height);
    this.drawReflectivePosts(width, height, cameraY);
  }

  /**
   * 更新道路条纹偏移量，实现流动动画
   * @param speed - 当前游戏速度
   */
  private updateStripeOffset(speed: number): void {
    this.stripeOffset = (this.stripeOffset + speed * 0.5) % 1;
  }

  /**
   * 绘制天空背景渐变
   * 从地平线附近的深蓝紫色向上过渡到深黑色
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  private drawSkyBackground(width: number, height: number): void {
    const horizonPixelY = height * this.horizonY;
    const gradient = this.ctx.createLinearGradient(0, 0, 0, horizonPixelY);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#2d1b4e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, horizonPixelY);
  }

  /**
   * 绘制远景星空
   * 随机分布的白色小点，模拟星光效果
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  private drawStars(width: number, height: number): void {
    const horizonPixelY = height * this.horizonY;
    const starCount = 80;
    this.ctx.fillStyle = '#ffffff';

    for (let i = 0; i < starCount; i++) {
      const seed = i * 9973;
      const starX = (seed * 137) % width;
      const starY = (seed * 251) % (horizonPixelY * 0.8);
      const size = ((seed * 31) % 3) * 0.5 + 0.5;
      const alpha = 0.3 + ((seed * 17) % 70) / 100;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(starX, starY, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  /**
   * 绘制地平线发光效果
   * 在道路消失点处添加柔和的光晕，增强纵深感
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  private drawHorizonGlow(width: number, height: number): void {
    const horizonPixelY = height * this.horizonY;
    const centerX = width / 2;
    const gradient = this.ctx.createRadialGradient(
      centerX, horizonPixelY, 0,
      centerX, horizonPixelY, width * 0.3
    );
    gradient.addColorStop(0, 'rgba(255, 100, 150, 0.15)');
    gradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, horizonPixelY - 50, width, 100);
  }

  /**
   * 绘制地面（道路两侧区域）
   * 使用深灰色渐变，模拟地面透视效果
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  private drawGround(width: number, height: number): void {
    const horizonPixelY = height * this.horizonY;
    const gradient = this.ctx.createLinearGradient(0, horizonPixelY, 0, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#0d0d0d');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, horizonPixelY, width, height - horizonPixelY);
  }

  /**
   * 绘制道路主体
   * 梯形形状，从远处消失点延伸到屏幕底部
   * 使用深沥青色，并添加边缘高光增强立体感
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  private drawRoad(width: number, height: number): void {
    const centerX = width / 2;
    const horizonPixelY = height * this.horizonY;
    const roadTopHalfWidth = width * this.roadTopWidth / 2;
    const roadBottomHalfWidth = width * this.roadBottomWidth / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(centerX - roadTopHalfWidth, horizonPixelY);
    this.ctx.lineTo(centerX + roadTopHalfWidth, horizonPixelY);
    this.ctx.lineTo(centerX + roadBottomHalfWidth, height);
    this.ctx.lineTo(centerX - roadBottomHalfWidth, height);
    this.ctx.closePath();

    const roadGradient = this.ctx.createLinearGradient(0, horizonPixelY, 0, height);
    roadGradient.addColorStop(0, '#2a2a3a');
    roadGradient.addColorStop(1, '#1f1f2e');
    this.ctx.fillStyle = roadGradient;
    this.ctx.fill();
  }

  /**
   * 绘制车道分隔线（虚线）
   * 使用透视投影计算每条虚线在不同深度的位置和宽度
   * 实现流动动画效果
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  private drawLaneDividers(width: number, height: number): void {
    const horizonPixelY = height * this.horizonY;
    const centerX = width / 2;

    for (let laneIndex = 1; laneIndex < this.laneCount; laneIndex++) {
      const laneRatio = (laneIndex / this.laneCount) * 2 - 1;

      const segmentCount = 40;
      for (let i = 0; i < segmentCount; i++) {
        let t = (i + this.stripeOffset) / segmentCount;
        if (t > 1) t -= 1;

        const depthT = t * t;
        const y = horizonPixelY + depthT * (height - horizonPixelY);

        const perspectiveScale = 0.05 + depthT * 0.95;
        const roadHalfWidth = (width * this.roadBottomWidth / 2) * perspectiveScale;
        const laneX = centerX + laneRatio * roadHalfWidth * (1 / 3);

        const dashLength = (height - horizonPixelY) * 0.02 * perspectiveScale;
        const dashWidth = Math.max(1, 4 * perspectiveScale);

        if (i % 2 === 0) {
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + depthT * 0.7})`;
          this.ctx.lineWidth = dashWidth;
          this.ctx.lineCap = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo(laneX, y);
          this.ctx.lineTo(laneX, y + dashLength);
          this.ctx.stroke();
        }
      }
    }
  }

  /**
   * 绘制道路边缘实线
   * 左右两侧白色实线，标识道路边界
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  private drawRoadEdges(width: number, height: number): void {
    const centerX = width / 2;
    const horizonPixelY = height * this.horizonY;
    const roadTopHalfWidth = width * this.roadTopWidth / 2;
    const roadBottomHalfWidth = width * this.roadBottomWidth / 2;

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#e8e8e8';
    this.ctx.lineCap = 'butt';

    this.ctx.beginPath();
    this.ctx.moveTo(centerX - roadTopHalfWidth, horizonPixelY);
    this.ctx.lineTo(centerX - roadBottomHalfWidth, height);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(centerX + roadTopHalfWidth, horizonPixelY);
    this.ctx.lineTo(centerX + roadBottomHalfWidth, height);
    this.ctx.stroke();
  }

  /**
   * 绘制路肩反光柱
   * 红白相间的柱子，分布在道路两侧
   * 使用动画偏移实现移动效果
   * @param width - 画布宽度
   * @param height - 画布高度
   * @param cameraY - 相机Y坐标
   */
  private drawReflectivePosts(width: number, height: number, cameraY: number): void {
    const horizonPixelY = height * this.horizonY;
    const centerX = width / 2;
    const postCount = 20;
    const spacing = 80;
    const offset = (cameraY * 0.8) % spacing;

    for (let i = -2; i < postCount; i++) {
      const postIndex = i;
      let t = ((postIndex * spacing + offset) / (postCount * spacing));
      t = Math.max(0, Math.min(1, t));
      const depthT = t * t;

      if (depthT < 0.02 || depthT > 0.98) continue;

      const y = horizonPixelY + depthT * (height - horizonPixelY);
      const perspectiveScale = 0.05 + depthT * 0.95;
      const roadHalfWidth = (width * this.roadBottomWidth / 2) * perspectiveScale;

      const postHeight = 18 * perspectiveScale;
      const postWidth = Math.max(1, 3 * perspectiveScale);
      const alpha = 0.4 + depthT * 0.6;

      const leftPostX = centerX - roadHalfWidth - 6 * perspectiveScale;
      const rightPostX = centerX + roadHalfWidth + 6 * perspectiveScale;

      this.drawPost(leftPostX, y, postWidth, postHeight, postIndex % 2 === 0, alpha);
      this.drawPost(rightPostX, y, postWidth, postHeight, postIndex % 2 === 1, alpha);
    }
  }

  /**
   * 绘制单个反光柱
   * 分段绘制红色和白色，实现交替效果
   * @param x - 柱子中心X坐标
   * @param y - 柱子底部Y坐标
   * @param width - 柱子宽度
   * @param height - 柱子高度
   * @param isRedFirst - 是否红色在上
   * @param alpha - 透明度
   */
  private drawPost(
    x: number,
    y: number,
    width: number,
    height: number,
    isRedFirst: boolean,
    alpha: number
  ): void {
    const sections = 4;
    const sectionHeight = height / sections;

    for (let i = 0; i < sections; i++) {
      const sectionY = y - (i + 1) * sectionHeight;
      const isRed = isRedFirst ? i % 2 === 0 : i % 2 === 1;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = isRed ? '#ff3344' : '#ffffff';
      this.ctx.fillRect(x - width / 2, sectionY, width, sectionHeight + 1);
    }
    this.ctx.globalAlpha = 1;
  }

  /**
   * 将世界坐标（车道索引 + 深度）转换为屏幕坐标
   * 供外部模块（如CarManager）使用，确保车辆绘制在正确位置
   * @param lane - 车道索引 (-1~1，-1=左, 0=中, 1=右，支持中间值用于平滑切换)
   * @param depthT - 深度值 (0=消失点, 1=屏幕底部)
   * @returns 屏幕坐标 {x, y, scale}
   */
  public worldToScreen(lane: number, depthT: number): { x: number; y: number; scale: number } {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const horizonPixelY = height * this.horizonY;

    const perspectiveScale = 0.05 + depthT * depthT * 0.95;
    const roadHalfWidth = (width * this.roadBottomWidth / 2) * perspectiveScale;
    const laneX = centerX + lane * roadHalfWidth * (1 / 3);
    const y = horizonPixelY + depthT * depthT * (height - horizonPixelY);

    return { x: laneX, y, scale: perspectiveScale };
  }

  /**
   * 获取指定深度处的车道宽度（像素）
   * 用于车辆尺寸计算
   * @param depthT - 深度值 (0~1)
   * @returns 单车道宽度（像素）
   */
  public getLaneWidth(depthT: number): number {
    const { width } = this.canvas;
    const perspectiveScale = 0.05 + depthT * depthT * 0.95;
    const roadHalfWidth = (width * this.roadBottomWidth / 2) * perspectiveScale;
    return (roadHalfWidth * 2) / this.laneCount;
  }
}
