## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        "UI组件" --> "游戏状态管理(Zustand)"
        "游戏状态管理(Zustand)" --> "游戏引擎"
        "游戏引擎" --> "Canvas渲染"
    end
    subgraph "数据层"
        "单词池(内置JSON)" --> "游戏引擎"
        "游戏配置" --> "游戏引擎"
    end
```

纯前端项目，无需后端服务。游戏逻辑完全在浏览器端运行，使用 Zustand 管理状态，CSS 动画 + DOM 渲染实现下落效果。

## 2. 技术说明

* **前端**：React\@18 + TypeScript + Tailwind CSS\@3 + Vite

* **初始化工具**：vite-init (react-ts 模板)

* **状态管理**：Zustand

* **动画**：CSS animations + requestAnimationFrame

* **后端**：无

* **数据库**：无，单词池内置在前端

## 3. 路由定义

| 路由      | 用途             |
| ------- | -------------- |
| /       | 主菜单页面，含模式/难度选择 |
| /game   | 游戏主页面，单词下落+输入  |
| /result | 结算页面，展示成绩统计    |

## 4. 数据模型

### 4.1 核心类型定义

```typescript
type GameMode = 'timed' | 'endless'
type Difficulty = 'easy' | 'normal' | 'hard'

interface GameConfig {
  mode: GameMode
  difficulty: Difficulty
  timeLimit: number
  initialLives: number
  baseSpeed: number
  spawnInterval: number
}

interface FallingWord {
  id: string
  text: string
  x: number
  y: number
  speed: number
  matchedChars: number
  isTarget: boolean
}

interface GameState {
  score: number
  lives: number
  combo: number
  maxCombo: number
  totalKeystrokes: number
  correctKeystrokes: number
  wordsCompleted: number
  startTime: number
  isPlaying: boolean
  isPaused: boolean
}
```

### 4.2 单词池结构

单词按难度分级存储为 JSON 数组，无需数据库：

* easy：3-4 字母常见英文单词（约200个）

* normal：4-6 字母单词（约300个）

* hard：5-8 字母单词（约200个）

## 5. 关键模块设计

### 5.1 游戏引擎 (useGameEngine)

* 使用 requestAnimationFrame 驱动游戏循环

* 管理下落单词的生成、移动、碰撞检测

* 处理输入匹配逻辑（自动锁定 + 逐字匹配）

### 5.2 输入处理 (useInputHandler)

* 监听键盘输入事件

* 自动锁定匹配单词

* 逐字符匹配与高亮

* 错误输入检测与生命值扣减

### 5.3 渲染系统

* 下落单词使用 DOM 元素 + CSS transform 定位

* 消除特效使用 CSS animation

* 粒子效果使用 canvas overlay

* 连击震动使用 CSS transform

### 5.4 难度递增系统

* 每完成10个单词，下落速度增加5%

* 连击超过5时，生成间隔缩短10%

* 困难模式下初始速度更快，单词更长

