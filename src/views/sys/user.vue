<template>
  <div class="user-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <p class="page-description">管理系统用户信息，包括用户添加、编辑、删除及权限分配</p>
    </div>
    
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-row :gutter="20">
        <!-- 搜索输入与按钮 -->
        <el-col :xs="24" :sm="18" :md="18">
          <div class="search-controls">
            <el-input
              v-model.trim="searchModel.username"
              placeholder="请输入用户名搜索"
              clearable
              prefix-icon="el-icon-user"
              class="search-input"
              @keyup.enter.native="getUserList"
            ></el-input>
            <el-input
              v-model.trim="searchModel.phone"
              placeholder="请输入手机号搜索"
              clearable
              prefix-icon="el-icon-mobile-phone"
              class="search-input"
              @keyup.enter.native="getUserList"
            ></el-input>
            <el-button
              @click="getUserList"
              type="primary"
              :loading="listLoading"
            >查询</el-button>
            <el-button
              @click="resetSearch"
              plain
              icon="el-icon-refresh"
            >重置</el-button>
          </div>
        </el-col>
        <!-- 新增按钮 -->
        <el-col :xs="24" :sm="6" :md="6" class="action-col">
           <el-button
            @click="openEditUi(null)"
            type="success"
            icon="el-icon-plus"
            class="add-btn"
          >新增用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果列表 -->
    <el-card class="data-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>用户信息列表</span>
        <span class="data-count">共 {{ total }} 条记录</span>
      </div>
      
      <el-table 
        :data="userList" 
        stripe 
        :row-class-name="tableRowClassName"
        v-loading="listLoading" 
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        style="width: 100%"
        :header-cell-style="{backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold'}"
      >
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="id" label="用户ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120">
          <template slot-scope="scope">
            <el-tag size="medium" effect="plain" type="primary">{{ scope.row.username }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="140" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.phone">
              <i class="el-icon-mobile-phone"></i> {{ scope.row.phone }}
            </span>
            <span v-else class="no-data">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="电子邮件" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.email">
              <i class="el-icon-message"></i> {{ scope.row.email }}
            </span>
            <span v-else class="no-data">未设置</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag size="medium" type="success" effect="dark" v-if="scope.row.roleName">{{ scope.row.roleName }}</el-tag>
            <el-tag size="medium" type="info" v-else>未分配角色</el-tag>
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button @click="openEditUi(scope.row.id)" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button @click="deleteUser(scope.row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-user"></i>
            <p>暂无用户数据</p>
            <el-button type="primary" @click="openEditUi(null)">添加用户</el-button>
          </div>
        </template>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        class="pagination"
      ></el-pagination>
    </el-card>

    <!-- 用户编辑/新增 弹窗 -->
    <el-dialog
      @close="clearForm"
      :title="title"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
      :fullscreen="isMobile"
      top="5vh"
      destroy-on-close
      class="user-dialog"
      :close-on-click-modal="false">
      <el-form :model="userForm" ref="userFormRef" :rules="rules" label-width="100px" class="user-form">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="userForm.username" 
            autocomplete="off"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            maxlength="20"
            show-word-limit>
          </el-input>
        </el-form-item>
        <!-- 新增时显示密码输入框 -->
        <el-form-item v-if="!userForm.id" label="密码" prop="password">
          <el-input 
            type="password" 
            v-model="userForm.password" 
            autocomplete="off" 
            show-password
            placeholder="请输入密码，长度在6-20个字符"
            prefix-icon="el-icon-lock"
            maxlength="20">
          </el-input>
          <div class="password-strength" v-if="userForm.password">
            <span>密码强度：</span>
            <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
          </div>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input 
            v-model="userForm.phone" 
            autocomplete="off"
            placeholder="请输入手机号码"
            prefix-icon="el-icon-mobile-phone">
          </el-input>
        </el-form-item>
        <el-form-item label="电子邮件" prop="email">
          <el-input 
            v-model="userForm.email" 
            autocomplete="off"
            placeholder="请输入电子邮箱地址"
            prefix-icon="el-icon-message">
          </el-input>
        </el-form-item>
        <!-- 用户角色 -->
        <el-form-item label="用户角色" prop="roleId">
          <div class="role-selection">
            <el-radio-group v-model="userForm.roleId">
              <el-radio
                v-for="role in allRoleList"
                :label="role.roleId"
                :key="role.roleId"
                class="role-radio"
              >
                <span class="role-name">{{ role.roleDesc }}</span>
              </el-radio>
            </el-radio-group>
          </div>
        </el-form-item>
        <div class="form-tips" v-if="!userForm.id">
          <i class="el-icon-info"></i>
          <span>用户创建后，可以通过“修改密码”功能重置密码</span>
        </div>
      </el-form>
      <!-- 弹窗底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser" :loading="saveLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userApi from "@/api/userManage"; // 用户API
import roleApi from "@/api/roleManage"; // 角色API

// 手机号简单校验正则 (可根据实际需求调整)
const phoneReg = /^1[3-9]\d{9}$/;
// 邮箱校验正则
const emailReg = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

export default {
  name: 'UserManagement', // 组件名称
  data() {
    // 自定义校验函数
    const validateUsername = (rule, value, callback) => {
      if (!value) return callback(new Error('请输入用户名'));
      if (value.length < 2 || value.length > 20) return callback(new Error('长度需在 2 到 20 个字符'));
      callback();
    };
    const validatePassword = (rule, value, callback) => {
      // 密码只在新增时校验
      if (!this.userForm.id) {
         if (!value) return callback(new Error('请输入密码'));
         if (value.length < 6 || value.length > 20) return callback(new Error('长度需在 6 到 20 个字符'));
      }
      callback(); // 修改时不校验密码，直接通过
    };
     const validatePhone = (rule, value, callback) => {
      if (value && !phoneReg.test(value)) { // 允许为空，但如果不为空则校验格式
        return callback(new Error('请输入有效的手机号'));
      }
      callback();
    };
    const validateEmail = (rule, value, callback) => {
      if (!value) return callback(new Error('请输入电子邮件'));
      if (!emailReg.test(value)) return callback(new Error('请输入有效的电子邮件地址'));
      callback();
    };
     const validateRole = (rule, value, callback) => {
        if (!value) {
            return callback(new Error('请为用户分配角色'));
        }
        callback();
     };

    return {
      isMobile: false, // 是否移动端视图
      listLoading: false, // 列表加载状态
      saveLoading: false, // 保存按钮加载状态
      userForm: { // 用户表单数据模型
        id: null,
        username: '',
        password: '',
        phone: '',
        email: '',
        roleId: null, // 改为单选，存储单个 roleId
      },
      allRoleList: [], // 所有角色列表 (用于弹窗选择)
      userList: [], // 用户列表数据 (表格)
      dialogFormVisible: false, // 弹窗可见性
      title: "", // 弹窗标题
      total: 0, // 总记录数
      searchModel: { // 搜索条件
        username: '',
        phone: '',
        pageNo: 1,
        pageSize: 10,
      },
      rules: { // 表单校验规则
        username: [ { required: true, validator: validateUsername, trigger: "blur" } ],
        password: [ { validator: validatePassword, trigger: "blur" } ], // 密码根据情况校验
        phone: [ { validator: validatePhone, trigger: "blur" } ],
        email: [ { required: true, validator: validateEmail, trigger: "blur" } ],
        roleId: [ { required: true, validator: validateRole, trigger: "change" } ], // 使用 change 触发器
      },
    };
  },
  computed: {
      // 动态计算弹窗宽度
      dialogWidth() {
          return this.isMobile ? '95%' : '50%';
      },
      // 计算密码强度
      passwordStrength() {
          const password = this.userForm.password || '';
          if (!password) return '';
          
          // 计算密码强度
          let score = 0;
          
          // 长度得分
          if (password.length >= 8) score += 1;
          if (password.length >= 12) score += 1;
          
          // 复杂度得分
          if (/[A-Z]/.test(password)) score += 1; // 大写字母
          if (/[a-z]/.test(password)) score += 1; // 小写字母
          if (/[0-9]/.test(password)) score += 1; // 数字
          if (/[^A-Za-z0-9]/.test(password)) score += 1; // 特殊字符
          
          // 返回强度级别
          if (score <= 2) return '弱';
          if (score <= 4) return '中';
          return '强';
      },
      // 密码强度对应的样式类
      passwordStrengthClass() {
          const strength = this.passwordStrength;
          if (strength === '弱') return 'strength-weak';
          if (strength === '中') return 'strength-medium';
          if (strength === '强') return 'strength-strong';
          return '';
      }
  },
  methods: {
    // 表格行样式
    tableRowClassName({row, rowIndex}) {
      return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
    },
    // 重置搜索条件
    resetSearch() {
      this.searchModel.username = '';
      this.searchModel.phone = '';
      this.searchModel.pageNo = 1;
      this.getUserList();
    },
    // 检查屏幕宽度
    checkScreenWidth() {
        this.isMobile = window.innerWidth < 768;
    },
    // 获取所有角色列表 (用于弹窗内选择)
    async getAllRoleList() {
      try {
        // 通常获取所有角色不需要分页
        const response = await roleApi.getAllRoleList(); // 假设有这个接口
        this.allRoleList = response.data || [];
      } catch (error) {
        console.error("获取所有角色列表失败:", error);
        this.$message.error('获取角色数据失败');
        this.allRoleList = []; // 出错时清空
      }
    },
    // 保存用户信息 (新增或修改)
    async saveUser() {
      try {
        // 1. 表单校验
        await this.$refs.userFormRef.validate();
        this.saveLoading = true;

        // 2. 准备提交的数据 (如果API需要roleIdList，需要转换)
        let dataToSave = { ...this.userForm };
        // **重要:** 确认后端 `saveUser` 接口需要的是 `roleId` 还是 `roleIdList`
        // 假设后端需要的是 `roleIdList` (即使只有一个角色)
        if (dataToSave.roleId) {
            dataToSave.roleIdList = [dataToSave.roleId]; // 将 roleId 包装成列表
            // delete dataToSave.roleId; // 可选：如果接口不接受 roleId 字段，则删除
        } else {
            dataToSave.roleIdList = [];
        }

        // 3. 调用API保存
        // 注意：这里传递的是 dataToSave 而不是 this.userForm
        const response = await userApi.saveUser(dataToSave);
        this.$message({
          message: response.message || (this.userForm.id ? '修改成功' : '新增成功'),
          type: "success",
        });
        this.dialogFormVisible = false;
        this.getUserList(); // 刷新列表

      } catch (error) {
        if (error === false) { // validate Promise reject(false)
          console.log("表单验证失败");
        } else {
           console.error("保存用户信息失败:", error);
           this.$message.error('操作失败，请稍后重试');
        }
      } finally {
        this.saveLoading = false;
      }
    },
    // 清空表单 (主要由 destroy-on-close 处理)
    clearForm() {
      this.userForm = { id: null, username: '', password: '', phone: '', email: '', roleId: null };
    },
    // 处理每页显示条数变化
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNo = 1;
      this.getUserList();
    },
    // 处理当前页码变化
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getUserList();
    },
    // 获取用户列表数据
    async getUserList() {
      this.listLoading = true;
      try {
        const response = await userApi.getUserList(this.searchModel);
        this.userList = response.data.rows;
        this.total = response.data.total;
      } catch (error) {
        console.error("获取用户列表失败:", error);
        this.$message.error('获取用户列表失败');
        this.userList = [];
        this.total = 0;
      } finally {
        this.listLoading = false;
      }
    },
    // 打开新增/编辑弹窗
    async openEditUi(id) {
      // 确保角色列表已加载
      if (this.allRoleList.length === 0) {
          await this.getAllRoleList();
      }

      if (id == null) {
        this.title = "新增用户";
        // 重置表单为初始状态
        this.userForm = { id: null, username: '', password: '', phone: '', email: '', roleId: null };
        this.dialogFormVisible = true;
      } else {
        this.title = "修改用户";
        try {
          const response = await userApi.getUserById(id);
          // **重要:** 确认后端返回的数据结构
          // 假设后端返回的数据包含 roleIdList (即使只有一个元素)
          let userData = { ...response.data };
          // 如果后端返回 roleIdList，取第一个作为 roleId 用于单选框
          if (userData.roleIdList && userData.roleIdList.length > 0) {
              userData.roleId = userData.roleIdList[0];
          } else {
              userData.roleId = null; // 或者根据业务设置默认值
          }
          this.userForm = userData;
          // 密码字段在修改时不显示，也不需要从后端获取和填充
          this.userForm.password = '';

          this.dialogFormVisible = true;
        } catch (error) {
          console.error("获取用户详情失败:", error);
          this.$message.error('获取用户详情失败');
        }
      }
    },
    // 删除用户
    async deleteUser(user) {
      try {
        await this.$confirm(`确认删除用户 "${user.username}" 吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          confirmButtonClass: 'el-button--danger'
        });
        this.listLoading = true;
        try {
           const response = await userApi.deleteUserById(user.id);
           this.$message({ type: "success", message: response.message || "删除成功" });
           // 如果删除的是最后一页的唯一数据，可能需要跳转到前一页
            if (this.userList.length === 1 && this.searchModel.pageNo > 1) {
                this.searchModel.pageNo--;
            }
           this.getUserList();
        } catch (apiError) {
           console.error("删除用户失败:", apiError);
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
    this.checkScreenWidth();
    window.addEventListener('resize', this.checkScreenWidth);
    this.getUserList(); // 加载用户列表
    this.getAllRoleList(); // 加载所有角色数据 (用于弹窗)
  },
  // 组件销毁前执行
  beforeDestroy() {
      window.removeEventListener('resize', this.checkScreenWidth);
  }
};
</script>

<style scoped>
.user-manage-container {
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
  flex-wrap: wrap;
}

.search-input {
  width: 220px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.action-col {
  display: flex;
  justify-content: flex-end;
  align-items: center;
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
  background-color: #ecf5ff !important;
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

.no-data {
  color: #c0c4cc;
  font-style: italic;
  font-size: 13px;
}

/* 弹窗样式 */
.user-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #2c3e50;
}

.user-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.user-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.user-form :deep(.el-input__count) {
  background: transparent;
  font-size: 12px;
  color: #909399;
}

/* 密码强度样式 */
.password-strength {
  margin-top: 8px;
  font-size: 13px;
  color: #606266;
}

.strength-weak {
  color: #f56c6c;
  font-weight: bold;
}

.strength-medium {
  color: #e6a23c;
  font-weight: bold;
}

.strength-strong {
  color: #67c23a;
  font-weight: bold;
}

/* 角色选择样式 */
.role-selection {
  display: flex;
  flex-wrap: wrap;
}

.role-radio {
  margin-right: 20px;
  margin-bottom: 10px;
}

.role-name {
  font-size: 14px;
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

.add-btn {
  width: auto;
  min-width: 100px;
  margin-left: 10px;
  transition: transform 0.2s;
}

.add-btn:hover {
  transform: scale(1.05);
}

/* 分页样式 */
.pagination {
  padding: 15px 0;
  text-align: right;
  margin-top: 10px;
}

:deep(.el-pagination__sizes) {
  margin: 0 10px 0 0;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background-color: #409eff;
  color: #fff;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled):hover) {
  color: #409eff;
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
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
    margin-right: 0;
  }
  
  .action-col {
    justify-content: flex-start;
  }
  
  .add-btn {
    width: 100%;
  }
  
  .user-dialog :deep(.el-dialog__body) {
    padding: 15px 20px;
  }
  
  .user-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  .pagination {
    text-align: center;
  }
}
</style>