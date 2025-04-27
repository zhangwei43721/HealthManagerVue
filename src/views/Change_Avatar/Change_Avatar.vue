<template>
  <div class="avatar-page">
    <div class="avatar-form">
      <h1>修改头像</h1>
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
      <div class="form-actions">
        <el-button type="primary" plain icon="el-icon-back" class="back-btn" @click="$router.push('/dashboard')">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ChangeAvatar',
  data() {
    return {
      imageUrl: ''
    }
  },
  methods: {
    customUpload(options) {
      const formData = new FormData()
      formData.append('file', options.file)
      formData.append('userId', this.$store.state.user.id)
      
      return request({
        url: 'http://localhost:9401/file/user/avatar/upload',
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        options.onSuccess(response.data, options.file)
      }).catch(error => {
        console.error('Upload failed:', error)
        options.onError(error)
        const errorMessage = error.response?.data?.message || error.message || '上传失败'
        this.$message.error('上传失败: ' + errorMessage)
      })
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      this.$message.success('头像上传成功')
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
}
</script>

<style>
.avatar-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}
.avatar-form {
  width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.avatar-uploader {
  text-align: center;
  margin: 20px 0;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.form-actions {
  text-align: center;
  margin-top: 20px;
}
</style>