# Cirana 智能工具系统 v2.1.0

## 📋 项目概述

Cirana 是一个现代化的 AI 助手与物理仿真网页应用。

## ✨ 主要功能

### 1. AI 对话 (智能核心)
- 支持多种大语言模型 (Qwen, Gemma, GLM)
- 实时打字指示器与快捷建议

### 2. 物理实验平台 (新功能)
#### 🔦 光具座实验
- 模拟透镜成像原理
- 支持实时调整光源、透镜、光屏位置
- 自动计算成像性质（实/虚、放大/缩小、正/倒）

#### ⚡ 电学实验 (v2.1.0 新增)
- **实时电路仿真**: 基于基尔霍夫定律与欧姆定律的实时仿真引擎。
- **核心元件库**:
  - **导线**: 自由拖拽连接。
  - **电源**: 3/6/9V 预设，自定义 0-24V。
  - **电阻**: 1Ω-999kΩ，四色环可视化。
  - **电表**: 高精度电流表/电压表。
  - **开关**: 实时通断反馈。
  - **灯泡**: 支持额定功率/电压设置，亮度随实际功率变化，具备熔断保护。
- **仿真特性**:
  - 网格吸附机制，布线整齐。
  - 自动检测短路、过载与反接风险。
  - 一键导出 Markdown 实验报告。

### 3. 多语言与主题
- 支持中简/中繁/英文，支持亮暗色主题。

### 5. 错误处理系统
- 7种错误类型分类
- 用户友好的错误提示
- 详细的解决方案建议
- 错误日志记录与持久化

## 🔧 技术架构

### 文件结构
```
y:\usefultools\
├── index.html      # 主 HTML 文件
├── style.css       # 样式文件
├── script.js       # 逻辑文件
└── README.md       # 本文件
```

### 核心模块

#### 1. API 集成系统
```javascript
const API_CONFIG = {
    openrouter: {
        key: "sk-or-v1-...",
        url: "https://openrouter.ai/api/v1/chat/completions"
    },
    zhipu: {
        key: "dd66b86b79aa42e5aafaa4554655df5c.JabmF4HT4DhNskoR",
        url: "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    }
}
```

#### 2. 错误管理系统
```javascript
const ERROR_TYPES = {
    NETWORK_ERROR: { code: "E001", name: "网络错误" },
    RATE_LIMIT_ERROR: { code: "E002", name: "频率限制" },
    AUTH_ERROR: { code: "E003", name: "认证错误" },
    PARAM_ERROR: { code: "E004", name: "参数错误" },
    SERVER_ERROR: { code: "E005", name: "服务器错误" },
    TIMEOUT_ERROR: { code: "E006", name: "超时错误" },
    UNKNOWN_ERROR: { code: "E999", name: "未知错误" }
}
```

## 🐛 问题分析与修复报告

### 原始问题

#### 问题 1：API 调用错误 (429 Too Many Requests)
**问题描述**：
- OpenRouter API 返回 429 状态码
- 频率限制触发，请求被阻止

**问题根源**：
- 旧代码缺乏错误处理机制
- 没有频率限制处理逻辑
- 用户体验差，无明确提示

**修复方案**：
- 添加完整的 ErrorManager 类
- 实现错误类型分类
- 提供用户友好的错误弹窗
- 支持重试功能

#### 问题 2：模型配置硬编码
**问题描述**：
- 模型 ID 硬编码在代码中
- 难以扩展新模型
- 不同 API 提供商混合

**修复方案**：
- 重新设计 API_CONFIG 结构
- 按提供商组织配置
- 支持多 API 提供商
- 灵活的模型切换机制

#### 问题 3：缺乏错误提示
**问题描述**：
- 错误时无用户反馈
- 调试困难
- 用户不知道如何处理

**修复方案**：
- 设计精美的错误弹窗 UI
- 提供详细的错误信息
- 给出解决方案建议
- 记录错误到 localStorage

### 修复详情

#### 修复 1：ErrorManager 类
实现了完整的错误管理系统，包含：
- 错误分类
- 错误日志记录
- 错误持久化
- 解决方案查询

#### 修复 2：API 调用重构
- 分离不同 API 提供商的请求构建
- 添加请求超时处理
- 完善错误捕获与处理
- 提供重试机制

#### 修复 3：新模型集成
- 集成智谱AI GLM-4.7-Flash
- 支持 thinking 模式
- 使用官方 API 规范

## 🚀 部署说明

### 环境要求
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
- 网络连接
- localStorage 支持

### 快速启动
1. 下载所有文件到同一目录
2. 用浏览器打开 `index.html`
3. 开始使用！

### 配置修改

#### 修改 API Key
编辑 `script.js` 中的 `API_CONFIG` 对象：

```javascript
const API_CONFIG = {
    openrouter: {
        key: "YOUR_OPENROUTER_KEY",
        // ...
    },
    zhipu: {
        key: "YOUR_ZHIPU_KEY",
        // ...
    }
}
```

#### 添加新模型
在相应的 API 提供商下添加模型配置：

```javascript
models: {
    "your-model-name": {
        id: "actual-model-id",
        icon: "🤖",
        name: "Model Name",
        desc: "Model description"
    }
}
```

## 📱 响应式设计

### 断点设置
- **移动设备** (<768px)
  - 侧边栏可滑动
  - 优化的间距
  - 全屏显示

- **平板** (768px-1200px)
  - 侧边栏固定
  - 适度间距

- **桌面** (>1200px)
  - 完整功能
  - 最大宽度限制

## 🛡️ 安全考虑

### API Key 安全
- 当前实现适合个人使用
- 生产环境建议：
  - 使用后端代理
  - 实施访问控制
  - 定期轮换密钥

### 数据安全
- 错误日志只在本地存储
- 不发送敏感信息到第三方
- 用户数据完全保存在浏览器端

## 📈 性能优化

- CSS 动画使用硬件加速
- DOM 操作优化
- 响应式图像加载
- 本地存储缓存

## 🎨 设计理念

- 现代化渐变设计
- 平滑过渡动画
- 清晰的视觉层次
- 直观的用户交互

## 🧪 测试报告

### 功能测试

#### ✅ 模型切换
- OpenRouter Qwen 3 Next ✓
- OpenRouter Gemma 4 ✓
- 智谱AI GLM 4.7 Flash ✓

#### ✅ 对话功能
- 发送消息 ✓
- 接收响应 ✓
- 打字指示器 ✓
- 快捷消息 ✓

#### ✅ 错误处理
- 网络错误提示 ✓
- 429 频率限制 ✓
- 错误日志记录 ✓
- 重试功能 ✓

#### ✅ 界面功能
- 主题切换 ✓
- 语言切换 ✓
- 响应式布局 ✓

### 兼容性测试
- Chrome 120+ ✓
- Firefox 115+ ✓
- Safari 17+ ✓
- Edge 120+ ✓

## 📚 API 文档

### OpenRouter API
- 端点：https://openrouter.ai/api/v1/chat/completions
- 认证：Bearer Token
- 支持 reasoning 模式

### 智谱AI API
- 端点：https://open.bigmodel.cn/api/paas/v4/chat/completions
- 认证：Bearer Token
- 支持 thinking 模式

## 🔮 未来计划

- [ ] 添加更多工具功能
- [ ] 支持对话导出
- [ ] 添加对话历史
- [ ] 支持语音输入
- [ ] 支持图片上传

## 📄 许可证

本项目仅供学习和个人使用。

## 🤝 联系

如有问题或建议，欢迎反馈！

---

**版本**：2.0.0  
**最后更新**：2026-05-02  
**作者**：卉语传心科技有限公司
