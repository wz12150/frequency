# Java 后端开发计划

## 一、目标

本计划完全基于我的思路制定，不沿用之前任何开发方案。目标是将系统后端建设为一个稳定、可扩展、可维护的 Java 服务，逐步完成登录认证、权限控制、核心业务 CRUD、统计分析、导入导出和前后端联调，最终支撑整个频率管理软件的业务运行。

---

## 二、技术路线

建议采用以下技术栈：

- Java 17
- Spring Boot 3
- Spring Web
- Spring Validation
- Spring Security
- JWT
- MyBatis-Plus
- MySQL 8.0
- Maven
- Lombok
- Knife4j 或 springdoc-openapi
- EasyExcel
- Hutool

### 设计原则

1. 接口层、业务层、数据层分离。
2. 数据库实体、入参 DTO、出参 VO 分离。
3. 统一返回格式、统一异常处理、统一分页结构。
4. 所有业务模块按统一目录组织。
5. 先基础设施，后业务模块，再统计与报表。

---

## 三、数据库依据

数据库表以你提供的文档 `D:\王子科技\产品\频率管理软件\频率管理软件.PDF` 中的表格为准，不使用其他来源。

本计划中优先落地的核心表如下：

- `RSBT_PLANNNING`
- `RSBT_STATION`
- `RSBT_SPECIAL_PERMIT`
- `RSBT_SPECIAL_PERMIT_FREQUENCY`
- `RSBT_SPECIAL_PERMIT_STATION`

### 表用途划分

- `RSBT_PLANNNING`：频率规划
- `RSBT_STATION`：台站管理
- `RSBT_SPECIAL_PERMIT`：频率授权主表
- `RSBT_SPECIAL_PERMIT_FREQUENCY`：授权频率扩展表
- `RSBT_SPECIAL_PERMIT_STATION`：授权台站扩展表

---

## 四、逐日开发任务表

下面按 45 天左右的节奏安排，便于分阶段推进。

### 第 1 阶段：项目骨架与基础设施

#### 第 1-2 天
目标：搭建后端工程骨架，保证可启动、可连库。

任务：
- 创建 Spring Boot 工程
- 引入基础依赖
- 配置 MySQL 数据源
- 配置 MyBatis-Plus
- 配置跨域
- 配置统一返回结构
- 配置统一异常处理
- 创建健康检查接口

交付：
- 后端可启动
- `/api/health` 可访问
- 可正常连接 MySQL

#### 第 3-4 天
目标：完善通用基础能力。

任务：
- 统一响应格式
- 统一分页格式
- 统一错误码体系
- 参数校验体系
- 基础工具类
- 文件上传基础能力
- Excel 导入导出基础能力

交付：
- 全局统一返回结构
- 后续业务模块可直接复用

#### 第 5-6 天
目标：完成登录认证与权限框架。

任务：
- 登录接口
- 退出登录接口
- 当前用户接口
- Token 生成与校验
- Spring Security 配置
- BCrypt 密码加密
- 权限拦截
- 角色权限预留

交付：
- 系统具备登录认证能力
- 未登录请求可拦截

---

### 第 2 阶段：核心表建模与基础 CRUD

#### 第 7-10 天
目标：建立核心表实体与 CRUD 模板。

任务：
- 为 5 张核心表建立 Entity
- 建立 Mapper、Service、Controller
- 建立 DTO 与 VO
- 建立分页查询
- 建立新增、编辑、删除、详情接口
- 建立字段校验规则

交付：
- 核心表基础 CRUD 框架完成

#### 第 11-13 天
目标：完成频率规划模块。

任务：
- `RSBT_PLANNNING` 分页查询
- 条件筛选
- 新增、编辑、删除、详情
- Excel 导入导出
- 频段范围查询
- 规划总览接口

交付：
- 频率规划可维护、可查询、可导入导出

#### 第 14-17 天
目标：完成台站管理模块。

任务：
- `RSBT_STATION` 分页查询
- 条件筛选
- 新增、编辑、删除、详情
- Excel 导入导出
- 台站地图点位接口
- 台站基础统计接口

交付：
- 台站模块完整可用

#### 第 18-21 天
目标：完成频率授权模块。

任务：
- `RSBT_SPECIAL_PERMIT` 主表 CRUD
- `RSBT_SPECIAL_PERMIT_FREQUENCY` 明细维护
- `RSBT_SPECIAL_PERMIT_STATION` 明细维护
- 授权详情接口
- Excel 导入导出
- 授权状态查询

交付：
- 授权主从结构打通

---

### 第 3 阶段：驾驶舱与统计分析

#### 第 22-25 天
目标：完成驾驶舱首页接口。

任务：
- 全国省份台站数量统计
- 授权状态统计
- 台站类型统计
- 台站增长率分析
- 各省台站有效统计

交付：
- 首页图表与地图数据接口可用

#### 第 26-29 天
目标：完成台站统计分析模块。

任务：
- 台站区域统计
- 台站增长分析
- 台站有效统计
- 年度、月度、区域维度统计

交付：
- 台站分析页面可对接后端数据

#### 第 30-33 天
目标：完成频率授权统计分析模块。

任务：
- 频率使用率增长分析
- 频率授权数量统计
- 频率授权台站数量统计
- 授权许可有效期统计

交付：
- 授权分析页面可对接后端数据

---

### 第 4 阶段：导入导出、联调和优化

#### 第 34-36 天
目标：完成批量数据处理能力。

