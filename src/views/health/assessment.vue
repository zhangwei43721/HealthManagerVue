<template>
  <div class="health-report-container">
    <!-- 加载状态显示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-animation">
        <svg class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none"></circle>
        </svg>
        <p>正在生成健康评估报告...</p>
      </div>
    </div>
    
    <!-- 错误状态显示 -->
    <div v-else-if="error" class="error-container">
      <svg class="error-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
      <h3 class="error-title">报告生成失败</h3>
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="fetchBodyInfo">重试</button>
    </div>

    <!-- 主要内容区域，仅在数据加载成功且无错误时显示 -->
    <div v-else-if="bodyInfo" class="report-content">
      <div class="report-header">
        <h1 class="report-title">健康评估报告</h1>
        <p class="report-subtitle">基于您的身体数据生成的专业健康分析</p>
        <div class="report-date">生成日期：{{ getCurrentDate() }}</div>
      </div>
      
      <div class="report-grid">
        <!-- 健康评分卡片 -->
        <div class="card score-card">
          <div class="card-header">
            <svg class="card-icon" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
            </svg>
            <h3 class="card-title">综合健康评分</h3>
          </div>
          <div class="score-content">
            <div class="score-circle" :style="{ background: scoreGradient }">
              <div class="score-number">{{ calculatedScore }}</div>
              <div class="score-unit">分</div>
            </div>
            <div class="score-level">{{ scoreLevel }}</div>
            <div class="score-description">基于录入数据的综合评估</div>
          </div>
        </div>

        <!-- 身体基础信息卡片 -->
        <div class="card info-card">
          <div class="card-header">
            <svg class="card-icon" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <h3 class="card-title">身体基础信息</h3>
          </div>
          <div class="info-list">
            <div v-for="item in basicInfoItems" :key="item.label" class="info-item">
              <span class="info-label">{{ item.label }}</span>
              <span class="info-value" :class="{'highlight': item.highlight}">
                {{ item.value !== null && item.value !== undefined ? item.value : '-' }}
                <span v-if="item.unit" class="unit">{{ item.unit }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- BMI指数卡片 -->
        <div class="card bmi-card">
          <div class="card-header">
            <svg class="card-icon" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
            </svg>
            <h3 class="card-title">身体质量指数 (BMI)</h3>
          </div>
          <div class="bmi-analysis">
            <div class="bmi-value">{{ Number(bmi).toFixed(1) }}</div>
            <div class="bmi-slider">
              <div class="bmi-track">
                <div class="bmi-progress" :style="{ width: bmiPercentage + '%', backgroundColor: bmiColor }"></div>
                <div class="bmi-thumb" :style="{ left: bmiPercentage + '%', backgroundColor: bmiColor }"></div>
              </div>
              <div class="bmi-scale">
                <div class="bmi-mark" style="left: 0%">
                  <div class="bmi-mark-value">18.5</div>
                  <div class="bmi-mark-label">偏瘦</div>
                </div>
                <div class="bmi-mark" style="left: 25%">
                  <div class="bmi-mark-value">24</div>
                  <div class="bmi-mark-label">正常</div>
                </div>
                <div class="bmi-mark" style="left: 50%">
                  <div class="bmi-mark-value">28</div>
                  <div class="bmi-mark-label">超重</div>
                </div>
                <div class="bmi-mark" style="left: 75%">
                  <div class="bmi-mark-value">35</div>
                  <div class="bmi-mark-label">肥胖</div>
                </div>
              </div>
            </div>
            <div class="bmi-text">
              <div class="body-type">体型判断: <span class="highlight">{{ bodyType }}</span></div>
              <div class="risk-analysis">
                <div><span class="risk-label">健康风险:</span> <span class="risk-value">{{ obesityHealthRisk }}</span></div>
                <div><span class="risk-label">疾病风险:</span> <span class="risk-value">{{ obesityDiseaseRisk }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 基础能量消耗状况 -->
        <div class="card energy-card">
          <div class="card-header">
            <svg class="card-icon" viewBox="0 0 24 24">
              <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 1.6 1.5v6.5h2v-9l-5.7-3.1zM17.7 10.3c-.6-.3-1.2.1-1.4.7L15 16.4l-1.2-2.1c-.3-.5-.9-.6-1.4-.3l-1 .6c-1.7 1-3.4 1.5-5.4 1.5v2c2.3 0 4.4-.6 6.3-1.7l.6 1c.3.5.9.6 1.4.3l1-.6c.5-.3.6-.9.3-1.4l-1.2-2.1L17 11l2.4 5.9h2L18 9l-.3-1.2z"/>
            </svg>
            <h3 class="card-title">基础能量消耗</h3>
          </div>
          <div class="energy-consumption">
            <div class="energy-chart">
              <svg class="circular-chart" viewBox="0 0 36 36">
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle"
                  :stroke="energyColor"
                  :stroke-dasharray="`${calculatedBMRPercentage}, 100`"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" class="percentage">{{ calculatedBMRPercentage }}%</text>
              </svg>
            </div>
            <div class="energy-text">
              <div class="energy-comparison">比同龄人群高出 <span class="highlight">{{ calculatedBMRPercentage }}%</span></div>
              <div class="energy-daily">每日基础能量消耗约 <span class="highlight">{{ calculatedBMR }}</span> 千卡</div>
            </div>
          </div>
        </div>

        <!-- 健康风险分析 -->
        <div class="card risk-card">
          <div class="card-header">
            <svg class="card-icon" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <h3 class="card-title">健康风险分析</h3>
          </div>
          <div class="risk-analysis-content">
            <div class="risk-item">
              <div class="risk-title">可能的健康风险：</div>
              <div class="risk-content">{{ calculatedRisk || '暂无数据评估' }}</div>
            </div>
            <div class="suggestion-item">
              <div class="suggestion-title">体型建议：</div>
              <div class="suggestion-content">{{ bodyTypeSuggestion }}</div>
            </div>
            <div class="disclaimer">
              <svg class="disclaimer-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>以上分析仅供参考，不能替代专业医疗诊断。如有不适，请及时就医。</span>
            </div>
          </div>
        </div>

        <!-- 生活习惯分析 -->
        <div class="card habits-card">
          <div class="card-header">
            <svg class="card-icon" viewBox="0 0 24 24">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <h3 class="card-title">生活习惯分析</h3>
          </div>
          <div class="habits-content">
            <div class="habits-summary">
              {{ calculatedHabits || '暂无数据评估' }}
            </div>
            <div class="habits-suggestion">
              <div class="suggestion-title">建议：</div>
              <div class="suggestion-content">
                培养健康的饮食习惯和作息规律，坚持适度运动。了解科学的运动知识，有助于制定合理的计划并避免运动损伤。
              </div>
            </div>
          </div>
        </div>

        <!-- 视力分析 -->
        <div class="card vision-card">
          <div class="card-header">
            <svg class="card-icon" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <h3 class="card-title">视力分析</h3>
          </div>
          <div class="vision-content">
            <div class="vision-info">
              <div class="info-item">
                <span class="info-label">您的视力：</span>
                <span class="info-value">{{ bodyInfo.vision !== null ? bodyInfo.vision : '-' }} <span v-if="bodyInfo.vision !== null" class="unit">度</span></span>
              </div>
              <div class="info-item">
                <span class="info-label">近视等级：</span>
                <span class="info-value highlight">{{ visionType }}</span>
              </div>
            </div>
            <div class="vision-gauge">
              <div class="gauge-track">
                <div class="gauge-progress" :style="{ width: visionPercentage + '%', backgroundColor: visionColor }"></div>
              </div>
              <div class="gauge-labels">
                <span>正常</span>
                <span>轻度</span>
                <span>中度</span>
                <span>重度</span>
              </div>
            </div>
            <div class="vision-suggestion">
              <div class="suggestion-title">建议：</div>
              <div class="suggestion-content">{{ visionSuggestion }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据为空或加载失败时的占位提示 -->
    <div v-else class="empty-container">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
      </svg>
      <p class="empty-text">暂无健康评估数据，请先录入身体信息。</p>
      <button class="empty-button" @click="navigateToBodyInfo">录入身体信息</button>
    </div>
  </div>
</template>

<script>
import healthReportLogic from './HealthReport.logic.js';

export default {
  ...healthReportLogic,
  computed: {
    ...(healthReportLogic.computed || {}),
    
    // 高亮基础信息项
    basicInfoItems() {
      const items = [
        { label: '身高', value: this.bodyInfo?.height, unit: 'cm' },
        { label: '体重', value: this.bodyInfo?.weight, unit: 'kg' },
        { label: '年龄', value: this.bodyInfo?.age, unit: '岁' },
        { label: '性别', value: this.bodyInfo?.gender === 'male' ? '男' : '女' },
        { label: 'BMI', value: this.bmi ? Number(this.bmi).toFixed(1) : null, highlight: true },
        { label: '体脂率', value: this.bodyInfo?.fatRate ? (this.bodyInfo.fatRate * 100).toFixed(1) : null, unit: '%', highlight: true }
      ];
      
      return items.filter(item => item !== undefined);
    },
    
    // BMI 颜色
    bmiColor() {
      if (this.bmi == null) return '#e0e0e0';
      if (this.bmi < 18.5) return '#3498db';  // 蓝色 - 偏瘦
      if (this.bmi < 24) return '#2ecc71';    // 绿色 - 正常
      if (this.bmi < 28) return '#f39c12';    // 橙色 - 超重
      return '#e74c3c';                       // 红色 - 肥胖
    },
    
    // BMI 百分比计算
    bmiPercentage() {
      if (this.bmi == null) return 0;
      // 假设 BMI 范围在 15-40 之间
      const minBmi = 15;
      const maxBmi = 40;
      const percentage = ((this.bmi - minBmi) / (maxBmi - minBmi)) * 100;
      return Math.min(Math.max(percentage, 0), 100);
    },
    
    // 基础代谢率
    calculatedBMR() {
      return (this.bodyInfo && this.bodyInfo.bmr) ? this.bodyInfo.bmr : 0;
    },
    
    // 基础代谢率百分比
    calculatedBMRPercentage() {
      // 假设一个相对值，实际应该根据同龄人群平均值计算
      return this.calculatedBMR > 0 ? Math.min(Math.round((this.calculatedBMR / 1500) * 100), 100) : 0;
    },
    
    // 能量消耗颜色
    energyColor() {
      const percentage = this.calculatedBMRPercentage;
      if (percentage < 30) return '#3498db';  // 低 - 蓝色
      if (percentage < 70) return '#2ecc71';  // 中 - 绿色
      return '#f39c12';                       // 高 - 橙色
    },
    
    // 健康评分等级
    scoreLevel() {
      const score = this.calculatedScore;
      if (score >= 90) return '优秀';
      if (score >= 80) return '良好';
      if (score >= 70) return '一般';
      if (score >= 60) return '较差';
      return '差';
    },
    
    // 健康评分渐变色
    scoreGradient() {
      const score = this.calculatedScore;
      if (score >= 90) return 'linear-gradient(135deg, #2ecc71, #27ae60)';
      if (score >= 80) return 'linear-gradient(135deg, #3498db, #2980b9)';
      if (score >= 70) return 'linear-gradient(135deg, #f39c12, #e67e22)';
      if (score >= 60) return 'linear-gradient(135deg, #e74c3c, #c0392b)';
      return 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
    },
    
    // 视力百分比
    visionPercentage() {
      if (this.bodyInfo.vision === null) return 0;
      // 视力度数范围，假设 0-1000 度
      const maxVision = 1000;
      const percentage = (this.bodyInfo.vision / maxVision) * 100;
      return Math.min(Math.max(percentage, 0), 100);
    },
    
    // 视力颜色
    visionColor() {
      if (this.bodyInfo.vision === null) return '#e0e0e0';
      if (this.bodyInfo.vision < 300) return '#2ecc71';  // 正常/轻度 - 绿色
      if (this.bodyInfo.vision < 600) return '#f39c12';  // 中度 - 橙色
      return '#e74c3c';                                  // 重度 - 红色
    }
  },
  methods: {
    ...healthReportLogic.methods,
    
    // 获取当前日期
    getCurrentDate() {
      const date = new Date();
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    // 导航到身体信息页面
    navigateToBodyInfo() {
      // 实际项目中应该有路由跳转
      this.$router?.push('/body-info') || alert('请前往身体信息页面录入数据');
    }
  },
  mounted() {
    this.fetchBodyInfo();
    // 屏蔽所有 iconfont 相关内容
    // 1. 移除所有 class 含 iconfont 的元素
    document.querySelectorAll('[class*="iconfont"]').forEach(el => el.remove());
    // 2. 移除所有包含 iconfont 的 <style>、<link>
    document.querySelectorAll('style').forEach(style => {
      if (style.innerText.includes('iconfont')) style.remove();
    });
    document.querySelectorAll('link').forEach(link => {
      if (link.href && link.href.includes('iconfont')) link.remove();
    });
  }
};
</script>

<style>
:root {
  --primary-color: #3498db;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-color: #ecf0f1;
  --background-color: #f8fafc;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --border-radius: 12px;
  --transition-speed: 0.3s;
  --card-padding: 20px;
}

/* 基础容器样式 */
.health-report-container {
  padding: 20px;
  background-color: var(--background-color);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-primary);
  line-height: 1.5;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.loading-animation {
  text-align: center;
}

.circular {
  width: 60px;
  height: 60px;
  animation: loading-rotate 2s linear infinite;
}

.path {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 4;
  stroke: var(--primary-color);
  stroke-linecap: round;
  animation: loading-dash 1.5s ease-in-out infinite;
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* 错误状态样式 */
.error-container {
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.error-icon {
  width: 60px;
  height: 60px;
  fill: var(--danger-color);
  margin-bottom: 20px;
}

.error-title {
  color: var(--danger-color);
  font-size: 20px;
  margin: 0 0 15px 0;
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.retry-button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-speed);
}

.retry-button:hover {
  background-color: #2980b9;
}

/* 报告内容样式 */
.report-content {
  animation: fadeIn 0.5s ease-in-out;
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
}

.report-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.report-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0 0 5px 0;
}

.report-date {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 网格布局 */
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px var(--card-padding);
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(247, 250, 252, 0.6);
}

.card-icon {
  width: 24px;
  height: 24px;
  fill: var(--primary-color);
  margin-right: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 信息卡片样式 */
.info-list {
  padding: var(--card-padding);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.unit {
  color: var(--text-secondary);
  font-size: 12px;
  margin-left: 2px;
  font-weight: 400;
}

/* 健康评分卡片 */
.score-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--card-padding);
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  color: white;
}

.score-number {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}

.score-unit {
  font-size: 16px;
  margin-top: 5px;
}

.score-level {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.score-description {
  font-size: 14px;
  color: var(--text-secondary);
}

/* BMI卡片样式 */
.bmi-analysis {
  padding: var(--card-padding);
}

.bmi-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 15px;
}

.bmi-slider {
  margin-bottom: 20px;
}

.bmi-track {
  position: relative;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-bottom: 5px;
}

.bmi-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 5px;
}

.bmi-thumb {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.bmi-scale {
  position: relative;
  height: 45px;
}

.bmi-mark {
  position: absolute;
  transform: translateX(-50%);
}

.bmi-mark-value {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 3px;
}

.bmi-mark-label {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
}

.bmi-text {
  margin-top: 15px;
}

.body-type {
  font-size: 14px;
  margin-bottom: 10px;
}

.risk-analysis {
  font-size: 14px;
}

.risk-label {
  color: var(--text-secondary);
  display: inline-block;
  width: 80px;
}

.risk-value {
  color: var(--text-primary);
}

/* 能量消耗样式 */
.energy-consumption {
  display: flex;
  align-items: center;
  padding: var(--card-padding);
}

.energy-chart {
  flex-shrink: 0;
}

.circular-chart {
  width: 120px;
  height: 120px;
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke-width: 3.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.percentage {
  fill: var(--text-primary);
  font-size: 0.45em;
  text-anchor: middle;
  font-weight: bold;
}

.energy-text {
  margin-left: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.energy-comparison, .energy-daily {
  margin-bottom: 8px;
}

/* 风险分析样式 */
.risk-analysis-content, .habits-content, .vision-content {
  padding: var(--card-padding);
}

.risk-item, .suggestion-item {
  margin-bottom: 15px;
}

.risk-title, .suggestion-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.risk-content, .suggestion-content, .habits-summary {
  color: var(--text-secondary);
  line-height: 1.6;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  color: var(--danger-color);
  margin-top: 15px;
}

.disclaimer-icon {
  width: 16px;
  height: 16px;
  fill: var(--danger-color);
  margin-right: 8px;
  flex-shrink: 0;
}

/* 视力分析样式 */
.vision-info {
  margin-bottom: 15px;
}

.vision-gauge {
  margin-bottom: 15px;
}

.gauge-track {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 5px;
  overflow: hidden;
}

.gauge-progress {
  height: 100%;
  border-radius: 4px;
}

.gauge-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.vision-suggestion {
  margin-top: 15px;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  text-align: center;
}

.empty-icon {
  width: 60px;
  height: 60px;
  fill: var(--text-secondary);
  margin-bottom: 20px;
}

.empty-text {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.empty-button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-speed);
}

.empty-button:hover {
  background-color: #2980b9;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .health-report-container {
    padding: 15px;
  }
  
  .report-grid {
    grid-template-columns: 1fr;
  }
  
  .card {
    margin-bottom: 15px;
  }
  
  .energy-consumption {
    flex-direction: column;
  }
  
  .energy-text {
    margin-left: 0;
    margin-top: 15px;
    text-align: center;
  }
  
  .score-circle {
    width: 100px;
    height: 100px;
  }
  
  .score-number {
    font-size: 32px;
  }
  
  .circular-chart {
    width: 100px;
    height: 100px;
  }
}
</style>