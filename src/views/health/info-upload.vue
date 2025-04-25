<template>
  <div class="info-upload-container">
    <div class="info-upload-card">
      <div class="header">
        <h1 class="title">身体信息上传</h1>
        <p class="subtitle">请填写您的身体健康数据，以便生成个性化健康报告</p>
      </div>

      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="120px"
        class="form"
        size="medium"
      >

      <!-- 分组标题：基本信息 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-user"></i>
          <span>基本信息</span>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名">
                <template #prefix><i class="el-icon-user"></i></template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" :min="0" :max="120" controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 分组标题：身体指标 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-data-line"></i>
          <span>身体指标</span>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="身高" prop="height">
              <!-- 修改: max, step, precision, 和 unit -->
              <el-input-number v-model="form.height" :min="50" :max="250" :step="1" :precision="0" controls-position="right">
              </el-input-number>
              <span class="unit">cm</span> <!-- 修改: 单位改为 cm -->
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="体重" prop="weight">
              <el-input-number v-model="form.weight" :min="0" :max="500" :step="0.1" :precision="1" controls-position="right">
              </el-input-number>
              <span class="unit">kg</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 分组标题：生理指标 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-first-aid-kit"></i>
          <span>生理指标</span>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="血糖" prop="bloodSugar">
              <el-input-number v-model="form.bloodSugar" :min="0" :step="0.1" :precision="1" controls-position="right">
              </el-input-number>
              <span class="unit">mmol/L</span>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
             <!-- 注意: 血压通常为 "收缩压/舒张压" 格式，InputNumber 可能不适用，但按要求保留 -->
            <el-form-item label="血压" prop="bloodPressure">
              <el-input-number v-model="form.bloodPressure" :min="0" :step="1" controls-position="right">
              </el-input-number>
              <span class="unit">mmHg</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <!-- 注意：这里标签是胆固醇，字段是 bloodLipid (血脂)，确认是否匹配 -->
            <el-form-item label="血脂" prop="bloodLipid">
              <el-input-number v-model="form.bloodLipid" :min="0" :step="0.1" :precision="1" controls-position="right">
              </el-input-number>
              <span class="unit">mmol/L</span>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="心率" prop="heartRate">
              <el-input-number v-model="form.heartRate" :min="0" :max="250" controls-position="right">
              </el-input-number>
              <span class="unit">BPM</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
             <!-- 注意: 视力单位是 "度" (屈光度)，InputNumber 允许小数 -->
            <el-form-item label="视力" prop="vision">
               <el-input-number v-model="form.vision" :min="0" :step="25" :precision="0" controls-position="right"> <!-- step 设为 25 (常见近视度数间隔)，precision 0 -->
              </el-input-number>
              <span class="unit">度</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 分组标题：生活习惯 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-s-operation"></i>
          <span>生活习惯</span>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="睡眠时长" prop="sleepDuration">
              <el-input-number v-model="form.sleepDuration" :min="0" :max="24" :step="0.5" :precision="1" controls-position="right">
              </el-input-number>
              <span class="unit">h</span>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="睡眠质量" prop="sleepQuality">
              <el-radio-group v-model="form.sleepQuality">
                <el-radio label="好">好</el-radio>
                <el-radio label="一般">一般</el-radio>
                <el-radio label="差">差</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="饮水量" prop="waterConsumption">
              <el-input-number v-model="form.waterConsumption" :min="0" :step="100" controls-position="right">
              </el-input-number>
              <span class="unit">ml</span>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="食物偏好" prop="foodTypes">
              <el-select v-model="form.foodTypes" placeholder="请选择">
                <el-option label="均衡" value="均衡"></el-option>
                <el-option label="蔬菜" value="蔬菜"></el-option>
                <el-option label="水果" value="水果"></el-option>
                <el-option label="肉类" value="肉类"></el-option>
                <el-option label="鱼类" value="鱼类"></el-option>
                <el-option label="豆类" value="豆类"></el-option>
                <el-option label="谷物" value="谷物"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-form-item label="是否吸烟" prop="smoking">
              <el-switch v-model="form.smoking" active-color="#ff4949" inactive-color="#13ce66" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="是否饮酒" prop="drinking">
              <el-switch v-model="form.drinking" active-color="#ff4949" inactive-color="#13ce66" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="是否运动" prop="exercise">
              <el-switch v-model="form.exercise" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="submitForm()" icon="el-icon-upload" :loading="loading">提交数据</el-button>
        <el-button @click="resetForm('form')" icon="el-icon-refresh-left">重置表单</el-button>
      </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import FunctionApi from "@/api/Function_Menu";
import AvatarUpload from "@/components/HeadImage/AvatarUpload";
import userApi from "@/api/userManage";

