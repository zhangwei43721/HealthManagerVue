# 健康管理系统 API 文档

本文档包含了健康管理系统后端提供的 API 接口信息。

## 用户管理 (`/user`)

| 功能描述                     | HTTP 方法 | 访问路径                               | 输入参数 (请求体/路径/查询参数)                                                                 | 输出参数 (成功)                                                                                                | 输出参数 (失败)                                  |
| :--------------------------- | :-------- | :------------------------------------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| 登录                         | POST      | `/user/login`                          | [`User`](#user) 对象 (仅需 `username`, `password`)                                                | `Map<String, Object>` (包含 `token`: String, `user`: [`User`](#user) 信息)                                       | `code: 20002, message: "用户名或密码错误"`         |
| 微信登录                     | POST      | `/user/Wxlogin`                        | [`User`](#user) 对象 (包含微信授权相关信息，具体待确认)                                             | `Map<String, Object>` (包含 `token`: String, `user`: [`User`](#user) 信息)                                       | `Unification.fail()` (默认失败)                   |
| 注册                         | POST      | `/user/register`                       | [`User`](#user) 对象 (包含注册信息)                                                               | `message: "注册成功"`                                                                                          | `code: 20004, message: "注册失败，用户名已存在"` |
| 获取用户信息 (根据 Token)  | GET       | `/user/info`                           | `X-Token` (请求头): String                                                                        | `Map<String, Object>` (包含用户详细信息, `roles`: List<String>, `name`: String, `avatar`: String 等)             | `code: 20003, message: "登录信息有误，请重新登录"` |
| 登出                         | POST      | `/user/logout`                         | `X-Token` (请求头): String                                                                        | `Unification.success()` (空成功响应)                                                                            | -                                                |
| 获取用户列表 (分页)        | GET       | `/user/list`                           | `username` (可选, 查询参数): String, `phone` (可选, 查询参数): String, `pageNo`: Long, `pageSize`: Long | `Map<String, Object>` (包含 `total`: Long, `rows`: List<[`User`](#user)>)                                     | -                                                |
| 新增用户                     | POST      | `/user/add`                            | [`User`](#user) 对象 (包含新用户信息)                                                              | `message: "新增成功"`                                                                                          | `message: "用户名已存在"`                       |
| 修改用户信息                 | PUT       | `/user/update`                         | [`User`](#user) 对象 (ID 必须存在，密码和头像可选)                                                  | `message: "修改成功"`                                                                                          | -                                                |
| 根据 ID 获取用户信息         | GET       | `/user/{id}`                           | `id` (路径参数): Integer                                                                          | [`User`](#user) 对象                                                                                           | -                                                |
| 删除用户                     | DELETE    | `/user/{id}`                           | `id` (路径参数): Integer                                                                          | `message: "删除成功"`                                                                                          | -                                                |
| 修改密码                     | PUT       | `/user/changePassword`                 | [`User`](#user) 对象 (包含 `id` 和 `newPassword`)                                                 | `message: "修改密码成功"`                                                                                       | -                                                |
| 更新用户头像 (内部调用)    | PUT       | `/user/updateAvatar`                   | `userId`: Integer, `avatarUrl`: String (查询参数)                                                 | `message: "更新头像成功"`                                                                                       | `code: 500, message: "更新头像失败"`             |
| 获取用户 ID (根据 Token)   | GET       | `/user/getUserId`                      | `X-Token` (请求头): String                                                                        | `Map<String, Object>` (包含 `id`: Integer, `username`: String, `name`: String)                               | `code: 20003, message: "登录信息有误，请重新登录"` |

## 用户体征信息管理 (`/user`)

| 功能描述                       | HTTP 方法 | 访问路径                      | 输入参数 (请求体/路径/查询参数/请求头)                                                              | 输出参数 (成功)                                                                                  | 输出参数 (失败)                                  |
| :----------------------------- | :-------- | :---------------------------- | :-------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| 上传/更新用户体征信息        | POST      | `/user/BodyInformation`       | `X-Token` (请求头): String, [`Body`](#body) 对象 (请求体)                                             | `message: "提交成功"`                                                                            | `code: 20003, message: "登录信息有误，请重新登录"` |
| 新增体征记录 (管理员)        | POST      | `/user/BodyInformationNotes`  | [`BodyNotes`](#bodynotes) 对象 (请求体)                                                             | `message: "新增体征信息成功"`                                                                    | `message: "新增体征信息失败"`                     |
| 获取用户最新体征信息 (Token) | GET       | `/user/getBodyInfo`           | `X-Token` (请求头): String                                                                        | `Map<String, Object>` (包含 `body`: [`Body`](#body))                                           | `code: 20003, message: "登录信息有误，请重新登录"` |
| 获取所有体征记录 (分页)      | GET       | `/user/getBodyList`           | `name` (可选): String, `id` (可选): Integer, `pageNo`: Long, `pageSize`: Long (查询参数)             | `Map<String, Object>` (包含 `total`: Long, `rows`: List<[`Body`](#body)>)                     | -                                                |
| 根据 ID 获取体征信息         | GET       | `/user/getBodyById/{id}`      | `id` (路径参数): Integer                                                                           | [`Body`](#body) 对象                                                                           | -                                                |
| 修改体征信息 (管理员)        | PUT       | `/user/updateBody`            | [`Body`](#body) 对象 (请求体, ID 必须存在)                                                          | `message: "修改成功"`                                                                            | -                                                |
| 删除体征信息 (管理员)        | DELETE    | `/user/deleteBodyById/{id}` | `id` (路径参数): Integer                                                                           | `message: "删除成功"`                                                                            | -                                                |
| 获取用户体征记录日志 (ID)    | GET       | `/user/getBodyNotes/{id}`     | `id` (用户 ID, 路径参数): Integer                                                                  | List<[`BodyNotes`](#bodynotes)>                                                              | `message: "没有找到多余的记录"`                  |
| 获取用户体征记录日志 (Token) | GET       | `/user/WxgetBodyNotes`         | `X-Token` (请求头): String                                                                         | `Map<String, Object>` (包含 `id`, `name`, `bodyNotes`: List<[`BodyNotes`](#bodynotes)>)     | `code: 20003, message: "登录信息有误，请重新登录"` |
| 获取用户体征记录 (分页, Token) | GET       | `/user/getUserBodyList`       | `X-Token` (请求头): String, `pageNo`: Long, `pageSize`: Long (查询参数)                            | `Map<String, Object>` (包含 `total`, `rows`: List<[`BodyNotes`](#bodynotes)>, `username`, `name`) | `code: 20003, message: "登录信息有误，请重新登录"` |
| 根据记录 ID 获取单条体征记录   | GET       | `/user/getUserBodyById/{notesid}` | `notesid` (记录 ID, 路径参数): Integer                                                             | [`BodyNotes`](#bodynotes) 对象                                                                 | -                                                |
| 用户修改自己的体征记录       | PUT       | `/user/updateUserBody`        | [`BodyNotes`](#bodynotes) 对象 (请求体, 记录 ID (`notesid`) 必须存在)                               | `message: "修改成功"`                                                                            | -                                                |
| 用户删除自己的体征记录       | DELETE    | `/user/deleteUserBodyById/{notesid}` | `notesid` (记录 ID, 路径参数): Integer                                                             | `message: "删除成功"`                                                                            | -                                                |

## 角色管理 (`/role`)

| 功能描述             | HTTP 方法 | 访问路径          | 输入参数 (请求体/路径/查询参数)                                                              | 输出参数 (成功)                                                                    | 输出参数 (失败)           |
| :------------------- | :-------- | :---------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------------------------ |
| 获取角色列表 (分页)  | GET       | `/role/list`      | `roleName` (可选): String, `pageNo`: Long, `pageSize`: Long (查询参数)                       | `Map<String, Object>` (包含 `total`: Long, `rows`: List<[`Role`](#role)>)         | -                         |
| 新增角色             | POST      | `/role`           | [`Role`](#role) 对象 (包含 `roleName`, `roleDesc`, `menuIdList`)                              | `message: "新增成功"`                                                                | `message: "用户名已存在"` |
| 修改角色             | PUT       | `/role`           | [`Role`](#role) 对象 (ID 必须存在, 包含 `roleName`, `roleDesc`, `menuIdList`)                | `message: "修改成功"`                                                                | -                         |
| 根据 ID 获取角色信息 | GET       | `/role/{id}`      | `id` (路径参数): Integer                                                                       | [`Role`](#role) 对象                                                               | -                         |
| 删除角色             | DELETE    | `/role/{id}`      | `id` (路径参数): Integer                                                                       | `message: "删除成功"`                                                                | -                         |
| 获取所有角色         | GET       | `/role/all`       | 无                                                                                         | List<[`Role`](#role)>                                                            | -                         |

## 菜单管理 (`/menu`)

| 功能描述       | HTTP 方法 | 访问路径 | 输入参数 | 输出参数 (成功)          | 输出参数 (失败) |
| :------------- | :-------- | :------- | :------- | :----------------------- | :-------------- |
| 获取所有菜单 | GET       | `/menu`  | 无       | List<[`Menu`](#menu)> (树形结构) | -               |

## 文件上传 (`/file`)

| 功能描述                     | HTTP 方法 | 访问路径                | 输入参数 (请求体/请求头)                     | 输出参数 (成功)                                                                              | 输出参数 (失败)                                                                      |
| :--------------------------- | :-------- | :---------------------- | :------------------------------------------- | :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| 通用文件上传 (无需认证)      | POST      | `/file/upload`          | `file` (表单数据): MultipartFile             | `Map<String, Object>` (包含 `url`: String, `originalFilename`: String, `size`: Long)         | `code: 400/500, message: "参数文件为空"/"文件内容为空"/"文件过大"/"扩展名不合法"/...`    |
| 通用头像上传 (无需认证)      | POST      | `/file/avatar/upload`   | `file` (表单数据): MultipartFile             | `Map<String, Object>` (包含 `url`: String, `originalFilename`: String, `size`: Long)         | `code: 400/500, message: "..."` (同上)                                              |
| 用户头像上传 (需要认证)      | POST      | `/file/user/avatar/upload` | `file` (表单数据): MultipartFile, `X-Token` (请求头): String | `Map<String, Object>` (包含 `url`: String, `originalFilename`: String, `size`: Long)         | `code: 401/400/500, message: "认证失败"/"参数文件为空"/.../"更新数据库失败"`            |

## 运动知识管理 (`/sport`)

| 功能描述                 | HTTP 方法 | 访问路径                | 输入参数 (请求体/路径/查询参数)                                                               | 输出参数 (成功)                                                                             | 输出参数 (失败)                     |
| :----------------------- | :-------- | :---------------------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :---------------------------------- |
| 获取所有运动知识 (分页)  | GET       | `/sport/getAllSportInfo` | `pageNo`: Long, `pageSize`: Long (查询参数)                                                    | `Map<String, Object>` (包含 `total`: Long, `rows`: List<[`SportInfo`](#sportinfo)>)        | -                                   |
| 获取运动知识列表 (分页)  | GET       | `/sport/getSportList`   | `sportType` (可选): String, `pageNo`: Long, `pageSize`: Long (查询参数)                       | `Map<String, Object>` (包含 `total`: Long, `rows`: List<[`SportInfo`](#sportinfo)>)        | -                                   |
| 新增运动知识             | POST      | `/sport/add`            | [`SportInfo`](#sportinfo) 对象 (请求体)                                                         | `message: "新增成功"`                                                                       | `message: "新增失败，运动类型已存在"` |
| 修改运动知识             | PUT       | `/sport/update`         | [`SportInfo`](#sportinfo) 对象 (请求体, ID 必须存在)                                              | `message: "修改成功"`                                                                       | -                                   |
| 根据 ID 获取运动知识     | GET       | `/sport/{id}`           | `id` (路径参数): Integer                                                                        | [`SportInfo`](#sportinfo) 对象                                                            | -                                   |
| 删除运动知识             | DELETE    | `/sport/{id}`           | `id` (路径参数): Integer                                                                        | `message: "删除成功"`                                                                       | -                                   |

## 运动详情管理 (`/detail`)

| 功能描述                   | HTTP 方法 | 访问路径                   | 输入参数 (请求体/路径/查询参数)                                                               | 输出参数 (成功)                                                                           | 输出参数 (失败)                     |
| :------------------------- | :-------- | :------------------------- | :---------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- | :---------------------------------- |
| 根据运动名称获取详情       | GET       | `/detail/DetailInfo/{sportName}` | `sportName` (路径参数): String                                                                 | [`Detail`](#detail) 对象 (返回列表中的第一个)                                                  | `message: "查询结果为空"`             |
| 获取运动详情列表 (分页)    | GET       | `/detail/getDetailList`    | `sportType` (可选): String, `pageNo`: Long, `pageSize`: Long (查询参数)                       | `Map<String, Object>` (包含 `total`: Long, `rows`: List<[`Detail`](#detail)>)             | -                                   |
| 新增运动详情               | POST      | `/detail/addDetail`        | [`Detail`](#detail) 对象 (请求体)                                                               | `message: "新增成功"`                                                                     | `message: "新增失败，运动类型已存在"` |
| 修改运动详情               | PUT       | `/detail/updateDetail`     | [`Detail`](#detail) 对象 (请求体, ID 必须存在)                                                    | `message: "修改成功"`                                                                     | -                                   |
| 根据 ID 获取运动详情       | GET       | `/detail/getDetailById/{id}` | `id` (路径参数): Integer                                                                        | [`Detail`](#detail) 对象                                                                  | -                                   |
| 删除运动详情               | DELETE    | `/detail/deleteDetailById/{id}` | `id` (路径参数): Integer                                                                        | `message: "删除成功"`                                                                     | -                                   |

## AI 功能 (`/`)

| 功能描述                             | HTTP 方法 | 访问路径                   | 输入参数 (表单数据/请求头/查询参数)                                                                 | 输出参数 (成功)                                                                                           | 输出参数 (失败)                                                              |
| :----------------------------------- | :-------- | :------------------------- | :-------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| AI 聊天流 (默认模型, 支持图片)     | POST      | `/chatStream`              | `X-Token` (请求头): String, `message` (表单): String, `file` (可选, 表单): MultipartFile, `conversationId` (可选, 表单): String | SSE 事件流 (`message`: String, `error`: String, `conversationId`: String)                               | SSE 事件流 (`error`) 或 HTTP 错误                                           |
| 查看聊天历史 (根据 Token)          | GET       | `/viewHistory`             | `X-Token` (请求头): String                                                                        | List<[`ChatHistory`](#chathistory)> (包含用户所有会话的所有历史)                                       | `code: 401, message: "认证失败"`                                              |
| 重置聊天历史 (根据 Token 和会话 ID)| GET       | `/resetHistory`            | `X-Token` (请求头): String, `conversationId` (可选, 查询参数): String                               | `message: "历史记录已重置"`                                                                                | `code: 401, message: "认证失败"`                                              |
| YOLOv10 图片检测接口 (供内部调用)   | POST      | `/detect_objects`          | `file` (表单数据): MultipartFile                                                                  | JSON (包含 `status`: String, `detections`: List<Map>, `result_image_url`: String)                     | JSON (包含 `status`: String, `message`: String)                                |

## AI 健康建议查询 (`/ai-suggestions-specific`)

| 功能描述                             | HTTP 方法 | 访问路径                        | 输入参数 (请求头/查询参数)                                                         | 输出参数 (成功)                                                                                    | 输出参数 (失败)                          |
| :----------------------------------- | :-------- | :------------------------------ | :--------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :--------------------------------------- |
| 分页查询当前用户的建议列表         | GET       | `/ai-suggestions-specific/page` | `X-Token` (请求头): String, `pageNo`: Long, `pageSize`: Long (查询参数)              | `Map<String, Object>` (包含 `total`: Long, `rows`: List<[`AiSuggestionsSpecific`](#aisuggestionsspecific)>) | `message: "认证失败"`                     |
| 获取用户最新的历史健康建议         | GET       | `/ai-suggestions-specific/historical` | `X-Token` (请求头): String                                                           | `Map<String, Object>` (包含 `suggestion`: String, `generatedAt`: LocalDateTime)                  | `message: "认证失败"/"未找到历史健康建议"` |
| 获取用户最新的当前健康建议         | GET       | `/ai-suggestions-specific/current`  | `X-Token` (请求头): String                                                           | `Map<String, Object>` (包含 `suggestion`: String, `generatedAt`: LocalDateTime)                  | `message: "认证失败"/"未找到当前健康建议"` |
| 获取用户最新的运动信息建议         | GET       | `/ai-suggestions-specific/sport`    | `X-Token` (请求头): String                                                           | `Map<String, Object>` (包含 `suggestion`: String, `generatedAt`: LocalDateTime)                  | `message: "认证失败"/"未找到运动信息建议"` |
| AI 流式获取运动信息建议            | GET       | `/ai-suggestions-specific/sportStream` | `X-Token` (请求头): String, `conversationId` (可选, 查询参数): String              | SSE 事件流 (`message`: String, `error`: String)                                                  | SSE 事件流 (`error`) 或 HTTP 错误         |

## 数据对象定义

### User

| 字段名        | 类型          | 描述                     |
| :------------ | :------------ | :----------------------- |
| `id`          | Integer       | 用户 ID (主键, 自增)     |
| `username`    | String        | 用户名                   |
| `password`    | String        | 密码 (数据库存储加密值) |
| `email`       | String        | 邮箱                     |
| `phone`       | String        | 手机号                   |
| `status`      | Integer       | 状态 (1: 启用, 0: 禁用)  |
| `avatar`      | String        | 头像 URL                 |
| `deleted`     | Integer       | 删除标记 (0: 未删除, 1: 已删除) |
| `roleIdList`  | List<Integer> | (仅请求/响应) 角色 ID 列表 |
| `newPassword` | String        | (仅请求) 用于修改密码    |

### Body

| 字段名             | 类型    | 描述                 |
| :----------------- | :------ | :------------------- |
| `id`               | Integer | 体征记录 ID (主键, 自增) |
| `name`             | String  | 用户姓名             |
| `age`              | Integer | 年龄                 |
| `gender`           | String  | 性别                 |
| `height`           | Double  | 身高 (cm)            |
| `weight`           | Double  | 体重 (kg)            |
| `bloodSugar`       | Double  | 血糖 (mmol/L)        |
| `bloodPressure`    | String  | 血压 (例如 "120/80") |
| `bloodLipid`       | String  | 血脂 (例如 "正常")   |
| `heartRate`        | Double  | 静息心率 (次/分钟)    |
| `vision`           | Integer | 视力 (例如 50 代表 5.0)|
| `sleepDuration`    | Double  | 睡眠时长 (小时)      |
| `sleepQuality`     | String  | 睡眠质量 (例如 "良好") |
| `smoking`          | Boolean | 是否吸烟             |
| `drinking`         | Boolean | 是否饮酒             |
| `exercise`         | Boolean | 是否规律运动         |
| `foodTypes`        | String  | 主要食物类型 (描述)  |
| `waterConsumption` | Double  | 日均饮水量 (L)       |

### BodyNotes

| 字段名             | 类型        | 描述                       |
| :----------------- | :---------- | :------------------------- |
| `id`               | Integer     | 用户 ID (外键, 关联 User.id) |
| `notesid`          | Integer     | 本记录 ID (主键, 自增)     |
| `name`             | String      | 用户姓名                   |
| `age`              | Integer     | 年龄                       |
| `gender`           | String      | 性别                       |
| `height`           | Double      | 身高 (cm)                  |
| `weight`           | Double      | 体重 (kg)                  |
| `bloodSugar`       | Double      | 血糖 (mmol/L)              |
| `bloodPressure`    | String      | 血压 (例如 "120/80")       |
| `bloodLipid`       | String      | 血脂 (例如 "正常")         |
| `heartRate`        | Double      | 静息心率 (次/分钟)          |
| `vision`           | Integer     | 视力 (例如 50 代表 5.0)    |
| `sleepDuration`    | Double      | 睡眠时长 (小时)            |
| `sleepQuality`     | String      | 睡眠质量 (例如 "良好")     |
| `smoking`          | Boolean     | 是否吸烟                   |
| `drinking`         | Boolean     | 是否饮酒                   |
| `exercise`         | Boolean     | 是否规律运动               |
| `foodTypes`        | String      | 主要食物类型 (描述)        |
| `waterConsumption` | Double      | 日均饮水量 (L)             |
| `Date`             | Date        | 记录日期                   |

### Role

| 字段名       | 类型          | 描述                     |
| :----------- | :------------ | :----------------------- |
| `roleId`     | Integer       | 角色 ID (主键, 自增)     |
| `roleName`   | String        | 角色名称                 |
| `roleDesc`   | String        | 角色描述                 |
| `menuIdList` | List<Integer> | (仅请求/响应) 菜单 ID 列表 |

### Menu

| 字段名      | 类型           | 描述                                   |
| :---------- | :------------- | :------------------------------------- |
| `menuId`    | Integer        | 菜单 ID (主键, 自增)                   |
| `component` | String         | 前端组件路径                           |
| `path`      | String         | 路由路径                               |
| `redirect`  | String         | 重定向路径                             |
| `name`      | String         | 路由名称                               |
| `title`     | String         | 菜单标题                               |
| `icon`      | String         | 菜单图标                               |
| `parentId`  | Integer        | 父菜单 ID (0 表示顶级菜单)             |
| `isLeaf`    | String         | 是否叶子节点 ("Y"/"N")                |
| `hidden`    | Boolean        | 是否隐藏菜单                           |
| `children`  | List<[`Menu`](#menu)> | (仅响应) 子菜单列表 (用于构建树形结构) |
| `meta`      | Map<String, Object> | (仅响应) 路由元信息 (包含 `title`, `icon`) |

### SportInfo

| 字段名             | 类型    | 描述                   |
| :----------------- | :------ | :--------------------- |
| `id`               | Integer | 运动信息 ID (主键, 自增) |
| `sportType`        | String  | 运动类型 (例如 "跑步") |
| `suitableTime`     | String  | 适宜时长 (描述)        |
| `suitableHeartRate`| String  | 适宜心率范围 (描述)    |
| `suitableFrequency`| String  | 适宜频率 (描述)        |
| `recommendedSpeed` | String  | 建议速度/强度 (描述)   |

### Detail

| 字段名      | 类型    | 描述                     |
| :---------- | :------ | :----------------------- |
| `id`        | Integer | 运动详情 ID (主键, 自增) |
| `sportType` | String  | 运动类型 (外键, 关联 SportInfo) |
| `disease`   | String  | 适宜/禁忌疾病 (描述)   |
| `method`    | String  | 具体方法/技巧 (描述)   |
| `notes`     | String  | 注意事项 (描述)        |

### AiSuggestionsSpecific

| 字段名                     | 类型          | 描述                                   |
| :------------------------- | :------------ | :------------------------------------- |
| `id`                       | Integer       | 建议 ID (主键, 自增)                   |
| `userId`                   | Integer       | 用户 ID (外键, 关联 User.id)         |
| `suggestionHistoricalHealth` | String        | 历史健康建议内容                       |
| `suggestionCurrentHealth`  | String        | 当前健康建议内容                       |
| `suggestionSportInfo`      | String        | 运动信息建议内容                       |
| `generatedAt`              | LocalDateTime | 建议生成时间                           |

### ChatHistory

| 字段名         | 类型          | 描述                     |
| :------------- | :------------ | :----------------------- |
| `id`           | Long          | 记录 ID (主键, 自增)     |
| `userId`       | Integer       | 用户 ID (外键, 关联 User.id) |
| `conversationId`| String        | 对话 ID                  |
| `role`         | String        | 角色 ("user"/"assistant") |
| `content`      | String        | 消息内容                 |
| `timestamp`    | LocalDateTime | 消息时间                 |
| `createdAt`    | LocalDateTime | 记录创建时间             |


**注意:**

*   `Unification<T>` 是一个通用的返回结果包装类，通常包含 `code` (状态码, 20000 代表成功), `message` (消息), 和 `data` (实际数据)。
*   所有需要认证的接口都需要在请求头中携带 `X-Token`。
*   `Map<String, Object>` 通常表示一个灵活的 JSON 对象，具体字段可能根据接口和上下文变化。
*   时间日期类型 (`Date`, `LocalDateTime`) 在 JSON 中通常表示为 ISO 8601 格式的字符串。
*   部分接口的失败情况未在表格中完全列出，请参考代码或实际调用。
*   AI 相关接口依赖外部服务 (OpenAI/DeepSeek, YOLOv10 API, Cloudflare R2) 的可用性。
