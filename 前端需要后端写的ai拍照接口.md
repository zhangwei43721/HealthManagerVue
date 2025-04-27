# AI健康问答拍照接口文档

## 1. 图片上传接口

### 接口描述
该接口用于AI健康问答页面上传用户拍摄或选择的图片，并获取AI对图片的分析结果。

### 请求信息
- **URL**: `/api/ai/upload-photo`
- **方法**: POST
- **请求头**:
  ```
  Content-Type: multipart/form-data
  X-Token: <用户认证令牌>
  ```

### 请求参数
| 参数名 | 类型 | 是否必须 | 描述 |
| ----- | ---- | ------- | ---- |
| photo | File | 是 | 用户上传的图片文件，支持jpg、jpeg、png格式 |
| userId | String | 是 | 用户ID |
| conversationId | String | 否 | 当前对话ID，如果是在已有对话中上传则需提供 |

### 响应信息
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "imageId": "img_12345678",
    "imageUrl": "https://example.com/images/img_12345678.jpg",
    "analysis": {
      "initialResponse": "根据您上传的图片，我可以看到这是一张健康相关的图片。请问您有什么具体问题？",
      "detectedObjects": ["食物", "蔬菜", "水果"],
      "healthMetrics": {
        "estimatedCalories": 350,
        "nutritionInfo": {
          "protein": "高",
          "carbs": "中",
          "fat": "低"
        }
      }
    }
  }
}
```

### 响应参数说明
| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | Number | 状态码，200表示成功 |
| message | String | 响应消息 |
| data.imageId | String | 上传图片的唯一标识符 |
| data.imageUrl | String | 上传图片的访问URL |
| data.analysis.initialResponse | String | AI对图片的初步分析回复 |
| data.analysis.detectedObjects | Array | 图片中检测到的对象列表 |
| data.analysis.healthMetrics | Object | 健康相关的指标数据，根据图片内容可能有所不同 |

### 错误码
| 错误码 | 描述 |
| ----- | ---- |
| 400 | 请求参数错误 |
| 401 | 未授权，Token无效 |
| 413 | 文件大小超出限制 |
| 415 | 不支持的文件类型 |
| 500 | 服务器内部错误 |

## 2. 图片分析结果获取接口

### 接口描述
该接口用于获取已上传图片的AI分析结果，可用于异步处理大型图片或复杂分析任务。

### 请求信息
- **URL**: `/api/ai/photo-analysis/{imageId}`
- **方法**: GET
- **请求头**:
  ```
  X-Token: <用户认证令牌>
  ```

### 请求参数
| 参数名 | 类型 | 是否必须 | 描述 |
| ----- | ---- | ------- | ---- |
| imageId | String | 是 | 图片ID，从上传接口返回 |

### 响应信息
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "status": "completed",
    "analysis": {
      "detailedResponse": "根据您上传的食物图片，我可以看到这是一份均衡的餐食，包含了足够的蛋白质和蔬菜。这样的饮食习惯有助于维持健康的体重和提供必要的营养。您可能想知道这餐的卡路里含量大约为350卡路里，蛋白质含量较高，碳水化合物含量适中，脂肪含量较低。",
      "healthAdvice": "建议您继续保持这样的饮食结构，同时可以适当增加全谷物的摄入。",
      "nutritionBreakdown": {
        "calories": 350,
        "protein": 25,
        "carbs": 40,
        "fat": 10,
        "fiber": 8,
        "vitamins": ["A", "C", "E"]
      }
    }
  }
}
```

### 响应参数说明
| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | Number | 状态码，200表示成功 |
| message | String | 响应消息 |
| data.status | String | 分析状态：pending（处理中）、completed（已完成）、failed（失败） |
| data.analysis | Object | 分析结果对象，仅在status为completed时存在 |
| data.analysis.detailedResponse | String | AI对图片的详细分析回复 |
| data.analysis.healthAdvice | String | 基于图片内容的健康建议 |
| data.analysis.nutritionBreakdown | Object | 详细的营养成分分析，根据图片内容可能有所不同 |

### 错误码
| 错误码 | 描述 |
| ----- | ---- |
| 400 | 请求参数错误 |
| 401 | 未授权，Token无效 |
| 404 | 图片不存在或已过期 |
| 500 | 服务器内部错误 |

## 3. 使用说明

1. 前端在用户上传图片时，首先调用**图片上传接口**，将图片文件和用户信息发送到服务器。
2. 服务器接收图片后，会返回图片ID和初步分析结果。
3. 对于复杂的图片分析，前端可以使用返回的图片ID，调用**图片分析结果获取接口**获取更详细的分析结果。
4. 前端应处理各种可能的错误情况，如文件过大、格式不支持等。
5. 建议前端在上传前进行图片压缩，以提高上传速度和减少服务器负担。

## 4. 安全注意事项

1. 所有接口调用必须包含有效的用户认证令牌（X-Token）。
2. 上传的图片大小限制为5MB。
3. 仅支持jpg、jpeg、png格式的图片文件。
4. 服务器会对上传的图片进行安全检查，过滤不适当的内容。
5. 用户上传的图片将按照隐私政策进行处理，不会用于训练AI模型或其他商业用途。