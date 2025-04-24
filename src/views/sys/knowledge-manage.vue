<template>
  <div class="sport-manage-container">
    <div class="page-header">
      <h1 class="page-title">运动信息管理</h1>
      <p class="page-description">管理各类运动的基本信息，包括运动频率、时间、速度和心率建议</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-row :gutter="20" type="flex" align="middle" justify="space-between">
        <el-col :xs="24" :sm="16" :md="18" :lg="18">
          <div class="search-controls">
            <el-input
              v-model.trim="searchModel.sportType"
              placeholder="输入运动类型搜索"
              prefix-icon="el-icon-search"
              clearable
              size="medium"
              class="search-input"
              @keyup.enter.native="getSportList"
            ></el-input>
            <el-button
              @click="getSportList"
              type="primary"
              icon="el-icon-search"
              :loading="listLoading"
              size="medium"
            >查询</el-button>
            <el-button
              @click="resetSearch"
              plain
              icon="el-icon-refresh"
              size="medium"
            >重置</el-button>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" :md="6" :lg="6" class="action-col">
           <el-button
            @click="openEditUi(null)"
            type="success"
            icon="el-icon-plus"
            size="medium"
            class="add-btn"
          >新增运动</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果列表 -->
    <el-card class="data-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>运动信息列表</span>
        <span class="data-count">共 {{total}} 条记录</span>
      </div>

      <el-table 
        :data="sportList" 
        stripe 
        v-loading="listLoading" 
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        style="width: 100%"
        :header-cell-style="{backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold'}"
        :row-class-name="tableRowClassName">
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          align="center">
        </el-table-column>
        <el-table-column
          prop="sportType"
          label="运动类型"
          min-width="120">
          <template slot-scope="scope">
            <el-tag size="medium" effect="plain" type="success">{{ scope.row.sportType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="suitableFrequency"
          label="运动频率"
          min-width="140">
        </el-table-column>
        <el-table-column
          prop="suitableTime"
          label="运动时间"
          min-width="140">
        </el-table-column>
        <el-table-column
          prop="recommendedSpeed"
          label="运动速度"
          min-width="140">
        </el-table-column>
        <el-table-column
          prop="suitableHeartRate"
          label="运动心率"
          min-width="140">
        </el-table-column>
        <el-table-column
          label="操作"
          width="160"
          align="center"
          fixed="right">
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button @click="openEditUi(scope.row.id)" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button @click="deleteSport(scope.row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-document"></i>
            <p>暂无运动信息数据</p>
            <el-button type="primary" @click="openEditUi(null)">添加运动信息</el-button>
          </div>
        </template>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        background
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 运动信息编辑/新增 弹窗 -->
    <el-dialog
      @close="clearForm"
      :title="title"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
      :fullscreen="isMobile"
      top="5vh"
      destroy-on-close
      class="sport-dialog"
      :close-on-click-modal="false">
      <el-form :model="sportForm" ref="sportFormRef" :rules="rules" label-width="100px" class="sport-form">
        <el-form-item label="运动类型" prop="sportType">
          <el-input 
            v-model="sportForm.sportType" 
            autocomplete="off"
            placeholder="请输入运动类型（如慢跑、游泳等）"
            maxlength="50"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="运动频率" prop="suitableFrequency">
          <el-input 
            v-model="sportForm.suitableFrequency" 
            autocomplete="off"
            placeholder="请输入建议的运动频率（如每周 3-5 次）"
            maxlength="100"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="运动时间" prop="suitableTime">
          <el-input 
            v-model="sportForm.suitableTime" 
            autocomplete="off"
            placeholder="请输入建议的运动时间（如每次 30-45 分钟）"
            maxlength="100"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="运动速度" prop="recommendedSpeed">
          <el-input 
            v-model="sportForm.recommendedSpeed" 
            autocomplete="off"
            placeholder="请输入建议的运动速度（如中等强度）"
            maxlength="100"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="运动心率" prop="suitableHeartRate">
          <el-input 
            v-model="sportForm.suitableHeartRate" 
            autocomplete="off"
            placeholder="请输入建议的运动心率范围（如 120-150 次/分钟）"
            maxlength="100"
            show-word-limit>
          </el-input>
        </el-form-item>
        <div class="form-tips">
          <i class="el-icon-info"></i>
          <span>请填写准确的运动信息，以便用户参考</span>
        </div>
      </el-form>
      <!-- 弹窗底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSport" :loading="saveLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import sportApi from "@/api/Function_Menu"; // 引入API模块

export default {
  name: 'SportManagement', // 组件名称
  data() {
    // 可根据需要添加更详细的校验规则
    const validateInput = (rule, value, callback, fieldName) => {
        if (!value) {
             return callback(new Error(`请输入${fieldName}`));
        }
        // 可选：添加长度或其他校验
        // if (value.length > 50) {
        //     return callback(new Error(`${fieldName}过长`));
        // }
        callback();
    }

    return {
      isMobile: false, // 是否移动端视图
      listLoading: false, // 列表加载状态
      saveLoading: false, // 保存按钮加载状态
      sportForm: { // 运动信息表单数据模型
        id: null,
        sportType: '',
        suitableFrequency: '',
        suitableTime: '',
        recommendedSpeed: '',
        suitableHeartRate: ''
      },
      sportList: [], // 列表数据
      dialogFormVisible: false, // 弹窗可见性
      title: "", // 弹窗标题
      total: 0, // 总记录数
      searchModel: { // 搜索条件
        sportType: '',
        pageNo: 1,
        pageSize: 10,
      },
      rules: { // 表单校验规则
        sportType: [ { required: true, validator: (rule, value, callback) => validateInput(rule, value, callback, '运动类型'), trigger: "blur" } ],
        suitableFrequency: [ { required: true, validator: (rule, value, callback) => validateInput(rule, value, callback, '运动频率'), trigger: "blur" } ],
        suitableTime: [ { required: true, validator: (rule, value, callback) => validateInput(rule, value, callback, '运动时间'), trigger: "blur" } ],
        recommendedSpeed: [ { required: true, validator: (rule, value, callback) => validateInput(rule, value, callback, '运动速度'), trigger: "blur" } ],
        suitableHeartRate: [ { required: true, validator: (rule, value, callback) => validateInput(rule, value, callback, '运动心率'), trigger: "blur" } ],
      },
    };
  },
  computed: {
      // 动态计算弹窗宽度
      dialogWidth() {
          return this.isMobile ? '95%' : '50%'; // 移动端更宽，PC端适中
      }
  },
  methods: {
    // 表格行样式
    tableRowClassName({row, rowIndex}) {
      return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
    },
    // 重置搜索条件
    resetSearch() {
      this.searchModel.sportType = '';
      this.searchModel.pageNo = 1;
      this.getSportList();
    },
    // 检查屏幕宽度
    checkScreenWidth() {
        this.isMobile = window.innerWidth < 768; // 阈值可调整
    },
    // 保存运动信息 (新增或修改)
    async saveSport() {
      try {
        // 1. 表单校验
        await this.$refs.sportFormRef.validate();
        this.saveLoading = true; // 开始加载

        // 2. 调用API保存
        const response = await sportApi.saveSport(this.sportForm);
        this.$message({
          message: response.message || (this.sportForm.id ? '修改成功' : '新增成功'),
          type: "success",
        });
        this.dialogFormVisible = false; // 关闭弹窗
        this.getSportList(); // 刷新列表

      } catch (error) {
        if (error === false) { // validate Promise reject(false)
          console.log("表单验证失败");
        } else {
           console.error("保存运动信息失败:", error);
           this.$message.error('操作失败，请稍后重试');
        }
      } finally {
        this.saveLoading = false; // 结束加载
      }
    },
    // 关闭弹窗时清空表单 (利用destroy-on-close，此方法主要用于显式调用)
    clearForm() {
      this.sportForm = { id: null, sportType: '', suitableFrequency: '', suitableTime: '', recommendedSpeed: '', suitableHeartRate: '' };
      // destroy-on-close 会处理校验状态的重置
    },
    // 处理每页显示条数变化
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNo = 1;
      this.getSportList();
    },
    // 处理当前页码变化
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getSportList();
    },
    // 获取运动信息列表数据
    async getSportList() {
      this.listLoading = true;
      try {
        const response = await sportApi.getSportList(this.searchModel);
        this.sportList = response.data.rows;
        this.total = response.data.total;
      } catch (error) {
        console.error("获取运动信息列表失败:", error);
        this.$message.error('获取列表失败');
        this.sportList = [];
        this.total = 0;
      } finally {
        this.listLoading = false;
      }
    },
    // 打开新增/编辑弹窗
    async openEditUi(id) {
      // this.clearForm(); // destroy-on-close 会处理

      if (id == null) {
        this.title = "新增运动信息";
        // 重置表单为初始新增状态
        this.sportForm = { id: null, sportType: '', suitableFrequency: '', suitableTime: '', recommendedSpeed: '', suitableHeartRate: '' };
        this.dialogFormVisible = true;
      } else {
        this.title = "修改运动信息";
        try {
          // 添加加载提示或禁用按钮防止重复点击
          const response = await sportApi.getSportById(id);
          this.sportForm = { ...response.data }; // 浅拷贝数据
          this.dialogFormVisible = true;
        } catch (error) {
          console.error("获取运动信息详情失败:", error);
          this.$message.error('获取详情失败');
        }
      }
    },
    // 删除运动信息
    async deleteSport(sport) {
      try {
        await this.$confirm(`确认删除运动类型 "${sport.sportType}" 的信息吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          confirmButtonClass: 'el-button--danger'
        });
        // 用户确认删除
        this.listLoading = true; // 操作时锁定列表
        try {
           const response = await sportApi.deleteSportById(sport.id);
           this.$message({ type: "success", message: response.message || "删除成功" });
           this.getSportList(); // 重新加载列表
        } catch (apiError) {
           console.error("删除运动信息失败:", apiError);
           this.$message.error('删除失败');
        } finally {
            this.listLoading = false;
        }
      } catch (cancel) {
        this.$message({ type: "info", message: "已取消删除" });
      }
    },
  },
  // 组件创建时执行
  created() {
    this.checkScreenWidth(); // 初始检查屏幕宽度
    window.addEventListener('resize', this.checkScreenWidth); // 监听窗口变化
    this.getSportList(); // 加载初始数据
  },
  // 组件销毁前执行
  beforeDestroy() {
      window.removeEventListener('resize', this.checkScreenWidth); // 移除监听器
  }
};
</script>

<style scoped>
.sport-manage-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 页面标题样式 */
.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-description {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

/* 搜索区域样式 */
.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.search-controls {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.search-input {
  width: 240px;
  margin-right: 10px;
}

.action-col {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.add-btn {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

/* 数据卡片样式 */
.data-card {
  border-radius: 8px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-count {
  font-size: 14px;
  color: #909399;
}

/* 表格样式 */
:deep(.even-row) {
  background-color: #fafafa;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

:deep(.el-table__row:hover) {
  background-color: #f0f9eb !important;
}

.empty-data {
  padding: 40px 0;
  text-align: center;
  color: #909399;
}

.empty-data i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-data p {
  margin-bottom: 16px;
}

/* 弹窗样式 */
.sport-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #2c3e50;
}

.sport-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.sport-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.sport-form :deep(.el-input__count) {
  background: transparent;
  font-size: 12px;
  color: #909399;
}

.form-tips {
  background-color: #f0f9eb;
  border-radius: 4px;
  padding: 10px 15px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  color: #67c23a;
}

.form-tips i {
  margin-right: 8px;
  font-size: 16px;
}

/* 分页样式 */
.el-pagination {
  padding: 15px 0;
  text-align: right;
  margin-top: 10px;
}

:deep(.el-pagination__sizes) {
  margin: 0 10px 0 0;
}

:deep(.el-pagination__jump) {
  margin-left: 10px;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background-color: #67c23a;
  color: #fff;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled):hover) {
  color: #67c23a;
}

/* 响应式调整 */
@media (max-width: 767px) {
  .page-title {
    font-size: 24px;
  }
  
  .search-card .el-col {
    margin-bottom: 15px;
  }
  
  .search-controls {
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .action-col {
    justify-content: flex-start;
  }
  
  .add-btn {
    width: 100%;
  }
  
  .sport-dialog :deep(.el-dialog__body) {
    padding: 15px 20px;
  }
  
  .sport-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  .el-pagination {
    text-align: center;
  }
}
</style>