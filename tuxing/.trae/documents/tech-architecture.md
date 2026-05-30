## 1. 架构设计

```mermaid
flowchart TD
    A["前端 React + Vite"] --> B["图形选择组件"]
    A --> C["颜色选择组件"]
    A --> D["画布渲染组件"]
    A --> E["属性控制组件"]
    B --> F["Zustand 状态管理"]
    C --> F
    D --> F
    E --> F
    F --> G["Canvas / SVG 渲染引擎"]
```

## 2. 技术说明

- 前端：React@18 + Tailwind CSS@3 + Vite
- 初始化工具：vite-init
- 后端：无
- 数据库：无，使用前端状态管理

## 3. 路由定义

| 路由 | 用途 |
|-----|------|
| / | 主页面，包含图形生成器的所有功能 |

## 4. API定义

不适用，纯前端项目

## 5. 服务端架构图

不适用，纯前端项目

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    Shape {
        string id PK
        string type
        string fillColor
        string strokeColor
        number strokeWidth
        number opacity
        number rotation
        number size
        number x
        number y
    }
    CanvasState {
        string selectedShapeId FK
        number zoom
        boolean showGrid
    }
    CanvasState ||--o{ Shape : "contains"
```

### 6.2 数据定义语言

不适用，使用前端 Zustand 状态管理存储数据
