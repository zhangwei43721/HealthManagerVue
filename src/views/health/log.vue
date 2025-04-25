<template>
  <div class="log-container">
    <!-- 顶部标题与说明 -->
    <div class="log-header">
      <h1 class="main-title">健康数据日志</h1>
      <p class="subtitle">管理并回顾您的身体健康信息，支持多维度筛选与操作</p>
    </div>

    <!-- 搜索与操作区 -->
    <div class="log-toolbar">
      <el-input
        v-model="searchModel.keyword"
        placeholder="输入姓名、手机号等关键字搜索"
        prefix-icon="el-icon-search"
        class="search-input"
        clearable
        @keyup.enter.native="searchBodyList"
        @clear="searchBodyList"
      >
        <el-button slot="append" type="primary" icon="el-icon-search" @click="searchBodyList">搜索</el-button>
      </el-input>
      <el-button type="primary" icon="el-icon-plus" @click="openAddUi">添加记录</el-button>
    </div>

    <!-- 数据区 -->
    <el-card class="log-card" shadow="hover">
      <el-table
        :data="bodyList"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        element-loading-text="数据加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        highlight-current-row
        :header-cell-style="{background:'#f5f7fa', color:'#606266', fontWeight: 'bold'}"
        :row-class-name="tableRowClassName"
      >
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-row :gutter="20" class="expanded-row">
              <el-col :span="24">
                <div class="health-summary">
                  <h4>健康指标概要</h4>
                  <el-tag :type="getHealthStatus(props.row)" effect="plain" class="health-tag" size="small">
                    {{ getHealthStatus(props.row) === 'success' ? '健康状态良好' :
                       getHealthStatus(props.row) === 'warning' ? '健康状态一般' : '健康状态需注意' }}
                  </el-tag>
                </div>
              </el-col>
              <el-col :xs="24" :sm="8">
                <div class="detail-item">
                  <span class="detail-label">血糖：</span>
                  <span class="detail-value">{{ props.row.bloodSugar || '-' }}</span>
                </div>
              </el-col>
              <el-col :xs="24" :sm="8">
                <div class="detail-item">
                  <span class="detail-label">血压：</span>
                  <span class="detail-value">{{ props.row.bloodPressure || '-' }}</span>
                </div>
              </el-col>
              <el-col :xs="24" :sm="8">
                <div class="detail-item">
                  <span class="detail-label">血脂：</span>
                  <span class="detail-value">{{ props.row.bloodLipid || '-' }}</span>
                </div>
              </el-col>
              <el-col :xs="24" :sm="8">
                <div class="detail-item">
                  <span class="detail-label">视力：</span>
                  <span class="detail-value">{{ props.row.vision || '-' }}</span>
                </div>
              </el-col>
              <el-col :xs="24" :sm="8">
                <div class="detail-item">
                  <span class="detail-label">饮水量：</span>
                  <span class="detail-value">{{ props.row.waterConsumption ? props.row.waterConsumption + ' ml' : '-' }}</span>
                </div>
              </el-col>
              <el-col :xs="24" :sm="8">
                <div class="detail-item">
                  <span class="detail-label">喜好食物：</span>
                  <span class="detail-value">{{ Array.isArray(props.row.foodTypes) ? props.row.foodTypes.join(', ') : (props.row.foodTypes || '-') }}</span>
                </div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index" label="序号" width="60" align="center" fixed="left" />
        <el-table-column prop="name" label="姓名" min-width="120" fixed="left">
          <template slot-scope="scope">
            <div class="user-info">
              <el-avatar :size="30" icon="el-icon-user-solid" style="background-color: #409EFF;"></el-avatar>
              <span class="user-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="基本信息" align="center">
            <el-table-column prop="date" label="上传时间" width="120" :formatter="formatDate" align="center" />
            <el-table-column prop="age" label="年龄" width="70" align="center" />
            <el-table-column prop="gender" label="性别" width="80" align="center">
                <template slot-scope="scope">
                   <i :class="scope.row.gender === '男' ? 'el-icon-male' : (scope.row.gender === '女' ? 'el-icon-female' : '')"
                      :style="{ color: getGenderColor(scope.row.gender), fontSize: '16px' }"></i>
                   {{ scope.row.gender }}
                </template>
            </el-table-column>
        </el-table-column>

        <el-table-column label="身体指标" align="center">
            <el-table-column prop="height" label="身高" width="90" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.height || '-' }} <small v-if="scope.row.height">cm</small></span>
              </template>
            </el-table-column>
            <el-table-column prop="weight" label="体重" width="90" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.weight || '-' }} <small v-if="scope.row.weight">kg</small></span>
              </template>
            </el-table-column>
            <el-table-column prop="heartRate" label="心率" width="100" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.heartRate || '-' }} <small v-if="scope.row.heartRate">次/分</small></span>
              </template>
            </el-table-column>
        </el-table-column>

        <el-table-column label="生活习惯" align="center">
          <el-table-column prop="sleepDuration" label="睡眠时长" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.sleepDuration || '-' }} <small v-if="scope.row.sleepDuration">h</small></span>
            </template>
          </el-table-column>
          <el-table-column prop="sleepQuality" label="睡眠质量" width="100" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="getSleepQualityType(scope.row.sleepQuality)"
                effect="light"
                size="small"
              >
                {{ getSleepQualityText(scope.row.sleepQuality) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table-column>

         <el-table-column label="健康习惯" align="center">
           <el-table-column prop="smoking" label="吸烟" width="80" align="center">
             <template slot-scope="{ row }">
               <el-tag
                 :type="row.smoking ? 'danger' : 'success'"
                 effect="plain"
                 size="small"
               >
                 {{ row.smoking ? "是" : "否" }}
               </el-tag>
             </template>
           </el-table-column>
           <el-table-column prop="drinking" label="饮酒" width="80" align="center">
             <template slot-scope="{ row }">
               <el-tag
                 :type="row.drinking ? 'danger' : 'success'"
                 effect="plain"
                 size="small"
               >
                 {{ row.drinking ? "是" : "否" }}
               </el-tag>
             </template>
           </el-table-column>
           <el-table-column prop="exercise" label="运动" width="80" align="center">
             <template slot-scope="{ row }">
               <el-tag
                 :type="row.exercise ? 'success' : 'danger'"
                 effect="plain"
                 size="small"
               >
                 {{ row.exercise ? "是" : "否" }}
               </el-tag>
             </template>
           </el-table-column>
         </el-table-column>


        <el-table-column
          label="操作"
          width="140"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button @click="openEditUi(scope.row)" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button @click="deleteBodyRecord(scope.row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- 自定义空状态显示 -->
        <template #empty>
           <div class="empty-state">
             <i class="el-icon-document-remove empty-icon"></i>
             <div class="empty-title">{{ loading ? '数据加载中...' : '暂无健康日志数据' }}</div>
             <div v-if="!loading" class="empty-subtitle">请先添加数据或调整筛选条件</div>
           </div>
         </template>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        v-if="total > 0"
        style="text-align: center; margin-top: 20px;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
      :fullscreen="isMobile"
      top="5vh"
      destroy-on-close
      class="body-dialog"
      :close-on-click-modal="false"
      @close="clearForm"
     >
      <!-- 绑定动态的 label-position 和 label-width -->
      <el-form :model="bodyForm" ref="bodyFormRef" :rules="rules" :label-position="isMobile ? 'top' : 'right'" :label-width="isMobile ? 'auto' : formLabelWidth" class="body-form">

        <!-- 基本信息 Sección -->
        <div class="form-section">
          <h3 class="section-title"><i class="el-icon-user"></i> 基本信息</h3>
           <el-row :gutter="20">
             <!-- 使用 xs/sm 控制列在不同屏幕上的宽度 -->
             <el-col :xs="24" :sm="12">
               <el-form-item label="姓名" prop="name">
                 <el-input v-model="bodyForm.name" autocomplete="off" placeholder="请输入姓名"></el-input>
               </el-form-item>
             </el-col>
             <el-col :xs="24" :sm="12">
               <el-form-item label="年龄" prop="age">
                 <el-input v-model.number="bodyForm.age" type="number" :min="1" :max="150" autocomplete="off" placeholder="请输入年龄"></el-input>
               </el-form-item>
             </el-col>
             <el-col :xs="24" :sm="12">
                <el-form-item label="性别" prop="gender">
                  <el-select v-model="bodyForm.gender" placeholder="请选择性别" style="width: 100%;">
                     <el-option label="男" value="男"></el-option>
                     <el-option label="女" value="女"></el-option>
                     <el-option label="其他" value="其他"></el-option>
                  </el-select>
               </el-form-item>
            </el-col>
           </el-row>
        </div>

        <!-- 身体指标 Sección -->
         <div class="form-section">
           <h3 class="section-title"><i class="el-icon-sugar"></i> 身体指标</h3>
            <el-row :gutter="20">
               <el-col :xs="24" :sm="12">
                 <el-form-item label="身高(cm)" prop="height">
                   <el-input v-model.number="bodyForm.height" type="number" :min="0" step="0.1" autocomplete="off" placeholder="请输入身高"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :xs="24" :sm="12">
                 <el-form-item label="体重(kg)" prop="weight">
                   <el-input v-model.number="bodyForm.weight" type="number" :min="0" step="0.1" autocomplete="off" placeholder="请输入体重"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :xs="24" :sm="12">
                 <el-form-item label="血糖" prop="bloodSugar">
                   <el-input v-model="bodyForm.bloodSugar" autocomplete="off" placeholder="例如: 5.5 mmol/L"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :xs="24" :sm="12">
                 <el-form-item label="血压" prop="bloodPressure">
                   <el-input v-model="bodyForm.bloodPressure" autocomplete="off" placeholder="例如: 120/80 mmHg"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :xs="24" :sm="12">
                 <el-form-item label="血脂" prop="bloodLipid">
                   <el-input v-model="bodyForm.bloodLipid" autocomplete="off" placeholder="例如: 正常/偏高"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :xs="24" :sm="12">
                 <el-form-item label="心率/分钟" prop="heartRate">
                   <el-input v-model.number="bodyForm.heartRate" type="number" :min="0" autocomplete="off" placeholder="例如: 75"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :xs="24" :sm="12">
                 <el-form-item label="视力" prop="vision">
                   <el-input v-model="bodyForm.vision" autocomplete="off" placeholder="例如: 1.0/1.0 或 5.0/5.0"></el-input>
                 </el-form-item>
               </el-col>
            </el-row>
         </div>

        <!-- 生活习惯 Sección -->
         <div class="form-section">
           <h3 class="section-title"><i class="el-icon-edit-outline"></i> 生活习惯</h3>
            <el-row :gutter="20">
               <el-col :xs="24" :sm="12">
                 <el-form-item label="睡眠时长(h)" prop="sleepDuration">
                   <el-input v-model.number="bodyForm.sleepDuration" type="number" :min="0" step="0.5" autocomplete="off" placeholder="例如: 8"></el-input>
                 </el-form-item>
               </el-col>
               <el-col :xs="24" :sm="12">
                 <el-form-item label="睡眠质量" prop="sleepQuality">
                   <el-radio-group v-model.number="bodyForm.sleepQuality">
                     <el-radio :label="1">好</el-radio>
                     <el-radio :label="2">一般</el-radio>
                     <el-radio :label="3">差</el-radio>
                   </el-radio-group>
                 </el-form-item>
               </el-col>
                <el-col :xs="24" :sm="12">
                 <el-form-item label="饮水量(ml)" prop="waterConsumption">
                     <el-input v-model.number="bodyForm.waterConsumption" type="number" :min="0" autocomplete="off" placeholder="例如: 1500"></el-input>
                 </el-form-item>
                </el-col>
                 <!-- 如果需要对齐，可以在这里加一个空的el-col :xs="0" :sm="12" -->
            </el-row>
            <el-row :gutter="20">
                <!-- 将开关放在各自的列中，sm=24 强制堆叠 -->
                <el-col :xs="24" :sm="24">
                  <el-form-item label="是否吸烟" prop="smoking">
                    <!-- 使用 flex 布局让 label 和 switch 在 content 区域内对齐 -->
                    <div class="form-item-content-flex">
                        <span class="switch-label">否</span> <!-- 额外添加 '否' 文字 -->
                        <el-switch v-model="bodyForm.smoking"></el-switch>
                         <span class="switch-label">是</span> <!-- 额外添加 '是' 文字 -->
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24">
                  <el-form-item label="是否喝酒" prop="drinking">
                     <div class="form-item-content-flex">
                        <span class="switch-label">否</span>
                        <el-switch v-model="bodyForm.drinking"></el-switch>
                        <span class="switch-label">是</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24">
                  <el-form-item label="是否运动" prop="exercise">
                     <div class="form-item-content-flex">
                         <span class="switch-label">否</span>
                         <el-switch v-model="bodyForm.exercise"></el-switch>
                         <span class="switch-label">是</span>
                     </div>
                  </el-form-item>
                </el-col>
            </el-row>
             <el-row :gutter="20">
               <el-col :xs="24" :sm="24">
                 <el-form-item label="喜好食物" prop="foodTypes">
                   <el-select v-model="bodyForm.foodTypes" placeholder="选择摄入较多的食物(可多选)" multiple filterable style="width: 100%;">
                     <el-option label="蔬菜" value="蔬菜"></el-option>
                     <el-option label="水果" value="水果"></el-option>
                     <el-option label="肉类" value="肉类"></el-option>
                     <el-option label="鱼类" value="鱼类"></el-option>
                     <el-option label="豆类" value="豆类"></el-option>
                     <el-option label="谷物" value="谷物"></el-option>
                     <el-option label="其他" value="其他"></el-option>
                   </el-select>
                 </el-form-item>
               </el-col>
             </el-row>
         </div>

         <!-- 表单底部提示 -->
         <div class="form-tips">
            <i class="el-icon-info"></i>
            <span>请填写准确的身体数据，以便系统提供更精准的健康建议</span>
          </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitBodyForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userApi from "@/api/userManage";

// 定义表单的初始结构，用于重置
const defaultBodyForm = {
  notesid: null, // 用于区分是新增还是编辑
  name: '',
  age: null,
  gender: '',
  height: null,
  weight: null,
  bloodSugar: '',
  bloodPressure: '',
  bloodLipid: '',
  heartRate: null,
  vision: '',
  sleepDuration: null,
  sleepQuality: null,
  smoking: false,
  drinking: false,
  exercise: false,
  foodTypes: [],
  waterConsumption: null,
  date: null
};

export default {
  name: 'HealthLog',
  data() {
    return {
      loading: false,
      bodyList: [],
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        keyword: '',
      },
      dialogFormVisible: false,
      dialogTitle: '',
      bodyForm: { ...defaultBodyForm },
      formLabelWidth: "100px",
      isMobile: false, // 新增：是否移动端
      // 表单验证规则 (按需添加或细化)
      rules: {
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        age: [
          { required: true, message: "请输入年龄", trigger: "blur" },
          { type: 'number', message: '年龄必须为数字值', trigger: 'blur'},
          { validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && (value <= 0 || value > 150)) { // Added undefined check
                callback(new Error('请输入有效的年龄 (1-150)'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        gender: [
          { required: true, message: "请选择性别", trigger: "change" }
        ],
        height: [
           { required: true, message: '请输入身高', trigger: 'blur' },
           { type: 'number', message: '身高必须为数字', trigger: 'blur' },
           { validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && (value <= 0 || value > 300)) { // Added undefined check
                 callback(new Error('请输入有效身高(cm)'));
               } else {
                 callback();
               }
             }, trigger: 'blur' }
        ],
         weight: [
           { required: true, message: '请输入体重', trigger: 'blur' },
           { type: 'number', message: '体重必须为数字', trigger: 'blur' },
           { validator: (rule, value, callback) => {
              if (value !== null && value !== undefined && (value <= 0 || value > 500)) { // Added undefined check
                 callback(new Error('请输入有效体重(kg)'));
               } else {
                 callback();
               }
             }, trigger: 'blur' }
        ],
        sleepDuration: [
             { type: 'number', message: '睡眠时长必须为数字', trigger: 'blur' },
        ],
        waterConsumption: [
            { type: 'number', message: '饮水量必须为数字', trigger: 'blur' },
        ],
        sleepQuality: [
           { required: true, message: '请选择睡眠质量', trigger: 'change' }
        ],
        foodTypes: [
            // Allow empty array if optional, add required if necessary
            // { type: 'array', message: '请选择喜好食物', trigger: 'change' }
        ]
      },
    };
  },
   computed: {
    // 动态计算弹窗宽度 (非全屏模式下)
    dialogWidth() {
      // 可以根据需要调整这里的宽度
      return this.isMobile ? '95%' : '550px'; // 保持原有的550px，或者给大屏更大的宽度如 '600px'
    }
  },
  methods: {
    // 获取数据列表
    getBodyList() {
      this.loading = true;
      // 提交 searchModel 对象，后端根据 keyword 过滤
      userApi.getUserBodyList(this.searchModel)
        .then((response) => {
          if (response && response.data) {
            // 确保 foodTypes 在展示时是数组，如果后端返回的是字符串
            const rows = response.data.rows ? response.data.rows.map(item => {
                if (typeof item.foodTypes === 'string') {
                     item.foodTypes = item.foodTypes ? item.foodTypes.split(',') : [];
                } else if (!Array.isArray(item.foodTypes)) {
                    item.foodTypes = [];
                }
                // 确保 sleepQuality 是数字
                 if (item.sleepQuality !== null && item.sleepQuality !== undefined) {
                     item.sleepQuality = Number(item.sleepQuality);
                 }
                return item;
            }) : [];

            this.bodyList = rows;
            this.total = response.data.total || 0;
          } else {
            this.bodyList = [];
            this.total = 0;
            this.$message.error('获取数据格式错误');
            console.error("Invalid response structure:", response);
          }
        })
        .catch(error => {
          console.error("获取健康数据失败:", error);
          this.$message.error('获取健康数据失败');
          this.bodyList = [];
          this.total = 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 搜索按钮点击事件
    searchBodyList() {
        this.searchModel.pageNo = 1;
        this.getBodyList();
    },

    // 打开新增弹窗
    openAddUi() {
      this.dialogTitle = '添加健康记录';
      // bodyForm 在 @close 事件中通过 clearForm 重置
      // Optionally set some default values for add form here if needed
       this.bodyForm = { ...defaultBodyForm }; // Start with default clean form
       this.bodyForm.gender = '男'; // Example: default gender
       this.bodyForm.sleepQuality = 2; // Example: default sleep quality '一般'
      this.dialogFormVisible = true;
    },

    // 打开编辑弹窗
    openEditUi(row) {
      if (!row || !row.notesid) {
          this.$message.error('无效的记录');
          return;
      }
      this.dialogTitle = '编辑健康信息';
      // 深拷贝 row 数据到 bodyForm，防止直接修改表格数据
      const formData = { ...row };
      // 确保 foodTypes 是数组
      if (typeof formData.foodTypes === 'string') {
        formData.foodTypes = formData.foodTypes ? formData.foodTypes.split(',') : [];
      } else if (!Array.isArray(formData.foodTypes)) {
         formData.foodTypes = [];
      }

      // 确保布尔值和数字类型正确
      formData.smoking = !!formData.smoking;
      formData.drinking = !!formData.drinking;
      formData.exercise = !!formData.exercise;
      formData.sleepQuality = formData.sleepQuality !== null && formData.sleepQuality !== undefined ? Number(formData.sleepQuality) : null; // 转换为数字或 null
      formData.age = formData.age !== null && formData.age !== undefined ? Number(formData.age) : null;
      formData.height = formData.height !== null && formData.height !== undefined ? Number(formData.height) : null;
      formData.weight = formData.weight !== null && formData.weight !== undefined ? Number(formData.weight) : null;
      formData.heartRate = formData.heartRate !== null && formData.heartRate !== undefined ? Number(formData.heartRate) : null;
      formData.sleepDuration = formData.sleepDuration !== null && formData.sleepDuration !== undefined ? Number(formData.sleepDuration) : null;
      formData.waterConsumption = formData.waterConsumption !== null && formData.waterConsumption !== undefined ? Number(formData.waterConsumption) : null;


      this.bodyForm = formData;
      this.dialogFormVisible = true;
    },

    // 提交表单（新增或修改）
    submitBodyForm() {
      this.$refs.bodyFormRef.validate((valid) => {
        if (valid) {
          // 处理 foodTypes 从数组转换回需要的格式（例如逗号分隔字符串）
          const submissionData = { ...this.bodyForm };
          if (Array.isArray(submissionData.foodTypes)) {
              submissionData.foodTypes = submissionData.foodTypes.join(',');
          }
           // 确保数字类型字段为数字，即使输入框是字符串
          submissionData.age = submissionData.age !== null && submissionData.age !== undefined ? Number(submissionData.age) : null;
          submissionData.height = submissionData.height !== null && submissionData.height !== undefined ? Number(submissionData.height) : null;
          submissionData.weight = submissionData.weight !== null && submissionData.weight !== undefined ? Number(submissionData.weight) : null;
          submissionData.heartRate = submissionData.heartRate !== null && submissionData.heartRate !== undefined ? Number(submissionData.heartRate) : null;
          submissionData.sleepDuration = submissionData.sleepDuration !== null && submissionData.sleepDuration !== undefined ? Number(submissionData.sleepDuration) : null;
          submissionData.waterConsumption = submissionData.waterConsumption !== null && submissionData.waterConsumption !== undefined ? Number(submissionData.waterConsumption) : null;
          submissionData.sleepQuality = submissionData.sleepQuality !== null && submissionData.sleepQuality !== undefined ? Number(submissionData.sleepQuality) : null;


          // 根据 bodyForm.notesid 判断是新增还是修改
          const apiCall = submissionData.notesid
                          ? userApi.updateUserBody(submissionData)
                          : userApi.addUserBody(submissionData);

          apiCall.then((response) => {
              this.$message({
                message: response.message || (submissionData.notesid ? '更新成功' : '添加成功'),
                type: "success",
              });
              this.dialogFormVisible = false;
              this.getBodyList();
            })
            .catch(error => {
              console.error("提交失败:", error);
              const errorMsg = error?.response?.data?.message || error.message || (submissionData.notesid ? '更新失败' : '添加失败');
              this.$message.error(errorMsg);
            });
        } else {
          console.log("表单验证失败");
          this.$message.warning('请检查表单必填项或格式');
          return false;
        }
      });
    },

    // 删除记录
    deleteBodyRecord(row) {
      if (!row || !row.notesid) {
         this.$message.error('无效的记录，无法删除');
         return;
      }
      this.$confirm(`确认删除姓名为 "${row.name || '该记录'}" 的这条健康记录吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          userApi.deleteUserBodyById(row.notesid).then((response) => {
            this.$message({
              type: "success",
              message: response.message || "删除成功!",
            });
            this.getBodyList();
          }).catch(error => {
            console.error("删除失败:", error);
            const errorMsg = error?.response?.data?.message || error.message || "删除失败";
            this.$message.error(errorMsg);
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    // 清理表单数据和校验状态
    clearForm() {
      this.bodyForm = { ...defaultBodyForm };
      this.$nextTick(() => {
        if (this.$refs.bodyFormRef) {
           this.$refs.bodyFormRef.clearValidate();
        }
      });
    },

    // 表格分页大小改变
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNo = 1;
      this.getBodyList();
    },

    // 表格当前页改变
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getBodyList();
    },

    // 格式化日期显示
    formatDate(row, column, cellValue) {
      if (!cellValue) return '-';
      try {
        const date = new Date(cellValue);
        if (isNaN(date.getTime())) {
            return cellValue;
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) {
        console.error("日期格式化错误:", cellValue, e);
        return cellValue;
      }
    },

    // --- 新增用于表格样式的方法 ---
    tableRowClassName({row, rowIndex}) {
      if (row.smoking || row.drinking || row.sleepQuality === 3) {
        return 'warning-row';
      }
      if (row.exercise) {
        return 'success-row';
      }
      return '';
    },

    getHealthStatus(row) {
      const hasWarningHabit = row.smoking || row.drinking || row.sleepQuality === 3;
      if (hasWarningHabit) {
        return 'danger';
      } else if (!row.exercise || row.sleepQuality === 2) {
        return 'warning';
      } else {
        return 'success';
      }
    },

    getSleepQualityType(quality) {
      const qualityNum = Number(quality);
      if (qualityNum === 1) return 'success';
      if (qualityNum === 2) return 'warning';
      if (qualityNum === 3) return 'danger';
      return 'info';
    },

    getSleepQualityText(quality) {
      const qualityNum = Number(quality);
      if (qualityNum === 1) return '好';
      if (qualityNum === 2) return '一般';
      if (qualityNum === 3) return '差';
      return '-';
    },

    getGenderColor(gender) {
        switch (gender) {
            case '男': return '#409EFF';
            case '女': return '#F56C6C';
            default: return '#909399';
        }
    },
     // --- 结束新增方法 ---

     // --- 新增响应式相关方法 ---
    checkWindowSize() {
      this.isMobile = window.innerWidth < 768;
    }
    // --- 结束新增响应式相关方法 ---

  },
  created() {
    this.getBodyList();
  },
   mounted() {
    this.checkWindowSize();
    window.addEventListener('resize', this.checkWindowSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkWindowSize);
  }
};
</script>

<style scoped>
.log-container {
  padding: 20px;
  min-height: calc(100vh - 50px);
  background-color: #f8f9fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.log-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 40px 20px 25px 20px;
  color: #fff;
  text-align: center;
  margin-bottom: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}
.main-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 300;
}

.log-toolbar {
  max-width: 1200px;
  margin: 0 auto 20px auto;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 0;
}
.search-input {
  width: 300px;
  margin-right: auto;
}

.log-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  overflow: hidden;
  background: #fff;
  padding: 20px;
}

/* --- 表格样式 START --- */
.el-table {
  margin-bottom: 15px;
}

/* 解决表格和卡片边框重叠问题 */
.el-table--border::after, .el-table--group::after, .el-table::before {
    background-color: #EBEEF5;
}
.el-table--border, .el-table--group {
    border-color: #EBEEF5;
}
/* header-cell-style prop handles表头样式 */
/* .el-table th.el-table__cell { ... } */

.el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf {
    border-bottom: 1px solid #EBEEF5;
}
.el-table--border .el-table__cell {
    border-right: 1px solid #EBEEF5;
}

/* 表格行样式 */
.el-table .warning-row {
  background-color: rgba(245, 108, 108, 0.08);
}
.el-table .success-row {
  background-color: rgba(103, 194, 58, 0.08);
}
/* Add hover effect for rows */
.el-table__row:hover {
    background-color: #f2f6fc !important;
}


/* 用户信息样式 (姓名列) */
.user-info {
  display: flex;
  align-items: center;
}
.user-name {
  margin-left: 10px;
  font-weight: 500;
}
/* Avatar color set inline */


/* 展开行样式 */
.expanded-row {
  padding: 15px 20px;
  background-color: #f9fafc;
  border-radius: 4px;
  margin: 10px 0;
  border: 1px solid #ebeef5;
}

.health-summary {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.health-summary h4 {
  margin: 0;
  font-size: 15px;
  color: #303133;
}


.detail-item {
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #ebeef5;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  margin-right: 5px;
}

.detail-value {
  color: #303133;
}

/* Gender icon style and tag styles set inline or via methods */


/* --- 表格样式 END --- */


/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}
.empty-icon {
  font-size: 50px;
  margin-bottom: 15px;
}
.empty-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 8px;
}
.empty-subtitle {
  color: #606266;
  font-size: 14px;
}

/* --- 弹窗样式 START --- */
.body-dialog .el-dialog__body {
  padding: 20px 30px; /* Add padding inside dialog body */
  overflow-y: auto; /* Add scroll if content overflows vertically */
  max-height: 70vh; /* Limit max height to leave space for header/footer */
}

.body-form .form-section {
  margin-bottom: 25px; /* Space between sections */
  padding-bottom: 15px;
  border-bottom: 1px dashed #ebeef5; /* Section separator */
}

.body-form .form-section:last-of-type {
    border-bottom: none; /* No border for the last section */
    margin-bottom: 15px; /* Adjust margin after last section */
}

.body-form .section-title {
  font-size: 16px;
  color: #409EFF; /* Title color */
  margin: 0 0 15px 0;
  padding-left: 10px;
  border-left: 3px solid #409EFF; /* Left border as a visual cue */
  display: flex; /* Align icon and text */
  align-items: center;
}
.body-form .section-title i {
    margin-right: 8px; /* Space between icon and text */
    font-size: 18px;
}

.form-tips {
  background-color: #f0f9eb; /* Light green background */
  padding: 10px 15px;
  border-radius: 4px;
  color: #67c23a; /* Green text */
  display: flex;
  align-items: center;
  margin-top: 15px;
  font-size: 13px;
}

.form-tips i {
  margin-right: 8px;
  font-size: 16px;
}


/* Adjust input/select/number/radio/switch group width inside el-col */
.el-dialog .el-select,
.el-dialog .el-input,
.el-dialog .el-input-number,
.el-dialog .el-radio-group {
  width: 100%; /* Ensure these elements take full width of their column */
}

/* Specific style for switch items content area */
.body-form .form-item-content-flex {
    display: flex;
    align-items: center;
    /* Use flex-grow on switch or let it size naturally, others flex-shrink */
    /* Justifying content might also be needed depending on desired spacing */
}

/* Style for the "是" / "否" labels next to the switch */
.body-form .form-item-content-flex .switch-label {
    font-size: 14px; /* Match default form item text size */
    color: #606266; /* Match default label color */
    margin: 0 5px; /* Space around the switch text */
    flex-shrink: 0; /* Prevent text from shrinking */
}

/* 弹窗底部按钮居中 */
.dialog-footer {
    text-align: center;
    padding-top: 10px; /* Add some padding above buttons */
}

/* --- 弹窗样式 END --- */


/* --- 响应式调整 START --- */
@media (max-width: 768px) {
  /* General layout adjustments */
  .log-header { padding: 25px 10px 15px 10px; }
  .main-title { font-size: 1.6rem; }
  .subtitle { font-size: 0.9rem; }
  .log-toolbar {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
  }
  .search-input {
      width: 100%;
      margin-right: 0;
  }
  .log-card, .log-toolbar {
      max-width: 98vw;
      padding: 15px;
  }

  /* Dialog specific adjustments */
  .body-dialog .el-dialog__body {
      padding: 15px 20px; /* Reduce padding on small screens */
      max-height: 80vh; /* Allow more height on mobile if fullscreen is not used */
  }

  /* Form specific adjustments for mobile */
  /* When label-position is 'top', adjust padding/margin */
  .el-form--label-top .el-form-item__label {
     padding: 0 0 5px; /* Adjust padding */
     margin: 0; /* Remove margin */
     width: auto !important; /* Let width be determined by content */
     text-align: left !important; /* Labels align left when on top */
  }

   .el-form--label-top .el-form-item__content {
      margin-left: 0 !important; /* Remove the left margin */
   }

   /* Adjust expanded row layout */
   .expanded-row .el-col {
       margin-bottom: 10px;
   }

   /* Adjust spacing within form sections on small screens */
   .body-form .el-row {
       margin-left: -5px !important; /* Reduce gutter effect if needed */
       margin-right: -5px !important;
   }
   .body-form .el-row > .el-col {
       padding-left: 5px !important;
       padding-right: 5px !important;
   }

   /* Ensure switch labels and switch are inline on mobile when label is on top */
   .el-form--label-top .form-item-content-flex {
        justify-content: flex-start; /* Align items to the start */
        /* Consider adding space between them */
        gap: 5px; /* Add gap between flex items */
   }
}
/* --- 响应式调整 END --- */

</style>