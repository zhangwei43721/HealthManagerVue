<template>
  <el-dialog
    :visible.sync="visible"
    :width="dialogWidth"
    :before-close="handleClose"
    class="detail-dialog"
    top="6vh"
    append-to-body
    :close-on-click-modal="false"
  >
    <template #title>
      <span class="dialog-title">{{ fullDetail.sportType || detailInfo.sportType || '运动详情' }}</span>
    </template>
    <div class="knowledge-card detail-main-card">
      <div class="card-body">
        <div class="info-item">
          <span class="info-label"><i class="el-icon-time"></i> 适宜时间</span>
          <span class="info-value">{{ fullDetail.suitableTime || detailInfo.suitableTime || '暂无数据' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="el-icon-bangzhu"></i> 适宜心率</span>
          <span class="info-value">{{ fullDetail.suitableHeartRate || detailInfo.suitableHeartRate || '暂无数据' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="el-icon-date"></i> 适宜频率</span>
          <span class="info-value">{{ fullDetail.suitableFrequency || detailInfo.suitableFrequency || '暂无数据' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="el-icon-data-line"></i> 推荐速度</span>
          <span class="info-value">{{ fullDetail.recommendedSpeed || detailInfo.recommendedSpeed || '暂无数据' }}</span>
        </div>
        <el-divider class="info-divider"></el-divider>
        <div class="info-item">
          <span class="info-label label-danger"><i class="el-icon-remove-outline"></i> 禁忌疾病</span>
          <span class="info-value" v-html="(fullDetail.disease || detailInfo.disease || '暂无数据').replace(/；/g, '<br>')"></span>
        </div>
        <div class="info-item">
          <span class="info-label label-success"><i class="el-icon-s-opportunity"></i> 方法介绍</span>
          <span class="info-value" v-html="(fullDetail.method || detailInfo.method || '暂无数据').replace(/；/g, '<br>')"></span>
        </div>
        <div class="info-item">
          <span class="info-label label-warning"><i class="el-icon-warning-outline"></i> 注意事项</span>
          <span class="info-value" v-html="(fullDetail.notes || detailInfo.notes || '暂无数据').replace(/；/g, '<br>')"></span>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import sportApi from '@/api/Function_Menu';
export default {
  name: 'DetailDialog',
  data() {
    return {
      dialogWidth: '90vw', // 响应式宽度
    };
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    detailInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      fullDetail: { ...this.detailInfo }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.fetchDetail();
      } else {
        // 关闭时重置数据，避免上次详情影响下次弹窗
        this.fullDetail = { ...this.detailInfo };
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    async fetchDetail() {
      if (!this.detailInfo || !this.detailInfo.sportType) return;
      this.loading = true;
      try {
        const res = await sportApi.DetailInfo(this.detailInfo.sportType);
        console.log('DetailInfo返回：', res);
        let detail = {};
        if (res && res.data) {
          // 兼容后端返回 {code, data} 或直接是详情对象
          if (res.data.data) {
            detail = res.data.data;
          } else {
            detail = res.data;
          }
        }
        this.fullDetail = { ...this.detailInfo, ...detail };
      } catch (e) {
        this.$message.error('获取详情失败');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.detail-dialog ::v-deep .el-dialog__header {
  border-bottom: none;
  padding-bottom: 0;
}
.dialog-title {
  font-size: 1.35rem;
  color: #409EFF;
  font-weight: 700;
  letter-spacing: 1px;
}
.knowledge-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 32px 0 rgba(0,0,0,0.10), 0 1.5px 8px rgba(64,158,255,0.08);
  transition: box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}
.detail-main-card {
  border: 1.5px solid #409EFF;
  box-shadow: 0 8px 32px 0 rgba(64,158,255,0.12), 0 2px 8px rgba(64,158,255,0.08);
}
.card-header {
  padding: 18px 26px 10px 26px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  border-radius: 16px 16px 0 0;
}
.card-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #409EFF;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-body {
  padding: 30px 32px 24px 32px;
  flex-grow: 1;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  font-size: 17px;
}
.info-label {
  display: flex;
  align-items: center;
  color: #409EFF;
  font-size: 16px;
  font-weight: 600;
  min-width: 110px;
  gap: 6px;
}
.label-danger {
  color: #F56C6C;
}
.label-success {
  color: #67C23A;
}
.label-warning {
  color: #E6A23C;
}
.info-value {
  color: #303133;
  font-weight: 500;
  flex: 1;
  text-align: right;
  white-space: pre-line;
  word-break: break-all;
  margin-left: 12px;
}
.info-divider {
  margin: 18px 0 22px 0;
}
@media (max-width: 600px) {
  .card-body {
    padding: 14px 2px 10px 2px;
  }
  .card-title {
    font-size: 17px;
  }
  .info-item {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .info-label {
    min-width: 70px;
    font-size: 13px;
  }
}
.detail-dialog .el-dialog {
  border-radius: 12px !important;
  max-width: 600px;
  min-width: 320px;
}
.knowledge-card.detail-main-card {
  border-radius: 12px;
}
</style>
