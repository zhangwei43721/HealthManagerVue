<template>
  <div class="role-manage-container">
    <div class="page-header">
      <h1 class="page-title">角色权限管理</h1>
      <p class="page-description">管理系统角色及其对应的权限设置，包括新增、编辑和删除角色</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-row :gutter="20" type="flex" align="middle" justify="space-between">
        <el-col :xs="24" :sm="16" :md="18" :lg="18">
          <div class="search-controls">
            <el-input
              v-model.trim="searchModel.roleName"
              placeholder="输入角色名称搜索"
              prefix-icon="el-icon-search"
              clearable
              size="medium"
              class="search-input"
              @keyup.enter.native="getRoleList"
            ></el-input>
            <el-button
              @click="getRoleList"
              type="primary"
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
            type="primary"
            icon="el-icon-plus"
            size="medium"
            class="add-btn"
          >新增角色</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果列表 -->
    <el-card class="data-card" shadow="hover">
      <div slot="header" class="card-header">
        <span>角色列表</span>
        <span class="data-count">共 {{total}} 条记录</span>
      </div>

      <el-table 
        :data="roleList" 
        stripe 
        v-loading="listLoading" 
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        style="width: 100%"
        :header-cell-style="{backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold'}"
        :row-class-name="tableRowClassName"
        empty-text="暂无数据">
        <el-table-column prop="roleId" label="角色ID" width="100" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="180">
          <template v-slot="{row}">
            <el-tag size="medium" effect="plain" type="primary">{{row.roleName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" min-width="200" show-overflow-tooltip></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template v-slot="{ row }">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button @click="openEditUi(row.roleId)" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button @click="deleteRole(row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-user-solid"></i>
            <p>暂无角色数据</p>
            <el-button type="primary" size="small" @click="openEditUi(null)">添加第一个角色</el-button>
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

    <!-- 角色编辑信息弹出框 -->
    <el-dialog
      @close="clearForm"
      :title="title"
      :visible.sync="dialogFormVisible"
      :width="dialogWidth"
      :fullscreen="isMobile"
      top="5vh"
      destroy-on-close
      class="role-dialog"
      :close-on-click-modal="false">
      <el-form :model="roleForm" ref="roleFormRef" :rules="rules" label-width="100px" class="role-form">
        <el-form-item label="角色名称" prop="roleName">
          <el-input 
            v-model="roleForm.roleName" 
            autocomplete="off"
            placeholder="请输入角色名称"
            maxlength="50"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input 
            v-model="roleForm.roleDesc" 
            autocomplete="off" 
            type="textarea" 
            :rows="2"
            placeholder="请输入角色描述"
            maxlength="200"
            show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="权限设置" prop="menuIdList">
          <div class="tree-container">
            <div class="tree-header">
              <span>请选择此角色所拥有的权限</span>
              <div class="tree-actions">
                <el-checkbox 
                  v-model="isAllSelected"
                  @change="toggleSelectAll"
                  size="medium">
                  {{ isAllSelected ? '取消全选' : '全选' }}
                </el-checkbox>
              </div>
            </div>
            <!-- 权限树 -->
            <el-tree
              ref="menuRef"
              :data="menuList"
              :props="defaultProps"
              show-checkbox
              node-key="menuId"
              default-expand-all
              :default-checked-keys="roleForm.menuIdList"
              class="permission-tree">
            </el-tree>
          </div>
        </el-form-item>
      </el-form>
      <!-- 弹窗底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole" :loading="saveLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import roleApi from "@/api/roleManage"; // 角色管理API
import menuApi from "@/api/menuManage"; // 菜单管理API

export default {
  name: 'RoleManagement', // 组件名称
  data() {
    // 校验规则可以在data外部定义，或者内部定义
    const validateRoleName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入角色名'));
      }
      if (value.length < 2 || value.length > 20) {
        return callback(new Error('长度需要在 2 到 20 个字符'));
      }
      callback();
    };
     const validateRoleDesc = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入角色描述'));
      }
       if (value.length < 2 || value.length > 20) {
        return callback(new Error('长度需要在 2 到 20 个字符'));
      }
      callback();
    };

    return {
      isMobile: false, // 是否移动端视图
      listLoading: false, // 列表加载状态
      saveLoading: false, // 保存按钮加载状态
      menuList: [], // 菜单树数据
      roleForm: { // 角色表单数据模型
        roleId: null,
        roleName: '',
        roleDesc: '',
        menuIdList: []
      },
      dialogFormVisible: false, // 弹窗可见性
      title: "", // 弹窗标题
      total: 0, // 总记录数
      roleList: [], // 角色列表数据
      isAllSelected: false, // 是否全选权限
      defaultProps: { // 菜单树配置
        children: 'children', // 子节点字段名
        label: 'title' // 显示的标签字段名
      },
      searchModel: { // 搜索条件
        roleName: '',
        pageNo: 1,
        pageSize: 10,
      },
      rules: { // 表单校验规则
        roleName: [ { validator: validateRoleName, trigger: "blur" } ],
        roleDesc: [ { validator: validateRoleDesc, trigger: "blur" } ],
        // menuIdList 可以在保存前校验，或根据业务需要添加校验规则
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
    // 检查屏幕宽度
    checkScreenWidth() {
      this.isMobile = window.innerWidth < 768; // 小于768px视为移动端
    },
    // 重置搜索条件
    resetSearch() {
      this.searchModel = {
        roleName: '',
        pageNo: 1,
        pageSize: 10
      };
      this.getRoleList();
    },
    // 设置表格行的类名
    tableRowClassName({ row, rowIndex }) {
      return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
    },
    // 获取所有菜单数据
    async getAllMenu() {
      try {
        const response = await menuApi.getAllMenu();
        this.menuList = response.data; // 假设返回的数据就是树形结构
      } catch (error) {
        console.error("获取菜单列表失败:", error);
        this.$message.error('获取菜单权限数据失败');
      }
    },
    // 保存角色 (新增或修改)
    async saveRole() {
      try {
        // 1. 表单校验
        await this.$refs.roleFormRef.validate();

        // 2. 获取选中的菜单权限
        const checkedKeys = this.$refs.menuRef.getCheckedKeys();
        const halfCheckedKeys = this.$refs.menuRef.getHalfCheckedKeys();
        this.roleForm.menuIdList = [...checkedKeys, ...halfCheckedKeys]; // 合并选中和半选中

        // 可选：校验是否选择了权限
        // if (this.roleForm.menuIdList.length === 0) {
        //   this.$message.warning('请至少为角色分配一个权限');
        //   return;
        // }

        this.saveLoading = true; // 开始加载

        // 3. 调用API保存
        const response = await roleApi.saveRole(this.roleForm);
        this.$message({
          message: response.message || (this.roleForm.roleId ? '修改成功' : '新增成功'),
          type: "success",
        });
        this.dialogFormVisible = false; // 关闭弹窗
        this.getRoleList(); // 刷新列表

      } catch (error) {
        // 捕获校验失败或API错误
        if (error === false) {
          console.log("表单验证失败"); // validate Prmise reject(false)
        } else {
           console.error("保存角色失败:", error);
           this.$message.error('操作失败，请稍后重试');
        }
      } finally {
        this.saveLoading = false; // 结束加载
      }
    },
    // 切换全选/取消全选状态
    toggleSelectAll(value) {
      if (this.$refs.menuRef) {
        if (value) {
          // 全选
          if (this.menuList.length > 0) {
            const allMenuIds = this.getAllMenuIds(this.menuList);
            this.$refs.menuRef.setCheckedKeys(allMenuIds);
          }
        } else {
          // 取消全选
          this.$refs.menuRef.setCheckedKeys([]);
        }
      }
    },
    
    // 递归获取所有菜单ID
    getAllMenuIds(menuList) {
      let ids = [];
      if (!menuList || menuList.length === 0) return ids;
      
      menuList.forEach(menu => {
        // 添加当前菜单ID
        if (menu.menuId) {
          ids.push(menu.menuId);
        }
        // 递归处理子菜单
        if (menu.children && menu.children.length > 0) {
          ids = ids.concat(this.getAllMenuIds(menu.children));
        }
      });
      
      return ids;
    },
    
    // 关闭弹窗时清空表单和树状态
    clearForm() {
      this.roleForm = { roleId: null, roleName: '', roleDesc: '', menuIdList: [] };
      this.isAllSelected = false; // 重置全选状态
      // $refs可能在dialog关闭动画完成前不存在，使用nextTick或dialog的closed事件
      // 此处用 destroy-on-close 属性更方便，弹窗关闭时内部组件会被销毁重建
      // 如果不用 destroy-on-close，需要这样处理:
      // this.$nextTick(() => {
      //   if (this.$refs.roleFormRef) {
      //     this.$refs.roleFormRef.clearValidate();
      //   }
      //   if (this.$refs.menuRef) {
      //      // 清空树的选中状态
      //     this.$refs.menuRef.setCheckedKeys([]);
      //   }
      // });
    },
    // 处理每页显示条数变化
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNo = 1; // 通常回到第一页
      this.getRoleList();
    },
    // 处理当前页码变化
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getRoleList();
    },
    // 获取角色列表数据
    async getRoleList() {
      this.listLoading = true;
      try {
        const response = await roleApi.getRoleList(this.searchModel);
        this.roleList = response.data.rows;
        this.total = response.data.total;
      } catch (error) {
        console.error("获取角色列表失败:", error);
        this.$message.error('获取角色列表失败');
        this.roleList = [];
        this.total = 0;
      } finally {
        this.listLoading = false;
      }
    },
    // 打开新增/编辑弹窗
    async openEditUi(id) {
      // 先获取所有菜单，确保树有数据 (如果菜单不常变，可在created获取一次)
      if (this.menuList.length === 0) {
        await this.getAllMenu();
      }
      // this.clearForm(); // destroy-on-close 会自动处理

      if (id == null) {
        this.title = "新增角色";
        // 重置表单，确保是新增状态
        this.roleForm = { roleId: null, roleName: '', roleDesc: '', menuIdList: [] };
        this.dialogFormVisible = true;
      } else {
        this.title = "修改角色";
        try {
          // 获取角色详情
          const response = await roleApi.getRoleById(id);
          this.roleForm = { ...response.data }; // 浅拷贝数据到表单

          this.dialogFormVisible = true; // 先显示弹窗

          // 弹窗DOM渲染完成后设置树的选中状态
          this.$nextTick(() => {
             if (this.$refs.menuRef && response.data.menuIdList) {
               // 确保 menuRef 存在并且有 menuIdList
               this.$refs.menuRef.setCheckedKeys(response.data.menuIdList);
               
               // 检查是否全选
               if (this.menuList.length > 0) {
                 const allMenuIds = this.getAllMenuIds(this.menuList);
                 // 如果选中的权限数量等于所有权限数量，则设置为全选状态
                 this.isAllSelected = response.data.menuIdList.length === allMenuIds.length;
               }
             }
          });

        } catch (error) {
          console.error("获取角色详情失败:", error);
          this.$message.error('获取角色详情失败');
        }
      }
    },
    // 删除角色
    async deleteRole(role) {
      try {
        await this.$confirm(`确认删除角色 "${role.roleName}" 吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          confirmButtonClass: 'el-button--danger'
        });
        // 用户确认删除
        this.listLoading = true; // 操作时锁定列表
        try {
           const response = await roleApi.deleteRoleById(role.roleId);
           this.$message({ type: "success", message: response.message || "删除成功" });
           this.getRoleList(); // 重新加载列表
        } catch (apiError) {
           console.error("删除角色失败:", apiError);
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
    this.getRoleList(); // 加载角色列表
    this.getAllMenu(); // 加载菜单权限树数据
  },
  // 组件销毁前执行
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenWidth); // 移除监听器
  }
};
</script>

<style scoped>
.role-manage-container {
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
.role-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #2c3e50;
}

.role-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.role-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.role-form :deep(.el-input__count) {
  background: transparent;
  font-size: 12px;
  color: #909399;
}

/* 权限树容器 */
.tree-container {
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  overflow: hidden;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #EBEEF5;
}

.tree-actions {
  display: flex;
  gap: 10px;
}

.permission-tree {
  max-height: 45vh;
  overflow-y: auto;
  padding: 10px;
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
  
  .role-dialog :deep(.el-dialog__body) {
    padding: 15px 20px;
  }
  
  .role-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  .permission-tree {
    max-height: 55vh;
  }
  
  .el-pagination {
    text-align: center;
  }
}
</style>