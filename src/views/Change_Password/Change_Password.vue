<template>
  <div class="password-page">
    <div class="register-form">
      <h1>修改密码</h1>
      <el-form
        :model="form"
        ref="form"
        :rules="rules"
        label-width="80px"
        class="form"
      >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="当前密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入当前密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="新的密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新的密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmNewPassword">
        <el-input
          v-model="form.confirmNewPassword"
          type="password"
          placeholder="请再次输入新的密码"
        ></el-input>
      </el-form-item>
      <div class="form-actions">
          <el-button type="primary" plain icon="el-icon-back" class="back-btn" @click="$router.push('/dashboard')">返回</el-button>
          <el-button type="primary" class="submit-btn" @click="submitForm">提交</el-button>
        </div>
          </el-form>
    </div>
  </div>
</template>
<script>
import userApi from "@/api/userManage";

export default {
  data() {
    return {
      form: {
        username: "",
        password: "",
        newPassword: "",
        confirmNewPassword: "",
        id: null,
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入当前密码", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
        ],
        newPassword: [
          { required: true, message: "请输入新的密码", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
        ],
        confirmNewPassword: [
          { required: true, message: "确认密码", trigger: "blur" },
          { validator: this.validateConfirmNewPassword, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 构造请求体
          const requestBody = {
            id: this.id,
            username: this.form.username,
            password: this.form.password,
            newPassword: this.form.newPassword,
          };
          //提交验证给后台
          userApi
            .changePassword(requestBody)
            .then((response) => {
              //成功提示
              this.$message({
                message: response.message,
                type: "success",
              });
              this.$router.replace('/login');
            })
            
            .catch((error) => {
              //错误提示
              this.$message({
                message: error.response.data.message,
                type: "error",
              });
            });
        } else {
          //表单校验不通过
          return false;
        }
      });
    },
    validateConfirmNewPassword(rule, value, callback) {
      if (value !== this.form.newPassword) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    },

     getUserId() {
      userApi
        .getUserId()
        .then((response) => {
          console.log(response)
          // 成功获取用户ID
          this.id = response.data.userId;
          // 其他逻辑
        })
        .catch((error) => {
          // 处理错误情况
        });
    },


    
  },

  created(){
    this.getUserId();
  }
};
</script> 
  <style scoped>
.password-page {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 60px;
}

.form-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
  margin-top: 18px;
}

.back-btn {
  font-size: 16px;
  border-radius: 25px;
  padding: 10px 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin: 0 8px;
}

.submit-btn {
  margin: 0 8px;
}

.submit-btn {
  font-size: 18px;
  border-radius: 25px;
  padding: 12px 36px;
  background: linear-gradient(90deg, #4f8cff 0%, #6fc3ff 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.08);
  transition: background 0.3s;
}

.submit-btn:hover {
  background: linear-gradient(90deg, #357ae8 0%, #4f8cff 100%);
}


.back-btn {
  font-size: 16px;
  border-radius: 25px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.register-form {
  width: 90vw;
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 32px 32px 32px;
  background-color: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  font-family: 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-form h1 {
  margin-top: 0;
  margin-bottom: 24px;
  text-align: center;
  font-size: 2.1rem;
  font-weight: 700;
  color: #2d3a4b;
  letter-spacing: 2px;
}

.form {
  width: 100%;
  margin-top: 10px;
}

.el-form-item {
  margin-bottom: 22px;
}

.el-input__inner {
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
}



@media (max-width: 600px) {
  .register-form {
    padding: 24px 8px 18px 8px;
    max-width: 98vw;
  }
  .form-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  .back-btn, .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>