任务：
- 频率规划导入导出
- 台站导入导出
- 授权导入导出
- 导入错误反馈
- 模板下载

交付：
- 批量维护能力可用

#### 第 37-40 天
目标：前后端联调。

任务：
- 对接前端接口
- 校验分页参数
- 校验字段格式
- 调整返回结构
- 调整图表数据结构
- 调整地图数据结构
- 校正登录与权限流程

交付：
- 前端页面切换到真实后端数据

#### 第 41-45 天
目标：测试、优化、上线准备。

任务：
- 单元测试
- 接口测试
- 权限测试
- 导入导出测试
- SQL 优化
- 慢查询排查
- 数据一致性检查
- 部署文档准备

交付：
- 后端达到可部署状态

---

## 五、Java 后端项目结构

建议使用以下目录结构：

```text
backend/
  pom.xml
  src/
    main/
      java/
        com/
          freqmanage/
            FrequencyManageApplication.java
            common/
            config/
            security/
            module/
      resources/
        application.yml
        application-dev.yml
        mapper/
        logback-spring.xml
    test/
```

---

## 六、核心包设计

### 1. `common`

放通用能力。

```text
common/
  result/
    Result.java
    PageResult.java
  exception/
    BizException.java
    GlobalExceptionHandler.java
  constants/
    ResultCode.java
    StatusConstants.java
    SecurityConstants.java
  base/
    BaseEntity.java
    PageQuery.java
  util/
    JwtUtil.java
    DateUtil.java
    ExcelUtil.java
    FileUtil.java
```

### 2. `config`

放配置类。

```text
config/
  MybatisPlusConfig.java
  CorsConfig.java
  WebMvcConfig.java
  OpenApiConfig.java
  JacksonConfig.java
  SecurityConfig.java
```

### 3. `security`

放认证鉴权相关类。

```text
security/
  JwtAuthenticationFilter.java
  JwtAuthenticationEntryPoint.java
  JwtAccessDeniedHandler.java
  LoginUser.java
  LoginUserService.java
  PasswordEncoderConfig.java
```

### 4. `module`

放业务模块。

```text
module/
  auth/
  planning/
  station/
  permit/
  statistics/
```

---

## 七、业务模块清单

### 1. 认证模块 `auth`

接口：

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

职责：
- 登录认证
- Token 管理
- 当前用户信息
- 修改密码

---

### 2. 频率规划模块 `planning`

对应表：`RSBT_PLANNNING`

接口：

```text
GET    /api/planning/page
GET    /api/planning/{id}
POST   /api/planning
PUT    /api/planning/{id}
DELETE /api/planning/{id}
POST   /api/planning/import
GET    /api/planning/export
GET    /api/planning/overview
```

职责：
- 频率规划 CRUD
- 条件筛选
- 导入导出
- 规划总览

---

### 3. 台站模块 `station`

对应表：`RSBT_STATION`

接口：

```text
GET    /api/station/page
GET    /api/station/{id}
POST   /api/station
PUT    /api/station/{id}
DELETE /api/station/{id}
POST   /api/station/import
GET    /api/station/export
GET    /api/station/map
```

职责：
- 台站 CRUD
- 地图点位
- 区域统计
- 增长分析

---

### 4. 频率授权模块 `permit`

对应表：

- `RSBT_SPECIAL_PERMIT`
- `RSBT_SPECIAL_PERMIT_FREQUENCY`
- `RSBT_SPECIAL_PERMIT_STATION`

接口：

```text
GET    /api/permit/page
GET    /api/permit/{id}
POST   /api/permit
PUT    /api/permit/{id}
DELETE /api/permit/{id}
POST   /api/permit/import
GET    /api/permit/export
GET    /api/permit/detail/{id}
```

职责：
- 授权主表管理
- 授权明细管理
- 授权统计分析
- 有效期分析

---

### 5. 统计分析模块 `statistics`

接口：

```text
GET /api/dashboard/overview
GET /api/dashboard/station-type
GET /api/dashboard/station-growth
GET /api/dashboard/permit-status
GET /api/statistics/station/region
GET /api/statistics/station/growth
GET /api/statistics/station/expired
GET /api/statistics/permit/usage-growth
GET /api/statistics/permit/count
GET /api/statistics/permit/station-count
GET /api/statistics/permit/expiry
```

职责：
- 驾驶舱首页
- 台站统计
- 授权统计
- 图表数据接口

---

## 八、接口规范建议

### 1. 统一路径

```text
/api/模块名
```

### 2. 统一分页参数

```text
pageNum
pageSize
keyword
```

### 3. 统一时间字段

```text
createTime
updateTime
```

### 4. 统一删除策略

优先逻辑删除：

```text
deleted = 0 / 1
```

### 5. 统一状态字段

```text
status = 0 / 1
```

### 6. 统一返回格式

成功：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

失败：

```json
{
  "code": 500,
  "message": "错误说明",
  "data": null
}
```

---

## 九、推荐开发顺序

1. 后端工程骨架
2. 数据库连接
3. 统一返回与异常处理
4. 登录认证
5. 5 张核心表建模
6. 核心 CRUD
7. 驾驶舱与统计分析
8. 导入导出
9. 前后端联调
10. 测试与上线准备

---

## 十、下一步执行建议

如果要继续推进，下一步建议直接做：

1. 根据 PDF 表结构创建 Java 实体类和 Mapper 目录；
2. 创建 Spring Boot 后端工程骨架；
3. 先实现登录认证和 5 张核心表的 CRUD。
