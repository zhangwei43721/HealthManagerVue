<template>
  <div class="password-page">
    <div class="register-form">
      <h1>修改资料</h1>

      <el-form
        :model="form"
        ref="form"
        :rules="rules"
        label-width="80px"
        class="form"
      >
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="" 
            :http-request="customUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

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
            placeholder="请输入新的密码 (留空则不修改)" 
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmNewPassword">
          <el-input
            v-model="form.confirmNewPassword"
            type="password"
            placeholder="请再次输入新的密码 (留空则不修改)"
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
import request from '@/utils/request';

export default {
  data() {
    return {
      imageUrl: '',
      form: {
        username: "",
        password: "",
        newPassword: "",
        confirmNewPassword: "",
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
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
        ],
        confirmNewPassword: [
          { validator: this.validateConfirmNewPassword, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.newPassword && !this.form.confirmNewPassword) {
            this.$message.error('请确认新的密码');
            return;
          }
          if (this.form.newPassword !== this.form.confirmNewPassword) {
             this.$message.error('两次输入的新密码不一致');
             return;
          }

          const requestBody = {
            username: this.form.username,
            password: this.form.password,
            newPassword: this.form.newPassword || null,
          };

          Object.keys(requestBody).forEach(key => {
             if (requestBody[key] === null || requestBody[key] === undefined) {
                delete requestBody[key];
             }
           });

          userApi
            .changePassword(requestBody)
            .then((response) => {
              this.$message({
                message: response.message || '密码修改成功',
                type: "success",
              });
            })
            .catch((error) => {
              const message = error.response?.data?.message || error.message || '密码修改失败';
              this.$message({
                message: message,
                type: "error",
              });
            });
        } else {
          console.log('表单校验不通过');
          return false;
        }
      });
    },
    validateConfirmNewPassword(rule, value, callback) {
      if (this.form.newPassword && value !== this.form.newPassword) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    },
    customUpload(options) {
      const formData = new FormData();
      formData.append('file', options.file);
      
      request({
        url: 'http://localhost:9401/file/user/avatar/upload',
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log("上传头像响应:", response);
        this.handleAvatarSuccess(response.data, options.file);
      }).catch(error => {
        console.error('上传头像失败:', error);
        const errorMessage = error.response?.data?.message || error.message || '上传失败';
        this.$message.error('上传失败: ' + errorMessage);
      });
    },
    handleAvatarSuccess(res, file) {
      console.log('头像上传成功，响应数据:', res);
      let url = null;
      if (res && res.data && res.data.url) {
        url = res.data.url;
      } else if (res && res.url) {
        url = res.url;
      }
      
      if (url) {
        this.imageUrl = url;
        this.$message.success('头像上传成功');
        
        // 直接 commit mutation 来更新 Vuex store 中的头像
        this.$store.commit('user/SET_AVATAR', url);

      } else {
        console.error('后端返回数据中没有找到头像 URL:', res);
        this.$message.warning('头像已上传，但获取图片地址失败');
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    }
  },
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

.avatar-uploader {
  margin-bottom: 20px;
  display: inline-block;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
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