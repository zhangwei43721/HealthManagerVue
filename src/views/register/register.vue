<template>
  <div class="register-container">
    <el-form ref="form" :model="form" :rules="rules" class="register-form" auto-complete="on" label-position="left">
      <el-row :gutter="24" style="text-align: center; width: 100%;">
        <el-col :span="24" style="display: flex; align-items: center;">
          <i class="el-icon-plus" style="font-size: 40px; color: #409EFF; margin-right: 10px;"></i>
          <span style="font-size: 32px;font-weight: 600;">用户注册</span>
        </el-col>
      </el-row>
      <hr>

      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户名" name="username" type="text" auto-complete="on">
          <i slot="prefix" class="el-icon-user" style="font-size: 20px; color: grey;"></i>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" name="password" auto-complete="on">
          <i slot="prefix" class="el-icon-lock" style="font-size: 20px; color: grey;"></i>
        </el-input>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" name="confirmPassword" auto-complete="on">
          <i slot="prefix" class="el-icon-lock" style="font-size: 20px; color: grey;"></i>
        </el-input>
      </el-form-item>

      <el-button type="success" style="width: 100%; margin-bottom: 20px" @click="submitForm">注册新账号</el-button>
      
      <div>
        <el-button type="primary" style="width: 100%; margin-bottom: 20px;" @click="handleBackToLogin">返回登录</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import userApi from "@/api/userManage";

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const requestBody = {
            username: this.form.username,
            password: this.form.password,
            email: this.form.email
          };
          userApi.register(requestBody).then(response => {
            this.$message({
              message: response.message,
              type: "success"
            });
            this.$router.push('/login');
          });
        } else {
          return false;
        }
      });
    },
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    },
    handleBackToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped lang="scss">
$bg: #2d3a4b;
$dark_gray: black;

.register-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg;
  display: flex;
  justify-content: center;
  align-items: center;

  .register-form {
    position: relative;
    width: 400px; 
    max-width: 100%;
    padding: 20px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);

    .el-form-item__content {
      width: 100% !important; 
    }

    .el-input__inner {
      height: 50px;
      padding-left: 45px;
      background-color: #f7f7f7;
      border-radius: 5px;
      width: 100%; 
      box-sizing: border-box; 
    }

    .el-input__icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      color: grey;
    }

    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
    }

    
  }
}
</style>
