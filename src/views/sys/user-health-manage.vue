<template>
  <div class="body-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">用户身体数据管理</h1>
      <p class="page-description">管理用户的身体健康数据，包括身高、体重、血压、血糖等各项指标</p>
    </div>
    
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-area">
        <div class="search-title">
          <i class="el-icon-search"></i>
          <span>搜索过滤</span>
        </div>
        <el-form :inline="true" :model="searchModel" class="search-form" @keyup.enter.native="getBodyList">
          <el-form-item label="昵称">
            <el-input
              v-model.trim="searchModel.name"
              placeholder="请输入用户昵称"
              prefix-icon="el-icon-user"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="ID">
            <el-input
              placeholder="请输入用户ID"
              v-model="searchModel.id"
              prefix-icon="el-icon-key"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="searchModel.gender" placeholder="请选择性别" clearable>
              <el-option label="男" value="男"></el-option>
              <el-option label="女" value="女"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="健康状态">
            <el-select v-model="searchModel.healthStatus" placeholder="请选择健康状态" clearable>
              <el-option label="良好" value="good"></el-option>
              <el-option label="一般" value="normal"></el-option>
              <el-option label="需注意" value="warning"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="search-buttons">
            <el-button
              type="primary"
              @click="getBodyList"
              :loading="listLoading"
            >查询</el-button>
            <el-button
              type="info"
              @click="resetSearch"
              icon="el-icon-refresh"
            >重置</el-button>
            <el-button
              type="success"
              @click="openAddUi"
              icon="el-icon-plus"
            >添加</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 结果列表 -->
    <el-card class="data-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>用户身体数据列表</span>
        <span class="data-count">共 {{ total }} 条记录</span>
      </div>
      
      <el-table 
        :data="bodyList" 
        stripe 
        :row-class-name="tableRowClassName"
        v-loading="listLoading" 
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        style="width: 100%"
        :header-cell-style="{background:'#f5f7fa', color:'#606266', fontWeight: 'bold'}"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-row :gutter="20" class="expanded-row">
              <el-col :span="24">
                <div class="health-summary">
                  <h4>健康指标概要</h4>
                  <el-tag :type="getHealthStatus(props.row)" effect="plain" class="health-tag">
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
                  <span class="detail-value">{{ props.row.foodTypes || '-' }}</span>
                </div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center" fixed="left"></el-table-column>
        <el-table-column prop="id" label="ID" width="60" align="center" fixed="left"></el-table-column>
        <el-table-column prop="name" label="昵称" min-width="100" fixed="left">
          <template slot-scope="scope">
            <div class="user-info">
              <el-avatar :size="30" icon="el-icon-user"></el-avatar>
              <span class="user-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="基本信息" align="center">
          <el-table-column prop="age" label="年龄" width="70" align="center"></el-table-column>
          <el-table-column prop="gender" label="性别" width="70" align="center">
            <template slot-scope="scope">
              <i :class="scope.row.gender === '男' ? 'el-icon-male' : 'el-icon-female'" 
                 :style="{color: scope.row.gender === '男' ? '#409EFF' : '#F56C6C', fontSize: '18px'}"></i>
              {{ scope.row.gender }}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="身体指标" align="center">
          <el-table-column prop="height" label="身高" width="90" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="'身高: ' + scope.row.height + ' cm'" placement="top" effect="light">
                <span>{{ scope.row.height }} cm</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="体重" width="90" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="'体重: ' + scope.row.weight + ' kg'" placement="top" effect="light">
                <span>{{ scope.row.weight }} kg</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="heartRate" label="心率" width="90" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="'心率: ' + scope.row.heartRate + ' 次/分'" placement="top" effect="light">
                <span>{{ scope.row.heartRate || '-' }} <small v-if="scope.row.heartRate">次/分</small></span>
              </el-tooltip>
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
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.smoking ? 'danger' : 'success'"
                effect="plain"
                size="small"
              >
                {{ scope.row.smoking ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="drinking" label="饮酒" width="80" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.drinking ? 'danger' : 'success'"
                effect="plain"
                size="small"
              >
                {{ scope.row.drinking ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="exercise" label="运动" width="80" align="center">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.exercise ? 'success' : 'danger'"
                effect="plain"
                size="small"
              >
                {{ scope.row.exercise ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template slot-scope="scope">
              <el-tooltip content="编辑" placement="top" :enterable="false">
                <el-button @click="openEditUi(scope.row.id)" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :enterable="false">
                <el-button @click="deleteBody(scope.row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        class="pagination"
      >
      </el-pagination>
    </el-card>

    <!-- 用户身体数据编辑弹出框 -->
    <el-dialog
      @close="clearForm"
      :title="title"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
      :fullscreen="isMobile"
      top="5vh"
      destroy-on-close
      class="body-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="bodyForm" ref="bodyFormRef" :rules="rules" label-width="100px" class="body-form">
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="昵称" prop="name">
                <el-input 
                  v-model="bodyForm.name" 
                  autocomplete="off"
                  placeholder="请输入用户昵称"
                  prefix-icon="el-icon-user"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="年龄" prop="age">
                <el-input-number 
                  v-model="bodyForm.age" 
                  :min="1" 
                  :max="120"
                  controls-position="right"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="bodyForm.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">身体指标</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="身高" prop="height">
                <el-input v-model="bodyForm.height" autocomplete="off">
                  <template slot="append">cm</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="体重" prop="weight">
                <el-input v-model="bodyForm.weight" autocomplete="off">
                  <template slot="append">kg</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="血糖" prop="bloodSugar">
                <el-input v-model="bodyForm.bloodSugar" autocomplete="off" placeholder="请输入血糖指标"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="血压" prop="bloodPressure">
                <el-input v-model="bodyForm.bloodPressure" autocomplete="off" placeholder="例如: 120/80 mmHg"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="血脂" prop="bloodLipid">
                <el-input v-model="bodyForm.bloodLipid" autocomplete="off" placeholder="请输入血脂指标"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="心率" prop="heartRate">
                <el-input v-model="bodyForm.heartRate" autocomplete="off">
                  <template slot="append">次/分</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="视力" prop="vision">
                <el-input v-model="bodyForm.vision" autocomplete="off" placeholder="例如: 5.0/5.0"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">生活习惯</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="睡眠时长" prop="sleepDuration">
                <el-input v-model="bodyForm.sleepDuration" autocomplete="off">
                  <template slot="append">h</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="睡眠质量" prop="sleepQuality">
                <el-radio-group v-model="bodyForm.sleepQuality">
                  <el-radio :label="1" :value="1">好</el-radio>
                  <el-radio :label="2" :value="2">一般</el-radio>
                  <el-radio :label="3" :value="3">差</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <el-form-item label="是否吸烟" prop="smoking">
                <el-switch
                  v-model="bodyForm.smoking"
                  active-color="#ff4949"
                  inactive-color="#13ce66"
                  active-text="是"
                  inactive-text="否"
                ></el-switch>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="是否饮酒" prop="drinking">
                <el-switch
                  v-model="bodyForm.drinking"
                  active-color="#ff4949"
                  inactive-color="#13ce66"
                  active-text="是"
                  inactive-text="否"
                ></el-switch>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="是否运动" prop="exercise">
                <el-switch 
                  v-model="bodyForm.exercise"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  active-text="是"
                  inactive-text="否"
                ></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="喜好食物" prop="foodTypes">
                <el-select
                  v-model="bodyForm.foodTypes"
                  placeholder="请选择摄入较多的食物种类"
                  style="width: 100%"
                >
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
              <el-form-item label="饮水量" prop="waterConsumption">
                <el-input v-model="bodyForm.waterConsumption" autocomplete="off">
                  <template slot="append">ml</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <div class="form-tips">
          <i class="el-icon-info"></i>
          <span>请填写准确的身体数据，以便系统提供更精准的健康建议</span>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateBody" :loading="saveLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userApi from "@/api/userManage";
export default {
  data() {
    return {
      bodyForm: {}, // 初始化为一个空对象
      bodyList: [],
      isMobile: false, // 是否移动端视图
      listLoading: false, // 列表加载状态
      saveLoading: false, // 保存按钮加载状态
      dialogFormVisible: false, // 弹窗可见性
      title: "", // 弹窗标题
      total: 0, // 总记录数
      searchModel: {
        name: '',
        id: '',
        pageNo: 1,
        pageSize: 10,
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: "请输入用户昵称", trigger: "blur" },
        ],
        age: [
          { required: true, message: "请输入年龄", trigger: "blur" },
          { type: 'number', message: '年龄必须为数字', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: "请选择性别", trigger: "change" },
        ],
        height: [
          { required: true, message: "请输入身高", trigger: "blur" },
        ],
        weight: [
          { required: true, message: "请输入体重", trigger: "blur" },
        ],
      },
    };
  },
  
  computed: {
    // 动态计算弹窗宽度
    dialogWidth() {
      return this.isMobile ? '95%' : '65%';
    }
  },

  methods: {
    // 检测窗口大小以适应响应式设计
    checkWindowSize() {
      this.isMobile = window.innerWidth < 768;
    },
    
    // 重置搜索条件
    resetSearch() {
      this.searchModel = {
        name: '',
        id: '',
        gender: '',
        healthStatus: '',
        pageNo: 1,
        pageSize: 10
      };
      this.getBodyList();
    },
    
    // 表格行样式
    tableRowClassName({row, rowIndex}) {
      // 根据健康指标设置行样式
      if (row.smoking || row.drinking) {
        return 'warning-row';
      }
      if (row.sleepQuality === 3) {
        return 'warning-row';
      }
      if (row.exercise) {
        return 'success-row';
      }
      return '';
    },
    
    // 获取健康状态标签类型
    getHealthStatus(row) {
      // 根据多个指标综合评估健康状态
      if (row.smoking || row.drinking || row.sleepQuality === 3) {
        return 'danger';
      } else if (!row.exercise || row.sleepQuality === 2) {
        return 'warning';
      } else {
        return 'success';
      }
    },
    
    // 保存用户身体数据
    updateBody() {
      this.saveLoading = true;
      this.$refs.bodyFormRef.validate((valid) => {
        if (valid) {
          // 提交数据给后台
          userApi.updateBody(this.bodyForm).then((response) => {
            // 成功提示
            this.$message({
              message: response.message || '保存成功',
              type: "success",
            });
            // 关闭对话框
            this.dialogFormVisible = false;
            // 刷新表格数据
            this.getBodyList();
            this.saveLoading = false;
          }).catch(error => {
            this.$message.error("保存失败: " + (error.message || "未知错误"));
            this.saveLoading = false;
          });
        } else {
          this.$message.warning("请填写必要的信息");
          this.saveLoading = false;
          return false;
        }
      });
    },

    // 清理表单数据
    clearForm() {
      this.bodyForm = {};
      // 清除表单校验的提示信息
      this.$nextTick(() => {
        this.$refs.bodyFormRef && this.$refs.bodyFormRef.clearValidate();
      });
    },
    
    // 处理每页显示数量变化
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getBodyList();
    },
    
    // 处理页码变化
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getBodyList();
    },

    // 获取用户身体数据列表
    getBodyList() {
      this.listLoading = true;
      
      // 创建一个新的搜索对象，只包含后端支持的字段
      const searchParams = {
        pageNo: this.searchModel.pageNo,
        pageSize: this.searchModel.pageSize
      };
      
      // 添加名称搜索
      if (this.searchModel.name) {
        searchParams.name = this.searchModel.name.trim();
      }
      
      // 添加ID搜索
      if (this.searchModel.id) {
        searchParams.id = this.searchModel.id.trim();
      }
      
      // 调用API获取数据
      userApi.getBodyList(searchParams).then((response) => {
        let filteredData = response.data.rows;
        
        // 客户端过滤性别
        if (this.searchModel.gender) {
          filteredData = filteredData.filter(item => item.gender === this.searchModel.gender);
        }
        
        // 客户端过滤健康状态
        if (this.searchModel.healthStatus) {
          filteredData = filteredData.filter(item => {
            const status = this.getHealthStatus(item);
            if (this.searchModel.healthStatus === 'good') return status === 'success';
            if (this.searchModel.healthStatus === 'normal') return status === 'warning';
            if (this.searchModel.healthStatus === 'warning') return status === 'danger';
            return true;
          });
        }
        
        this.bodyList = filteredData;
        this.total = filteredData.length;
        this.listLoading = false;
      }).catch(error => {
        this.$message.error("获取数据失败: " + (error.message || "未知错误"));
        this.listLoading = false;
      });
    },

    // 打开编辑弹窗
    openEditUi(id) {
      this.title = "修改身体信息";
      this.listLoading = true;
      // 根据id查询用户数据
      userApi.getBodyById(id).then((response) => {
        // 获取数据
        const data = response.data;
        
        // 确保睡眠质量是数字类型
        if (data.sleepQuality !== undefined) {
          data.sleepQuality = parseInt(data.sleepQuality, 10) || 2; // 如果转换失败，默认为一般(2)
        }
        
        // 确保布尔值正确
        data.smoking = !!data.smoking;
        data.drinking = !!data.drinking;
        data.exercise = !!data.exercise;
        
        this.bodyForm = data;
        this.dialogFormVisible = true;
        this.listLoading = false;
      }).catch(error => {
        this.$message.error("获取数据失败: " + (error.message || "未知错误"));
        this.listLoading = false;
      });
    },
    
    // 打开新增弹窗
    openAddUi() {
      this.title = "添加身体信息";
      this.bodyForm = {
        gender: '男',
        sleepQuality: 2,
        smoking: false,
        drinking: false,
        exercise: false
      };
      this.dialogFormVisible = true;
    },

    // 删除用户身体数据
    deleteBody(body) {
      this.$confirm(`确认删除 ${body.name || 'ID: ' + body.id} 的身体信息吗？`, "删除确认", {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(() => {
          this.listLoading = true;
          userApi.deleteBodyById(body.id).then((response) => {
            this.$message({
              type: "success",
              message: response.message || '删除成功',
              duration: 2000
            });
            this.getBodyList();
          }).catch(error => {
            this.$message.error("删除失败: " + (error.message || "未知错误"));
            this.listLoading = false;
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除操作",
          });
        });
    },
    
    // 格式化日期显示
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    
    // 获取睡眠质量的标签类型
    getSleepQualityType(quality) {
      // 将输入转换为数字
      const qualityNum = parseInt(quality, 10);
      
      if (qualityNum === 1) return 'success';
      if (qualityNum === 2) return 'warning';
      return 'danger';
    },
    
    // 获取睡眠质量的显示文本
    getSleepQualityText(quality) {
      // 将输入转换为数字
      const qualityNum = parseInt(quality, 10);
      
      if (qualityNum === 1) return '好';
      if (qualityNum === 2) return '一般';
      return '差';
    }
  },

  // 生命周期钩子
  created() {
    // 初始化加载数据
    this.getBodyList();
    // 检测窗口大小
    this.checkWindowSize();
  },
  
  mounted() {
    // 添加窗口大小变化监听器
    window.addEventListener('resize', this.checkWindowSize);
  },
  
  beforeDestroy() {
    // 移除窗口大小变化监听器
    window.removeEventListener('resize', this.checkWindowSize);
  },
};
</script>

<style scoped>
.search-area {
  padding: 10px;
}
.search-title {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}
.search-title i {
  margin-right: 5px;
  color: #409EFF;
}
.search-form .el-form-item {
  margin-bottom: 10px;
  margin-right: 15px;
}
.search-buttons {
  margin-left: auto;
}
.el-table {
  margin-bottom: 15px;
}
.el-table .warning-row {
  background-color: rgba(245, 108, 108, 0.1);
}
.el-table .success-row {
  background-color: rgba(103, 194, 58, 0.1);
}
.user-info {
  display: flex;
  align-items: center;
}
.user-name {
  margin-left: 10px;
  font-weight: 500;
}
.expanded-row {
  padding: 15px;
  background-color: #f9fafc;
  border-radius: 4px;
  margin: 10px;
}
.health-summary {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #dcdfe6;
}
.health-summary h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}
.health-tag {
  margin-right: 10px;
}
.detail-item {
  margin-bottom: 10px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.detail-label {
  font-weight: 500;
  color: #606266;
  margin-right: 5px;
}
.detail-value {
  color: #303133;
}
.body-dialog .el-dialog__body {
  padding: 20px 30px;
}
.body-form .form-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ebeef5;
}
.body-form .section-title {
  font-size: 16px;
  color: #409EFF;
  margin: 0 0 15px 0;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}
.form-tips {
  background-color: #f0f9eb;
  padding: 10px 15px;
  border-radius: 4px;
  color: #67c23a;
  display: flex;
  align-items: center;
  margin-top: 15px;
}
.form-tips i {
  margin-right: 5px;
  font-size: 16px;
}
@media screen and (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  .search-form .el-form-item {
    margin-right: 0;
  }
  .search-buttons {
    margin-left: 0;
    display: flex;
    justify-content: space-between;
  }
  .body-form .el-form-item__label {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 10px;
  }
  .body-form .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>