export default {
  name: "InfoUpload",
  components: {
    AvatarUpload, // 注意：模板中并未使用 AvatarUpload 组件，但这里保留了引入
  },
  data() {
    return {
      loading: false,
      // 修改: 添加了合理的预设数据
      form: {
        id: null, // id 通常由后端或登录信息确定，初始为 null
        name: "张三", // 预设姓名
        age: 30, // 预设年龄
        gender: "男", // 预设性别
        height: 175, // 预设身高 (cm)
        weight: 70.5, // 预设体重 (kg)
        bloodSugar: 5.8, // 预设血糖 (mmol/L)
        bloodPressure: 120, // 预设血压 (mmHg - InputNumber 只能接受单个数字)
        bloodLipid: 4.5, // 预设血脂 (mmol/L) - 标签为胆固醇，需确认指标
        heartRate: 72, // 预设心率 (BPM)
        vision: 0, // 预设视力 (度 - 0 代表无近视)
        sleepDuration: 7.5, // 预设睡眠时长 (h)
        sleepQuality: "一般", // 预设睡眠质量
        smoking: false, // 预设是否吸烟
        drinking: true, // 预设是否饮酒
        exercise: true, // 预设是否运动
        foodTypes: "均衡", // 预设食物偏好
        waterConsumption: 2000, // 预设饮水量 (ml)
      },

      rules: {
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" },
        ],
        age: [
          { required: true, message: "请输入年龄", trigger: "blur" },
          { type: "number", message: "年龄必须为数字值", trigger: 'blur' }, // 触发改为 blur 更好
          { validator: (rule, value, callback) => { // 年龄范围校验
              if (value < 0 || value > 120) {
                callback(new Error('年龄必须在 0 到 120 之间'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        gender: [{ required: true, message: "请选择性别", trigger: "change" }],
        height: [
          { required: true, message: "请输入身高", trigger: "blur" },
          { type: "number", message: "身高必须为数字值", trigger: 'blur' },
          { validator: (rule, value, callback) => { // 身高范围校验 (cm)
              if (value < 50 || value > 250) {
                callback(new Error('身高必须在 50 到 250 cm 之间'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        weight: [
          { required: true, message: "请输入体重", trigger: "blur" },
          { type: "number", message: "体重必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 体重范围校验
              if (value <= 0 || value > 500) { // 体重必须大于0
                callback(new Error('请输入有效的体重值'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        // 为其他数字输入添加更具体的验证规则 (可选但推荐)
        bloodSugar: [
          { required: true, message: "请输入血糖", trigger: "blur" },
          { type: "number", message: "血糖必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 血糖范围示例
              if (value < 0 || value > 50) {
                callback(new Error('请输入合理的血糖值 (0-50 mmol/L)'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
         bloodPressure: [
          { required: true, message: "请输入血压值", trigger: "blur" }, // 提示可以更通用
          { type: "number", message: "血压必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 血压范围示例 (单个值)
              if (value < 30 || value > 300) {
                callback(new Error('请输入合理的血压值 (30-300 mmHg)'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        bloodLipid: [
          { required: true, message: "请输入血脂值", trigger: "blur" },
          { type: "number", message: "血脂必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 血脂范围示例
              if (value < 0 || value > 20) {
                callback(new Error('请输入合理的血脂值 (0-20 mmol/L)'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        heartRate: [
          { required: true, message: "请输入心率", trigger: "blur" },
          { type: "number", message: "心率必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 心率范围示例
              if (value < 0 || value > 250) {
                callback(new Error('请输入合理的心率 (0-250 BPM)'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        vision: [
          { required: true, message: "请输入视力(近视度数)", trigger: "blur" }, // 标签说明是度数
          { type: "number", message: "视力必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 视力(度数)范围示例
              if (value < 0 || value > 3000) { // 允许0和正数
                callback(new Error('请输入合理的近视度数 (0-3000 度)'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
         sleepDuration: [
           { required: false, message: "请输入睡眠时长", trigger: "blur" }, // 睡眠时长可以非必填
           { type: "number", message: "睡眠时长必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 睡眠时长范围
              if (value !== null && (value < 0 || value > 24)) { // 允许 null
                callback(new Error('睡眠时长必须在 0 到 24 小时之间'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
         ],
        sleepQuality: [
          { required: true, message: "请选择睡眠质量", trigger: "change", },
        ],
        // switch 类型的 required 验证意义不大，因为它们总是有 true/false 值，
        // 但如果业务要求必须明确选择过，可以保留
        smoking: [
          // { required: true, message: "请选择是否吸烟", trigger: "change" },
        ],
        drinking: [
          // { required: true, message: "请选择是否饮酒", trigger: "change" },
        ],
        exercise: [
         // { required: true, message: "请选择是否运动", trigger: "change" },
        ],
        foodTypes: [
          { required: true, message: "请选择食物偏好", trigger: "change" }, // trigger 改为 change
        ],
        waterConsumption: [
          { required: true, message: "请输入饮水量", trigger: "blur" },
          { type: "number", message: "饮水量必须为数字值", trigger: 'blur' },
           { validator: (rule, value, callback) => { // 饮水量范围
              if (value < 0 || value > 10000) { // 允许0
                callback(new Error('请输入合理的饮水量 (0-10000 ml)'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
      },
      id: null, // 添加 id 属性以存储 getUserId 获取的值
    };
  },

  methods: {
    submitForm() {
      // 确保在提交前将 this.id 赋值给 form.id
      if (this.id !== null && this.form.id === null) {
          this.form.id = this.id;
      } else if (this.form.id === null) {
          console.error("用户ID未获取，无法提交表单");
          this.$message.error('用户身份信息获取失败，无法提交');
          return; // 阻止提交
      }


      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;

          // 并行调用两个API
          Promise.all([
            FunctionApi.BodyInformation(this.form),
            FunctionApi.BodyInformationNotes(this.form) // 假设这个 API 也需要 form 数据
          ])
            .then(([bodyInfoResponse, /* notesResponse */]) => { // 可以接收两个 response
              // 成功提示
              this.$notify({
                title: '成功',
                message: '身体信息上传成功！您现在可以查看健康评估报告了。',
                type: 'success',
                duration: 3000
              });

              // 可以添加跳转到健康评估报告页面
              setTimeout(() => {
                // 确保路由路径正确
                 this.$router.push({ name: 'HealthAssessment' }); // 使用命名路由更佳
                // 或者 this.$router.push('/health/assessment');
              }, 1500);
            })
            .catch((error) => {
              console.error("上传数据失败:", error); // 打印详细错误
              this.$notify({
                title: '错误',
                // 尝试从 error 对象获取更具体的错误信息
                message: error?.response?.data?.message || error?.message || '上传数据失败，请稍后重试',
                type: 'error',
                duration: 4000 // 错误消息显示时间长一点
              });
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          this.$message({
            message: '表单校验失败，请检查输入项', // 提示更具体
            type: 'warning'
          });
          return false;
        }
      });
    },


    // 重置表单数据的方法
    resetForm(formName) {
      this.$refs[formName].resetFields();
      // 重置后，可以考虑是否需要重新填充预设数据或清空所有
      // 如果希望重置为初始预设值，可以这样做：
      // Object.assign(this.form, this.$options.data().form);
      // 但要注意保留 id
      const initialForm = this.$options.data().form;
      for (const key in initialForm) {
        if (key !== 'id') { // 不重置 id
          this.form[key] = initialForm[key];
        }
      }
       // 确保重置后 id 仍然是当前用户的 id
      if (this.id !== null) {
          this.form.id = this.id;
      }

      this.$message({
        message: "表单已重置为预设值", // 提示信息修改
        type: "info",
      });
    },


    async getUserId() {
        try {
            const response = await userApi.getUserId();
            // 如果请求成功并且返回的数据包含 id 属性
            if (response && response.data && response.data.id !== undefined) {
                const userId = parseInt(response.data.id);
                if (!isNaN(userId)) {
                    this.id = userId;
                    // 获取到 id 后，也更新 form 中的 id (如果 form.id 还是 null)
                    if (this.form.id === null) {
                         this.form.id = this.id;
                    }
                    console.log("获取到用户ID:", this.id);
                } else {
                     console.error("获取到的用户ID无效:", response.data.id);
                     this.$message.error('获取用户身份信息失败 (ID无效)');
                }
            } else {
                 console.error("获取用户ID的响应格式不正确:", response);
                 this.$message.error('获取用户身份信息失败 (响应格式错误)');
            }
        } catch (error) {
            console.error("获取用户ID失败:", error);
            this.$message.error(`获取用户身份信息失败: ${error.message || '网络错误'}`);
            // 这里可以根据错误类型决定是否阻止用户操作
        }
    },
  },

  created() {
    // 在组件创建时调用 getUserId 获取用户 ID
    this.getUserId();
     // 注意：预设值现在直接在 data 中定义，不需要在 created 中设置
  },
};
</script>
  
<style scoped>
/* 容器样式 */
.info-upload-container {
  min-height: 100vh;
  padding: 30px;
  background-color: #f8f9fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.info-upload-card {
  max-width: 1000px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  animation: fadeIn 0.5s ease-in-out;
}

/* 标题样式 */
.header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

/* 表单样式 */
.form {
  margin: 0 auto;
}

/* 表单分组样式 */
.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.section-title i {
  margin-right: 10px;
  font-size: 20px;
}

/* 表单项样式 */
.el-form-item {
  margin-bottom: 22px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.unit {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

/* 开关样式 */
.el-switch {
  margin-right: 8px;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.form-actions .el-button {
  padding: 12px 25px;
  font-size: 16px;
  margin: 0 15px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .info-upload-card {
    padding: 20px 15px;
  }
  
  .form-section {
    padding: 15px;
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }
  
  .form-actions .el-button {
    padding: 10px 20px;
    font-size: 14px;
    margin: 0 10px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

  