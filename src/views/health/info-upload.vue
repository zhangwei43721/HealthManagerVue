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
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="姓名" prop="name">
            <el-input
              v-model="form.name"
              :placeholder="'请输入姓名'"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="form.age" :min="0"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="身高/m" prop="height">
            <el-input-number v-model="form.height" :min="0" :step="0.1"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="体重/kg" prop="weight">
            <el-input-number v-model="form.weight" :min="0"></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="血糖" prop="bloodSugar">
            <el-input-number
              v-model="form.bloodSugar"
              :min="0"
              :step="0.1"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="血压" prop="bloodPressure">
            <el-input-number
              v-model="form.bloodPressure"
              :min="0"
              :step="0.1"
            ></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="胆固醇" prop="bloodLipid">
            <el-input-number
              v-model="form.bloodLipid"
              :min="0"
              :step="0.1"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="心率/BPM" prop="heartRate">
            <el-input-number
              v-model="form.heartRate"
              :min="0"
            ></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="视力/d" prop="vision">
            <el-input-number v-model="form.vision" :min="0" :step="0.1"></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="睡眠时长/h" prop="sleepDuration">
            <el-input-number
              v-model="form.sleepDuration"
              :min="0"
              :step="0.1"
            ></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="睡眠质量" prop="sleepQuality">
            <el-radio-group v-model="form.sleepQuality">
              <el-radio :label="'好'">好</el-radio>
              <el-radio :label="'一般'">一般</el-radio>
              <el-radio :label="'差'">差</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="是否吸烟" prop="smoking">
            <el-switch v-model="form.smoking"></el-switch>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="是否饮酒" prop="drinking">
            <el-switch v-model="form.drinking"></el-switch>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="是否运动" prop="exercise">
            <el-switch v-model="form.exercise"></el-switch>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="喜好的食物种类" prop="foodTypes">
            <el-select v-model="form.foodTypes" placeholder="请选择">
              <el-option label="蔬菜" value="蔬菜"></el-option>
              <el-option label="水果" value="水果"></el-option>
              <el-option label="肉类" value="肉类"></el-option>
              <el-option label="鱼类" value="鱼类"></el-option>
              <el-option label="豆类" value="豆类"></el-option>
              <el-option label="谷物" value="谷物"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="饮水量/ml" prop="waterConsumption">
            <el-input-number
              v-model="form.waterConsumption"
              :min="0"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

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
              <el-input-number v-model="form.height" :min="0" :max="3" :step="0.01" :precision="2" controls-position="right">
              </el-input-number>
              <span class="unit">m</span>
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
            <el-form-item label="血压" prop="bloodPressure">
              <el-input-number v-model="form.bloodPressure" :min="0" :step="1" controls-position="right">
              </el-input-number>
              <span class="unit">mmHg</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="胆固醇" prop="bloodLipid">
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
            <el-form-item label="视力" prop="vision">
              <el-input-number v-model="form.vision" :min="0" :step="0.1" :precision="1" controls-position="right">
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
    AvatarUpload,
  },
  data() {
    return {
      loading: false,
      form: {
        id: null,
        name: "",
        age: null,
        gender: "",
        height: "",
        weight: "",
        bloodSugar: "",
        bloodPressure: "",
        bloodLipid: "",
        heartRate: null,
        vision: null,
        sleepDuration: null,
        sleepQuality: "",
        smoking: false,
        drinking: false,
        exercise: false,
        foodTypes: "",
        waterConsumption: null,
      },

      rules: {
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        age: [
          { required: true, message: "请输入年龄", trigger: "blur" },
          { type: "number", message: "年龄必须为数字值" },
        ],
        gender: [{ required: true, message: "请选择性别", trigger: "change" }],
        height: [
          { required: true, message: "请输入身高", trigger: "blur" },
          { type: "number", message: "身高必须为数字值" },
        ],
        weight: [
          { required: true, message: "请输入体重", trigger: "blur" },
          { type: "number", message: "体重必须为数字值" },
        ],
        bloodSugar: [
          { required: true, message: "请输入血糖", trigger: "blur" },
          { type: "number", message: "血糖必须为数字值" },
        ],
        bloodPressure: [
          { required: true, message: "请输入血压", trigger: "blur" },
          { type: "number", message: "血压必须为数字值" },
        ],
        bloodLipid: [
          { required: true, message: "请输入血脂", trigger: "blur" },
          { type: "number", message: "血脂必须为数字值" },
        ],

        heartRate: [
          { required: true, message: "请输入心率", trigger: "blur" },
          { type: "number", message: "心率必须为数字值" },
        ],
        vision: [
          { required: true, message: "请输入视力", trigger: "blur" },
          { type: "number", message: "视力必须为数字值" },
        ],
        sleepQuality: [
          {
            required: true,
            message: "请选择睡眠质量",
            trigger: "change",
          },
        ],
        smoking: [
          { required: true, message: "请选择是否吸烟", trigger: "change" },
        ],
        drinking: [
          { required: true, message: "请选择是否饮酒", trigger: "change" },
        ],
        exercise: [
          { required: true, message: "请选择是否运动", trigger: "change" },
        ],
        foodTypes: [
          { required: true, message: "请选择摄入较多的食物种类", trigger: "blur" },
        ],
        waterConsumption: [
          { required: true, message: "请输入饮水量", trigger: "blur" },
          { type: "number", message: "饮水量必须为数字值" },
        ],
      },
    };
  },

  methods: {
  submitForm() {
    // 如果表单数据中没有 id 属性，则将组件的 id 属性赋值给表单数据的 id 属性
    if (!this.form.id) {
      this.form.id = this.id;
    }

    this.$refs.form.validate((valid) => {
      if (valid) {
        this.loading = true;
        
        // 并行调用两个API
        Promise.all([
          FunctionApi.BodyInformation(this.form),
          FunctionApi.BodyInformationNotes(this.form)
        ])
          .then(([bodyInfoResponse]) => {
            // 成功提示
            this.$notify({
              title: '成功',
              message: '身体信息上传成功！您现在可以查看健康评估报告了。',
              type: 'success',
              duration: 3000
            });
            
            // 可以添加跳转到健康评估报告页面
            setTimeout(() => {
              this.$router.push('/health/assessment');
            }, 1500);
          })
          .catch((error) => {
            this.$notify({
              title: '错误',
              message: error.message || '上传数据失败，请稍后重试',
              type: 'error',
              duration: 3000
            });
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.$message({
          message: '请填写必要的信息',
          type: 'warning'
        });
        return false;
      }
    });
  },


  // 重置表单数据的方法
  resetForm(formName) {
    this.$refs[formName].resetFields();
    console.log(this.id);
    this.$message({
      message: "表单已重置",
      type: "info",
    });
  },


  async getUserId() {
    await userApi.getUserId().then((response) => {
      // 如果请求成功并且返回的数据包含 id 属性，则将其转换为整数并赋值给组件的 id 属性
      if (response && response.data) {
        this.id = parseInt(response.data.id);
      }
    });
  },
},

  created() {
    this.getUserId();
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

  