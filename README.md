# 健康管理系统前端（HealthManagerVue）

本项目是一个基于 Vue 2.x + Element UI 的健康管理系统前端，支持用户、角色、菜单、运动、健康信息管理，以及 AI 健康问答等功能。

## 技术栈
- Vue 2.x
- Element UI
- Vue Router
- Vuex
- Axios
- ECharts

## 目录结构
```
HealthManagerVue/
├── public/               # 静态资源
├── src/                  # 源码目录
│   ├── api/              # 所有 API 接口定义
│   ├── assets/           # 图片、样式等静态资源
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── store/            # Vuex 状态管理
│   ├── utils/            # 工具函数
│   ├── views/            # 各页面视图
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── package.json          # 项目依赖及脚本
└── README.md             # 项目说明
```

## 安装与启动
1. 安装依赖
```bash
npm install
```

2. 启动开发环境
```bash
npm run dev
```

3. 打包生产环境
```bash
npm run build
```

> 默认后端 API 地址在 `.env.development` 文件中配置（如：`VUE_APP_BASE_API='http://127.0.0.1:9401'`）。如需修改，请根据实际后端地址调整。

## 主要功能模块
- 用户管理（增删改查、登录、注册、修改密码、健康档案）
- 角色管理
- 菜单管理
- 运动信息管理
- 健康信息管理
- AI 健康问答（流式接口）

## 前端调用的后端接口汇总
（所有接口均以 VUE_APP_BASE_API 为前缀）

- /user/list
- /user/add
- /user/{id} （GET, DELETE）
- /user/update
- /user/login
- /user/info
- /user/logout
- /user/BodyInformation
- /user/BodyInformationNotes
- /role/list
- /role（POST, PUT）
- /role/{id}（GET, DELETE）
- /role/all
- /menu
- /sport/getAllSportInfo
- /detail/DetailInfo/{sportName}
- /sport/getSportList
- /sport（POST, PUT）
- /sport/{id}（GET, DELETE）
- /detail/getDetailList
- /detail（POST, PUT）
- /detail/{id}（GET, DELETE）
- /chatStream?question=...
- /vue-admin-template/table/list

## 备注
- 本项目为前端部分，需配合对应后端服务使用。
- 如需二次开发，请根据实际业务调整接口与页面。
