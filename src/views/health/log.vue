<!-- 搜索框和添加按钮，搜索框，以及用户名和手机号的输入框 -->
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
        v-model="searchText"
        placeholder="输入姓名、手机号等进行搜索"
        prefix-icon="el-icon-search"
        class="search-input"
        clearable
        @keyup.enter.native="onSearch"
      >
        <el-button slot="append" type="primary" icon="el-icon-search" @click="onSearch">搜索</el-button>
      </el-input>
      <el-button type="primary" icon="el-icon-plus" @click="dialogFormVisible = true">添加记录</el-button>
    </div>

    <!-- 数据区 -->
    <el-card class="log-card" shadow="hover">
      <el-table
        :data="bodyList"
        stripe
        border
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无数据'"
        v-loading="loading"
        element-loading-text="数据加载中..."
        highlight-current-row
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="date" label="上传时间" width="120" :formatter="formatDate" align="center" />
        <el-table-column prop="name" label="姓名" width="90" align="center" />
        <el-table-column prop="age" label="年龄" width="70" align="center" />
        <el-table-column prop="gender" label="性别" width="70" align="center" />
        <el-table-column prop="height" label="身高(cm)" width="90" align="center" />
        <el-table-column prop="weight" label="体重(kg)" width="90" align="center" />
        <el-table-column prop="bloodSugar" label="血糖" width="90" align="center" />
        <el-table-column prop="bloodPressure" label="血压" width="90" align="center" />
        <el-table-column prop="bloodLipid" label="血脂" width="90" align="center" />
        <el-table-column prop="heartRate" label="心率/分钟" width="100" align="center" />
        <el-table-column prop="vision" label="视力" width="80" align="center" />
        <el-table-column prop="sleepDuration" label="睡眠时长" width="100" align="center" />
        <el-table-column prop="sleepQuality" label="睡眠质量" width="100" align="center" />
        <el-table-column prop="smoking" label="抽烟" width="70" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.smoking ? 'danger' : 'success'" effect="plain">
              {{ scope.row.smoking ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="drinking" label="喝酒" width="70" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.drinking ? 'warning' : 'success'" effect="plain">
              {{ scope.row.drinking ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="exercise" label="运动" width="70" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.exercise ? 'primary' : 'info'" effect="plain">
              {{ scope.row.exercise ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="foodTypes" label="喜好食物" width="120" align="center" />
        <el-table-column prop="waterConsumption" label="饮水量" width="90" align="center" />
        <el-table-column
          label="操作"
          width="140"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button @click="openEditUi(scope.row.notesid)" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button @click="deleteUserBody(scope.row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 空状态美化 -->
      <div v-if="!loading && bodyList.length === 0" class="empty-state">
        <i class="el-icon-document-remove empty-icon"></i>
        <div class="empty-title">暂无健康日志数据</div>
        <div class="empty-subtitle">请先添加数据或调整筛选条件</div>
      </div>
    </el-card>

    <!-- 编辑/新增弹窗 -->
    <el-dialog title="编辑健康信息" :visible.sync="dialogFormVisible" width="500px">
      <el-form :model="bodyForm" ref="bodyFormRef">
        <el-form-item label="昵称" prop="name" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="年龄" prop="age" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.age" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.gender" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="身高/cm" prop="height" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.height" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="体重/kg" prop="weight" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.weight" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="血糖" prop="bloodSugar" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.bloodSugar" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="血压" prop="bloodPressure" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.bloodPressure" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="血脂" prop="bloodLipid" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.bloodLipid" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="心率/分钟" prop="heartRate" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.heartRate" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="视力" prop="vision" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.vision" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="睡眠时长/h" prop="sleepDuration" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.sleepDuration" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="睡眠质量" prop="sleepQuality" :label-width="formLabelWidth">
          <el-radio-group v-model="bodyForm.sleepQuality">
            <el-radio :label="1">好</el-radio>
            <el-radio :label="2">一般</el-radio>
            <el-radio :label="3">差</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否吸烟" prop="smoking" :label-width="formLabelWidth">
          <el-switch v-model="bodyForm.smoking"></el-switch>
        </el-form-item>
        <el-form-item label="是否喝酒" prop="drinking" :label-width="formLabelWidth">
          <el-switch v-model="bodyForm.drinking"></el-switch>
        </el-form-item>
        <el-form-item label="是否运动" prop="exercise" :label-width="formLabelWidth">
          <el-switch v-model="bodyForm.exercise"></el-switch>
        </el-form-item>
        <el-form-item label="喜好食物" prop="foodTypes" :label-width="formLabelWidth">
          <el-select v-model="bodyForm.foodTypes" placeholder="请选择摄入较多的食物种类">
            <el-option label="蔬菜" value="蔬菜"></el-option>
            <el-option label="水果" value="水果"></el-option>
            <el-option label="肉类" value="肉类"></el-option>
            <el-option label="鱼类" value="鱼类"></el-option>
            <el-option label="豆类" value="豆类"></el-option>
            <el-option label="谷物" value="谷物"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="饮水量/ml" prop="waterConsumption" :label-width="formLabelWidth">
          <el-input v-model="bodyForm.waterConsumption" autocomplete="off"></el-input>
        </el-form-item>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="updateBody">确 定</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import userApi from "@/api/userManage";
export default {
  data() {
    return {
      bodyForm: {}, //初始化为一个空对象
      bodyList: [],
      //左边宽度
      formLabelWidth: "135px",
      //设置默认值不可见
      dialogFormVisible: false,
      title: "",
      total: 0,
      searchModel: {
        pageNo: 1,
        // 默认显示数量
        pageSize: 10,
      },
      //表单规则配置

      rules: {
        bodyType: [
          { required: true, message: "请输入运动类型", trigger: "blur" },
        ],
      },
     };
  },
  methods: {
    updateBody() {
      let isOk = true;
      //触发表单的验证
      this.$refs.bodyFormRef.validate((valid) => {
        // 这边只有校验失败的时候才会进来,在外面定义一个 isok,校验失败会将他改成 false
        isOk = valid;
      });

      if (isOk) {
        //提交验证给后台
        userApi.updateUserBody(this.bodyForm).then((response) => {
          //成功提示
          this.$message({
            message: response.message,
            type: "success",
          });
          //关闭对话框
          this.dialogFormVisible = false;
          //刷新表格数据
          this.getUserBodyList();
        });
      } else {
        console.log("error submit!!");
        return false;
      }
    },

    //清理表单数据
    clearForm() {
      this.bodyForm = {};
      //清除表单校验的提示信息
      this.$refs.bodyFormRef.clearValidate();
    },
    handleSizeChange(pageSize) {
      //数据更新
      this.searchModel.pageSize = pageSize;
      this.getUserBodyList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getUserBodyList();
    },

    //用于查询用户列表
    getUserBodyList() {
      userApi.getUserBodyList(this.searchModel).then((response) => {
        console.log(response);
        this.bodyList = response.data.rows;
        // 将查询结果中的 total 属性赋值给 total
        this.total = response.data.total;
        console.log(this.bodyList);
      });
    },

    openEditUi(notesid) {
      console.log(notesid)
      this.title = "修改身体信息";
      //根据id查询用户数据
      userApi.getUserBodyById(notesid).then((response) => {
        this.bodyForm = response.data;
      });

      this.dialogFormVisible = true;
    },

    deleteUserBody(body) {
      this.$confirm(`确认删除 ${body.name} 这个身体信息吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          userApi.deleteUserBodyById(body.notesid).then((response) => {
            this.$message({
              type: "success",
              message: response.message,
            });
            this.getUserBodyList();
            
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    formatDate(row, column, cellValue, index) {
      // 将时间戳转换成日期字符串
      const date = new Date(cellValue);
      return date.toLocaleDateString();
    }
  },
  created() {
    this.getUserBodyList();
  }
};
</script>
<style scoped>
.log-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  padding-bottom: 40px;
}


.log-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 48px 20px 28px 20px;
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.main-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.08);
}
.subtitle {
  font-size: 1.1rem;
  opacity: 0.92;
  font-weight: 300;
}

.log-toolbar {
  max-width: 1200px;
  margin: 0 auto 20px auto;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}
.search-input {
  width: 340px;
}

.log-card {
  max-width: 1200px;
  margin: 0 auto 20px auto;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  overflow: visible;
  background: #fff;
}

.el-table {
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.empty-state {
  text-align: center;
  padding: 60px 0 40px 0;
}
.empty-icon {
  font-size: 54px;
  color: #bfbfbf;
  margin-bottom: 16px;
}
.empty-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
}
.empty-subtitle {
  color: #606266;
  font-size: 15px;
}

@media (max-width: 900px) {
  .log-header { padding: 32px 8px 16px 8px; }
  .main-title { font-size: 1.5rem; }
  .log-toolbar { flex-direction: column; gap: 10px; }
  .log-card, .log-toolbar { max-width: 99vw; }
  .search-input { width: 100%; }
}
</style>

    margin-right: 20px;
  }
  .el-dialog .el-input {
    width: 43%;
  }
  
  
  /* 很美观的CSS卡片 */
  
  
  /* 很美观的CSS表格 */
  
  
  /* 很美观的CSS表格标题 */
  .el-table-column {
    background-color: lightblue;
    color: white;
    padding: 10px;
    border: 1px solid white;
    text-align: center;
  }
  
  /* 很美观的CSS表格数据 */
  .el-table-column[type="index"],
  .el-table-column[prop="id"],
  .el-table-column[prop="username"],
  .el-table-column[prop="phone"],
  .el-table-column[prop="email"] {
    background-color: white;
    color: black;
    padding: 10px;
    border: 1px solid lightblue;
    text-align: center;
  }
  
  /* 很美观的CSS表格数据悬停效果 */
  .el-table-column[type="index"]:hover,
  .el-table-column[prop="id"]:hover,
  .el-table-column[prop="username"]:hover,
  .el-table-column[prop="phone"]:hover,
  .el-table-column[prop="email"]:hover {
    background-color: lightpink;
    color: white;
  }
  
  /* 很美观的CSS按钮悬停效果 */
  .el-button:hover {
    transform: scale(1.2);
  }
  
  /* 和这个代码一样的CSS */
  .el-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px;
  }
  
  /* 和这个代码一样的CSS总数 */
  .el-pagination__total {
    color: #606266;
    margin-right: 20px;
  }
  
  /* 和这个代码一样的CSS每页显示条数 */
  .el-pagination__sizes {
    display: flex;
    align-items: center;
    margin-right: 20px;
  }
  
  /* 和这个代码一样的CSS每页显示条数选择器 */
  .el-pagination__sizes .el-select {
    width: 100px;
  }
  
  /* 和这个代码一样的CSS上一页按钮 */
  .el-pagination__prev {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  
  /* 和这个代码一样的CSS上一页按钮图标 */
  .el-pagination__prev .el-icon {
    font-size: 20px;
    color: #409eff;
  }
  
  /* 和这个代码一样的CSS页码 */
  .el-pagination__pager {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  
  /* 和这个代码一样的CSS页码按钮 */
  .el-pagination__pager button {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: none;
    background-color: white;
    color: #606266;
    margin: 2px;
    transition: all 0.3s ease-in-out;
  }
  
  /* 和这个代码一样的CSS页码按钮悬停效果 */
  .el-pagination__pager button:hover {
    background-color: #409eff;
    color: white;
  }
  
  /* 和这个代码一样的CSS当前页码按钮 */
  .el-pagination__pager button.is-active {
    background-color: #409eff;
    color: white;
  }
  
  /* 和这个代码一样的CSS下一页按钮 */
  .el-pagination__next {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  
  /* 和这个代码一样的CSS下一页按钮图标 */
  .el-pagination__next .el-icon {
    font-size: 20px;
    color: #409eff;
  }
  
  /* 和这个代码一样的CSS跳转输入框 */
  .el-pagination__jump {
    display: flex;
    align-items: center;
  }
  
  /* 和这个代码一样的CSS跳转输入框标签 */
  .el-pagination__jump label {
    color: #606266;
  }
  
  /* 和这个代码一样的CSS跳转输入框输入框 */
  .el-pagination__jump input {
    width: 50px;
    height: 30px;
    border-radius: 4px;
    border: none;
  }