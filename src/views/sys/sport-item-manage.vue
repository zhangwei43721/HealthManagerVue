<template>
  <div class="details-manage-container">
    <div class="page-header">
      <h1 class="page-title">运动详情管理</h1>
      <p class="page-description">管理各类运动的详细信息，包括运动方法、禁忌疾病和注意事项</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-row :gutter="20" type="flex" align="middle" justify="space-between">
        <el-col :xs="24" :sm="16" :md="18" :lg="18">
          <div class="search-controls">
            <el-input 
              v-model="searchModel.sportType" 
              placeholder="输入运动类型搜索" 
              prefix-icon="el-icon-search"
              clearable 
              size="medium"
              class="search-input">
            </el-input>
            <el-button @click="getDetailList" type="primary" size="medium">查询</el-button>
            <el-button @click="resetSearch" plain icon="el-icon-refresh" size="medium">重置</el-button>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" :md="6" :lg="6" class="action-col">
           <el-button @click="openEditUi(null)" type="primary" icon="el-icon-plus" size="medium" class="add-btn">新增运动</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果列表 -->
    <el-card class="data-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>运动详情列表</span>
        <span class="data-count">共 {{total}} 条记录</span>
      </div>

      <el-table 
        :data="detailList" 
        stripe 
        v-loading="listLoading" 
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        style="width: 100%"
        :header-cell-style="{backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold'}"
        :row-class-name="tableRowClassName"
        empty-text="暂无数据">
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="sportType" label="运动类型" width="150">
          <template v-slot="{row}">
            <el-tag size="medium">{{row.sportType}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="disease" label="禁忌疾病" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="method" label="运动方法" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="notes" label="注意事项" min-width="180" show-overflow-tooltip></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template v-slot="{ row }">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button @click="openEditUi(row.id)" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button @click="deleteDetail(row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-document"></i>
            <p>暂无运动详情数据</p>
            <el-button type="primary" size="small" @click="openEditUi(null)">添加第一条</el-button>
          </div>
        </template>
      </el-table>
    </el-card>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchModel.pageNo"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :background="true"
      :small="isMobile"  
      style="margin-top: 20px; text-align: right;">
    </el-pagination>

    <!-- 新增/编辑 弹窗 -->
    <el-dialog
      @close="clearForm"
      :title="title"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
      :fullscreen="isMobile" 
      top="5vh"
      class="detail-dialog"
      :close-on-click-modal="false">
      <el-form :model="detailForm" ref="detailFormRef" :rules="rules" label-width="100px" class="detail-form">
        <el-form-item label="运动类型" prop="sportType">
          <el-input 
            v-model="detailForm.sportType" 
            autocomplete="off" 
            placeholder="请输入运动类型"
            maxlength="50"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="禁忌疾病" prop="disease">
          <el-input 
            v-model="detailForm.disease" 
            autocomplete="off" 
            type="textarea" 
            :rows="3"
            placeholder="请输入不适合此运动的疾病类型"
            maxlength="500"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="运动方法" prop="method">
          <el-input 
            v-model="detailForm.method" 
            autocomplete="off" 
            type="textarea" 
            :rows="5"
            placeholder="请详细描述运动方法和步骤"
            maxlength="1000"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="注意事项" prop="notes">
          <el-input 
            v-model="detailForm.notes" 
            autocomplete="off" 
            type="textarea" 
            :rows="4"
            placeholder="请输入进行此运动时的注意事项"
            maxlength="500"
            show-word-limit>
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 弹窗底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveDetail" :loading="saveLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import sportApi from "@/api/Function_Menu"; // 引入API模块

export default {
  name: 'SportDetailManagement', // 组件名
  data() {
    return {
      isMobile: false, // 是否为移动设备视图
      listLoading: false, // 表格加载状态
      saveLoading: false, // 保存按钮加载状态
      detailForm: { // 表单数据模型
        id: null,
        sportType: '',
        disease: '',
        method: '',
        notes: ''
      },
      detailList: [], // 表格数据
      dialogFormVisible: false, // 弹窗可见性
      title: "", // 弹窗标题
      total: 0, // 总记录数
      searchModel: { // 搜索条件
        sportType: '',
        pageNo: 1,
        pageSize: 10,
      },
      rules: { // 表单校验规则
        sportType: [
          { required: true, message: "请输入运动类型", trigger: "blur" },
          { min: 2, max: 50, message: "长度在2到50个字符之间", trigger: "blur" }
        ],
        method: [
          { required: true, message: "请输入运动方法", trigger: "blur" }
        ]
      },
    };
  },
  computed: {
      // 计算弹窗宽度
      dialogWidth() {
          return this.isMobile ? '95%' : '60%';
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
      this.getDetailList();
    },
    // 检查屏幕宽度，设置isMobile状态
    checkScreenWidth() {
        this.isMobile = window.innerWidth < 768; // 阈值可调整
    },
    // 保存数据 (新增或修改)
    async saveDetail() {
      this.$refs.detailFormRef.validate(async (valid) => {
        if (valid) {
          this.saveLoading = true; // 开始加载
          try {
            const response = await sportApi.saveDetail(this.detailForm);
            this.$message({
              message: response.message || (this.detailForm.id ? '修改成功' : '新增成功'),
              type: "success",
            });
            this.dialogFormVisible = false;
            this.getDetailList(); // 刷新列表
          } catch (error) {
            console.error("保存失败:", error);
            this.$message.error('操作失败，请稍后重试');
          } finally {
            this.saveLoading = false; // 结束加载
          }
        } else {
          console.log("表单验证失败");
          return false;
        }
      });
    },
    // 关闭弹窗时清空表单
    clearForm() {
      this.detailForm = { id: null, sportType: '', disease: '', method: '', notes: '' };
      this.$nextTick(() => {
        this.$refs.detailFormRef.clearValidate();
      });
    },
    // 处理每页显示条数变化
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNo = 1;
      this.getDetailList();
    },
    // 处理当前页码变化
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getDetailList();
    },
    // 获取列表数据
    async getDetailList() {
      this.listLoading = true;
      try {
        const response = await sportApi.getDetailList(this.searchModel);
        this.detailList = response.data.rows;
        this.total = response.data.total;
      } catch (error) {
        console.error("获取列表失败:", error);
        this.$message.error('获取列表失败');
        this.detailList = [];
        this.total = 0;
      } finally {
        this.listLoading = false;
      }
    },
    // 打开新增/编辑弹窗
    async openEditUi(id) {
      this.clearForm();
      if (id == null) {
        this.title = "新增运动详情";
        this.dialogFormVisible = true;
      } else {
        this.title = "修改运动详情";
        try {
          // 可以添加一个小的加载状态指示
          const response = await sportApi.getDetailById(id);
          this.detailForm = { ...response.data };
          this.dialogFormVisible = true;
        } catch (error) {
          console.error("获取详情失败:", error);
          this.$message.error('获取详情失败');
        }
      }
    },
    // 删除数据
    async deleteDetail(detail) {
      try {
        await this.$confirm(`确认删除 "${detail.sportType}" 吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          confirmButtonClass: 'el-button--danger' // 强调删除按钮
        });
        // 用户确认删除
        try {
           this.listLoading = true; // 防止快速重复点击
           const response = await sportApi.deleteDetailById(detail.id);
           this.$message({ type: "success", message: response.message || "删除成功" });
           this.getDetailList(); // 重新加载列表
        } catch (apiError) {
           console.error("删除失败:", apiError);
           this.$message.error('删除失败');
           this.listLoading = false;
        }
      } catch (cancel) {
        this.$message({ type: "info", message: "已取消删除" });
      }
    },
  },
  // 组件创建时执行
  created() {
    this.checkScreenWidth(); // 首次检查屏幕宽度
    window.addEventListener('resize', this.checkScreenWidth); // 监听窗口大小变化
    this.getDetailList(); // 加载初始数据
  },
  // 组件销毁前执行
  beforeDestroy() {
      window.removeEventListener('resize', this.checkScreenWidth); // 移除监听器
  }
};
</script>

<style scoped>
.details-manage-container {
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
  background: linear-gradient(90deg, #4f8cff 0%, #6fc3ff 100%);
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 140, 255, 0.2);
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
  background-color: #f0f7ff !important;
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
.detail-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #2c3e50;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.detail-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.detail-form :deep(.el-textarea__inner) {
  font-family: 'Segoe UI', Arial, sans-serif;
  line-height: 1.6;
  padding: 10px 12px;
}

.detail-form :deep(.el-input__count) {
  background: transparent;
  font-size: 12px;
  color: #909399;
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
  background-color: #409EFF;
  color: #fff;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled):hover) {
  color: #409EFF;
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
  
  .detail-dialog :deep(.el-dialog__body) {
    padding: 15px 20px;
  }
  
  .detail-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  .el-pagination {
    text-align: center;
  }
}
</style>