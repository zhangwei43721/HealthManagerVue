- # 用户头像上传与管理 - API测试文档

  ## 1. 用户专用头像上传接口

  ### 接口信息
  - **URL**: `/file/user/avatar/upload`
  - **方法**: POST
  - **Content-Type**: multipart/form-data

  ### 请求参数

  | 参数名 | 类型    | 必填 | 说明                                  |
  | ------ | ------- | ---- | ------------------------------------- |
  | file   | File    | 是   | 头像文件，支持jpg、jpeg、png、gif格式 |
  | userId | Integer | 是   | 用户ID                                |

  ### 响应格式

  ```json
  {
    "code": 200,
    "msg": "用户头像上传成功",
    "data": {
      "url": "http://localhost:9401/images/avatar/user_1_1627456789123.jpg",
      "filename": "user_1_1627456789123.jpg"
    }
  }
  ```

  ### 错误码说明

  | 错误码 | 说明                                    |
  | ------ | --------------------------------------- |
  | 400    | 无效的用户ID                            |
  | 400    | 参数文件为空                            |
  | 400    | 文件为空                                |
  | 400    | 文件不能大于50MB                        |
  | 400    | 只允许上传jpg、jpeg、png、gif格式的图片 |
  | 500    | 服务器错误：无法创建存储目录            |
  | 500    | 更新用户头像信息失败                    |
  | 500    | 用户头像保存失败                        |

  ### 测试用例

  1. **正常上传头像**
     - 请求：上传有效图片文件，提供合法用户ID
     - 预期结果：返回200状态码，头像URL和文件名

  2. **无效用户ID测试**
     - 请求：上传图片但提供无效的用户ID（如-1或不提供）
     - 预期结果：返回400状态码，错误消息"无效的用户ID"

  3. **空文件测试**
     - 请求：提供用户ID但上传空文件
     - 预期结果：返回400状态码，错误消息"文件为空"

  4. **超大文件测试**
     - 请求：提供用户ID并上传超过50MB的文件
     - 预期结果：返回400状态码，错误消息"文件不能大于50MB"

  5. **不支持文件格式测试**
     - 请求：提供用户ID并上传非图片格式文件（如.txt、.pdf）
     - 预期结果：返回400状态码，错误消息"只允许上传jpg、jpeg、png、gif格式的图片"

  ## 2. 用户头像更新服务

  ### 方法信息
  - **方法**: `updateUserAvatar(Integer userId, String avatarUrl)`
  - **服务类**: `UserServiceImpl`

  ### 参数说明

  | 参数名    | 类型    | 必填 | 说明        |
  | --------- | ------- | ---- | ----------- |
  | userId    | Integer | 是   | 用户ID      |
  | avatarUrl | String  | 是   | 头像URL地址 |

  ### 返回值
  - **类型**: boolean
  - **说明**: 头像更新是否成功

  ### 业务逻辑
  1. 检查用户ID是否存在于数据库
  2. 如果用户存在，更新其头像URL
  3. 如果用户不存在，返回失败
  4. 记录头像更新的日志信息

  ### 测试用例

  1. **正常更新头像**
     - 输入：有效用户ID和有效头像URL
     - 预期结果：返回true，用户头像URL更新成功，日志显示更新成功

  2. **用户不存在测试**
     - 输入：不存在的用户ID和有效头像URL
     - 预期结果：返回false，日志显示"用户不存在，无法更新头像"

  3. **无效URL测试**
     - 输入：有效用户ID和无效URL（如null或空字符串）
     - 预期结果：头像更新为无效URL，但方法执行成功

  ## 3. 文件存储与访问说明

  ### 存储位置
  - 头像文件存储在服务器的`classpath:/images/avatar/`目录下

  ### 文件命名规则
  - 通用头像上传：`{timestamp}.{extension}`
  - 用户专用头像上传：`user_{userId}_{timestamp}.{extension}`

  ### 访问路径
  - URL格式：`http://localhost:{serverPort}/images/avatar/{filename}`
  - 示例：`http://localhost:9402/images/avatar/user_1_1627456789123.jpg`

  ### 配置说明
  - WebMvcConfig类已配置静态资源映射，确保头像可通过URL访问

  ## 4. 注意事项

  1. 新注册用户默认头像为`http://localhost:9402/avatar-user.jpg`
  2. 确保服务器上的`classpath:/images/avatar/`目录存在并可写入
  3. 头像文件推荐尺寸：200px × 200px
  4. 上传头像后，数据库会自动更新用户的头像URL
  5. 建议定期清理未使用的头像文件，避免占用过多存储空间

  ## 5. API调用示例

  ### cURL示例
  ```bash
  curl -X POST \
    http://localhost:9402/file/user/avatar/upload \
    -H 'Content-Type: multipart/form-data' \
    -F 'file=@/path/to/avatar.jpg' \
    -F 'userId=1'
  ```

  ### 前端调用示例
  ```javascript
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('userId', '1');
  
  fetch('http://localhost:9402/file/user/avatar/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
  ```