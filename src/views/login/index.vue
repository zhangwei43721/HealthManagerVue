<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">
      <el-row :gutter="24" style="text-align: center; width: 100%;">
        <el-col :span="24" style="display: flex; align-items: center;">
          <i class="el-icon-s-custom" style="font-size: 40px; color: #409EFF; margin-right: 10px;"></i>
          <span style="font-size: 32px;font-weight: 600;">健康管理系‌统</span>
        </el-col>
      </el-row>
      <hr>

      <!-- 用户名输入框 -->
      <el-form-item prop="username" class="input-container">
        <el-input v-model="loginForm.username" placeholder="用户名" name="username" type="text" tabindex="1"
          auto-complete="on" prefix-icon="el-icon-user" />
      </el-form-item>

      <!-- 密码输入框 -->
      <el-form-item prop="password" class="input-container">
        <el-input :key="passwordType" v-model="loginForm.password" :type="passwordType" placeholder="密码"
          name="password" tabindex="2" auto-complete="on" prefix-icon="el-icon-lock" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <i :class="passwordType === 'password' ? 'el-icon-view' : 'el-icon-view-off'" style="cursor: pointer;"></i>
        </span>
      </el-form-item>

      <el-form-item>
        <el-button :loading="loading" type="success" style="width: 100%;"
          @click.native.prevent="handleLogin">登 录</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%;"
          @click.native.prevent="handleRegister">注 册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";

export default {
  name: "Login",
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error("请输入正确的用户名"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("输入的密码不能少于6位"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
    };
  },
  methods: {
    showPwd() {
      this.passwordType =
        this.passwordType === "password" ? "text" : "password";
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    handleRegister() {
      this.$router.push({ path: "/register" });
    },
  },
};
</script>

<style lang="scss">
$bg: #2d3a4b;
$dark_gray: black;

.login-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    position: relative;
    width: 400px;
    max-width: 100%;
    padding: 20px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
  }

  .el-form-item__content {
    width: 100% !important; 
  }

  .input-container {
    display: flex;
    align-items: center;

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
      font-size: 24px;
      color: grey;
    }
  }

  .show-pwd {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 20px;
  }

  .el-form-item {
    margin-bottom: 20px;
    position: relative;
    width: 100%;
  }

  
}
</style>