<template>
  <div class="knowledge-container">
    <!-- 顶部标题和搜索区域 -->
    <div class="knowledge-header page-header">
      <h1 class="page-title">健康知识库</h1>
      <p class="page-description">发现适合你的运动和健康生活方式</p>
    </div>
    <div class="search-box" style="margin: 0 auto 24px auto; max-width: 420px;">
      <el-input 
        placeholder="搜索运动种类" 
        v-model="searchText" 
        class="search-input"
        prefix-icon="el-icon-search"
        @keyup.enter.native="Search"
        clearable
      >
        <el-button slot="append" icon="el-icon-search" @click="Search">搜索</el-button>
      </el-input>
    </div>
    <!-- 内容区域 -->
    <div class="knowledge-content">
      <!-- 筛选和结果数量 -->
      <div class="filter-bar" v-if="!loading">
        <div class="result-count">
          <span class="count-text">
            <template v-if="isFiltered">
              找到 <strong>{{ sportInfos.length }}</strong> 条相关运动知识
              
</template>
            <template v-else>
              共 <strong>{{ sportInfos.length }}</strong> 种运动类型
              
</template>
          </span>
        </div>
        <div class="filter-actions">
          <el-button 
            v-if="isFiltered" 
            size="small" 
            icon="el-icon-refresh" 
            @click="resetSearch"
          >
            重置搜索
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <el-skeleton animated>
            <template slot="template">
              <el-skeleton-item variant="image" style="width: 100%; height: 100px" />
              <div style="padding: 14px">
                <el-skeleton-item variant="h3" style="width: 50%" />
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px">
                  <el-skeleton-item variant="text" style="margin-right: 16px" />
                  <el-skeleton-item variant="text" style="width: 30%" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="sportInfos.length === 0" class="empty-state">
        <i class="el-icon-data-analysis empty-icon"></i>
        <h3 class="empty-title">暂无相关运动知识</h3>
        <p class="empty-subtitle">请尝试使用其他关键词搜索，或查看所有运动类型</p>
        <el-button type="primary" @click="resetSearch">查看所有运动类型</el-button>
      </div>

      <!-- 知识卡片网格 -->
      <div v-else class="knowledge-grid">
        <div
          v-for="(sportInfo, index) in sportInfos"
          :key="sportInfo.id"
          class="knowledge-card"
        >
          <div class="card-header">
            <h3 class="card-title">{{ sportInfo.sportType }}</h3>
            <span class="card-tag" :class="getTagClass(index)">运动</span>
          </div>
          
          <div class="card-body">
            <div class="info-item">
              <i class="el-icon-time info-icon"></i>
              <div class="info-content">
                <span class="info-label">适宜时间</span>
                <span class="info-value">{{ sportInfo.suitableTime }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <i class="el-icon-bangzhu info-icon"></i>
              <div class="info-content">
                <span class="info-label">适宜心率</span>
                <span class="info-value">{{ sportInfo.suitableHeartRate }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <i class="el-icon-date info-icon"></i>
              <div class="info-content">
                <span class="info-label">适宜频率</span>
                <span class="info-value">{{ sportInfo.suitableFrequency }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <i class="el-icon-data-line info-icon"></i>
              <div class="info-content">
                <span class="info-label">推荐速度</span>
                <span class="info-value">{{ sportInfo.recommendedSpeed }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-view" 
              class="detail-button"
              @click="goToDetail(sportInfo.sportType, sportInfo)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <DetailDialog 
      :visible.sync="detailDialogVisible" 
      :detailInfo="currentDetailInfo"
      @close="detailDialogVisible = false"
    />
  </div>
</template>

<script>
import sportApi from "@/api/Function_Menu";
import DetailDialog from '@/components/DetailDialog.vue';

export default {
  name: 'KnowledgeView',
  components: {
    DetailDialog
  },
  data() {
    return {
      detailDialogVisible: false,
      currentDetailInfo: {},
      loading: true,
      searchText: "",
      sportInfos: [],
      DetailInfo: [],
      originalSportInfos: [], // 存储原始数据用于重置
      isFiltered: false, // 记录是否已经过滤
      tagColors: ['success', 'warning', 'danger', 'info', 'primary'], // 标签颜色列表
      // 新增分页相关变量
      pageNo: 1,
      pageSize: 10,
      total: 0,
      // 无限滚动相关
      isAllLoaded: false,
      scrollLoading: false
    };
  },

  async created() {
    await this.fetchAllSportInfo();
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 获取标签类名
    getTagClass(index) {
      return this.tagColors[index % this.tagColors.length];
    },
    
    // 跳转到详情页
    // 弹窗方式展示详情
    goToDetail(sportName, sportInfo) {
      this.currentDetailInfo = sportInfo;
      this.detailDialogVisible = true;
    },
    /*
    // 如需异步加载详情，使用此方法
    async fetchDetailInfo(sportName, sportInfo) {
      this.$notify({
        title: '正在加载',
        message: `正在加载 ${sportName} 的详细信息`,
        type: 'info',
        duration: 2000
      });
      try {
        const response = await sportApi.DetailInfo(sportName);
        const detailInfo = response.data;
        const mergedInfo = { ...detailInfo, ...sportInfo };
        this.currentDetailInfo = mergedInfo;
        this.detailDialogVisible = true;
      } catch (error) {
        this.$notify({
          title: '加载失败',
          message: '获取详情信息失败，请稍后重试',
          type: 'error'
        });
      }
    },
    */

    // 获取所有运动信息（支持追加）
    async fetchAllSportInfo(pageNo = this.pageNo, pageSize = this.pageSize, append = false) {
      if (this.isAllLoaded || this.scrollLoading) return;
      this.loading = this.pageNo === 1;
      this.scrollLoading = true;
      try {
        const response = await sportApi.getAllSportInfo(pageNo, pageSize);
        const { rows, total } = response.data;
        const sportInfos = rows.slice();
        const formattedSportInfos = sportInfos.map((info) => ({
          id: info.id,
          sportType: info.sportType,
          suitableTime: info.suitableTime || '任意时间',
          suitableHeartRate: info.suitableHeartRate || '根据个人情况',
          suitableFrequency: info.suitableFrequency || '每周 3-5 次',
          recommendedSpeed: info.recommendedSpeed || '中等强度',
        }));
        if (append) {
          this.sportInfos = [...this.sportInfos, ...formattedSportInfos];
        } else {
          this.sportInfos = formattedSportInfos;
        }
        this.originalSportInfos = [...this.sportInfos];
        this.total = total;
        // 判断是否全部加载
        if (this.sportInfos.length >= total) {
          this.isAllLoaded = true;
        }
      } catch (error) {
        this.$notify({
          title: '加载失败',
          message: '无法获取运动知识数据，请刷新页面重试',
          type: 'error',
          duration: 0
        });
        console.error(error);
      } finally {
        this.loading = false;
        this.scrollLoading = false;
      }
    },
    // 滚动触底加载
    handleScroll() {
      if (this.loading || this.scrollLoading || this.isAllLoaded) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      if (scrollTop + windowHeight + 100 >= docHeight) {
        // 快到底部时加载下一页
        this.pageNo++;
        this.fetchAllSportInfo(this.pageNo, this.pageSize, true);
      }
    },
    // 搜索功能（重置分页和数据）
    async Search() {
      if (!this.searchText.trim()) {
        this.resetSearch();
        return;
      }
      this.pageNo = 1;
      this.isAllLoaded = false;
      this.loading = true;
      try {
        const response = await sportApi.getAllSportInfo(this.pageNo, this.pageSize);
        const { rows, total } = response.data;
        const filteredSportInfoData = rows.filter((info) => {
          return info.sportType.toLowerCase().includes(this.searchText.toLowerCase());
        });
        const sportInfos = filteredSportInfoData.map((info) => ({
          id: info.id,
          sportType: info.sportType,
          suitableTime: info.suitableTime || '任意时间',
          suitableHeartRate: info.suitableHeartRate || '根据个人情况',
          suitableFrequency: info.suitableFrequency || '每周 3-5 次',
          recommendedSpeed: info.recommendedSpeed || '中等强度',
        }));
        this.sportInfos = sportInfos;
        this.isFiltered = true;
        this.total = total;
        this.originalSportInfos = [...sportInfos];
        if (sportInfos.length >= total) {
          this.isAllLoaded = true;
        } else {
          this.isAllLoaded = false;
        }
        if (sportInfos.length > 0) {
          this.$message({
            message: `找到 ${sportInfos.length} 条相关运动知识`,
            type: "success",
          });
        } else {
          this.$message({
            message: "没有找到相关运动知识",
            type: "warning",
          });
        }
      } catch (error) {
        this.$message.error('搜索过程中出现错误，请重试');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    // 重置搜索
    resetSearch() {
      this.searchText = "";
      this.pageNo = 1;
      this.isAllLoaded = false;
      this.fetchAllSportInfo();
      this.isFiltered = false;
      this.$message({
        message: "已重置搜索结果",
        type: "info",
      });
    },
  },
};
</script>



<style scoped>
/* 容器样式 */
.knowledge-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  padding-bottom: 50px;
}

/* 顶部样式 */
.knowledge-header {
  background: none;
  padding: 0;
  color: inherit;
  text-align: center;
  margin-bottom: 28px;
  box-shadow: none;
}

.header-content,
.main-title,
.subtitle {
  all: unset;
}

/* 搜索框样式 */
.search-box {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-input >>> .el-input__inner {
  height: 50px;
  padding-left: 20px;
  font-size: 16px;
}

/* 内容区域样式 */
.knowledge-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选栏样式 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.count-text {
  color: #606266;
  font-size: 14px;
}

.count-text strong {
  color: #409EFF;
  font-weight: 600;
}

/* 加载状态样式 */
.loading-state {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.skeleton-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 60px;
  color: #909399;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 10px;
}

.empty-subtitle {
  color: #606266;
  margin-bottom: 20px;
}

/* 知识卡片网格样式 */
.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.knowledge-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.knowledge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.card-tag.success {
  background-color: #67C23A;
}

.card-tag.warning {
  background-color: #E6A23C;
}

.card-tag.danger {
  background-color: #F56C6C;
}

.card-tag.info {
  background-color: #909399;
}

.card-tag.primary {
  background-color: #409EFF;
}

.card-body {
  padding: 20px;
  flex-grow: 1;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.info-icon {
  font-size: 18px;
  color: #409EFF;
  margin-right: 10px;
  margin-top: 2px;
}

.info-content {
  flex: 1;
}

.info-label {
  display: block;
  color: #909399;
  font-size: 13px;
  margin-bottom: 3px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.card-footer {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.detail-button {
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .knowledge-header {
    padding: 40px 20px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .result-count {
    margin-bottom: 10px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.knowledge-card {
  animation: fadeIn 0.5s ease-in-out;
  animation-fill-mode: both;
}

.knowledge-card:nth-child(1) { animation-delay: 0.1s; }
.knowledge-card:nth-child(2) { animation-delay: 0.2s; }
.knowledge-card:nth-child(3) { animation-delay: 0.3s; }
.knowledge-card:nth-child(4) { animation-delay: 0.4s; }
.knowledge-card:nth-child(5) { animation-delay: 0.5s; }
.knowledge-card:nth-child(6) { animation-delay: 0.6s; }
</style>