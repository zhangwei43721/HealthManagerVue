<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">健康数据中心</h1>
    
    <!-- 顶部区域 -->
    <div class="top-section">
      <!-- 健康指数水球图 -->
      <div class="health-index-container">
        <div id="health-index-water" class="health-index-water"></div>
        <div class="health-index-label">健康指数</div>
        
        <!-- 添加身体数据和生命体征图表在健康指数下方 -->
        <div class="sub-metrics-container">
          <!-- 身高体重BMI可视化 -->
          <div id="height-weight-gauge" class="sub-metrics-chart"></div>
          <!-- 心率血压进度条 -->
          <div id="vitals-chart" class="sub-metrics-chart"></div>
            </div>
            </div>
      
      <!-- 身体数据可视化区域 - 主布局中保留，便于响应式布局 -->
      <div class="body-metrics-container">
        <!-- 身高体重BMI可视化 - 添加外层容器 -->
        <div class="data-container">
          <div id="height-weight-gauge-main" class="metrics-chart"></div>
            </div>
        <!-- 心率血压进度条 - 添加外层容器 -->
        <div class="data-container">
          <div id="vitals-chart-main" class="metrics-chart"></div>
            </div>
          </div>
    </div>

    <!-- 下方图表区域 -->
    <div class="charts-container">
      <!-- 健康评分卡 -->
      <div class="chart-wrapper">
        <div id="health-score-chart" class="chart-box"></div>
      </div>
      <!-- 健康趋势图 -->
      <div class="chart-wrapper">
        <div id="trend-chart" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import 'echarts-liquidfill';
import userApi from "@/api/userManage";
import FunctionApi from "@/api/Function_Menu";
export default {
  data() {
    return {
      bodyInfo: "",
      bmi: null,
      BodyNotesInfo: "",
      vision: [],
      bloodSugar: [],
      bloodPressure: [],
      date: [],
      heartRate: [],
      bloodLipids: [4.5], // 添加血脂示例数据
      healthIndex: 0.8, // 默认健康指数
      themeColors: {
        primary: '#42b983',
        secondary: '#1e88e5',
        success: '#4caf50',
        warning: '#ff9800',
        danger: '#f44336',
        info: '#00bcd4'
      }
    };
  },
  methods: {
    async getBodyInfo() {
      try {
        const {
          data: {
            bodyList: [bodyInfo],
          },
        } = await userApi.getBodyInfo();
        this.bodyInfo = bodyInfo;
      } catch (error) {
        this.$router.push('/login');
      }
    },
    async getBodyNotes() {
      try {
        const response = await FunctionApi.getBodyNotes(this.bodyInfo.id);
        this.BodyNotesInfo = response.data;
        this.BodyNotesInfo.forEach((note) => {
          this.vision.push(note.vision);
          this.bloodSugar.push(note.bloodSugar);
          this.bloodPressure.push(note.bloodPressure);
          this.heartRate.push(note.heartRate);
          // 在实际环境中，将从接口获取血脂数据，这里使用模拟数据
          this.bloodLipids.push(note.bloodLipids || (Math.random() * 2 + 3.5).toFixed(1));
          const formattedDate = new Date(note.date).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          this.date.push(formattedDate);
        });
      } catch (error) {}
    },
    bmiM() {
      const weight = Number(this.bodyInfo.weight);
      const bmiValue = weight / (this.bodyInfo.height * this.bodyInfo.height);
      this.bmi = bmiValue.toFixed(2);
      return bmiValue.toFixed(2);
    },
    // 计算健康指数（融合 BMI、血压、血糖、心率、视力，算法可根据实际需求调整）
    calcHealthIndex() {
      let score = 100;
      // BMI 18.5~24.9 最优
      if (this.bmi < 18.5) score -= 10;
      else if (this.bmi > 24.9) score -= 10;
      // 血压（假设正常120）
      if (this.bloodPressure[0] && (this.bloodPressure[0] < 90 || this.bloodPressure[0] > 140)) score -= 10;
      // 血糖（假设正常4~7）
      if (this.bloodSugar[0] && (this.bloodSugar[0] < 4 || this.bloodSugar[0] > 7)) score -= 10;
      // 心率（假设正常60~100）
      if (this.heartRate[0] && (this.heartRate[0] < 60 || this.heartRate[0] > 100)) score -= 10;
      // 视力（假设正常1.0及以上）
      if (this.vision[0] && this.vision[0] < 1.0) score -= 10;
      this.healthIndex = Math.max(0, Math.min(1, score / 100));
    },
    // 初始化所有图表
    initCharts() {
      // 第一次加载时延迟渲染，确保DOM已完全渲染
      setTimeout(() => {
        this.renderHealthIndexWater();
        
        // 根据屏幕宽度决定渲染哪个布局的图表
        if (window.innerWidth <= 992) {
          // 小屏幕时渲染健康指数下方的图表
          this.renderHeightWeightGaugeSmall();
          this.renderVitalsChartSmall();
        } else {
          // 大屏幕时渲染主布局中的图表
          this.renderHeightWeightGauge();
          this.renderVitalsChart();
        }
        
        this.renderHealthScoreChart();
        this.renderTrendChart();
      }, 300);
    },
    // 健康指数水球图
    renderHealthIndexWater() {
      const chartDom = document.getElementById("health-index-water");
      if (!chartDom) {
        console.error('找不到health-index-water元素');
        return;
      }
      
      const myChart = echarts.init(chartDom);
      const option = {
        series: [{
          type: 'liquidFill',
          data: [this.healthIndex],
          radius: '85%',
          color: [this.themeColors.primary, this.themeColors.info],
          backgroundStyle: { color: '#f5f7fa' },
          outline: { borderDistance: 4, itemStyle: { borderColor: this.themeColors.primary, borderWidth: 3 } },
          label: { 
            fontSize: 28, 
            color: this.themeColors.secondary, 
            insideColor: '#fff', 
            formatter: (v) => `${Math.round(v.value*100)}%` 
          }
        }]
      };
      myChart.setOption(option);
      
      // 添加窗口大小变化监听，自动调整图表大小
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    },
    
    // 小屏幕健康指数下方的身高体重BMI图表
    renderHeightWeightGaugeSmall() {
      const chartDom = document.getElementById("height-weight-gauge");
      if (!chartDom) {
        console.error('找不到height-weight-gauge元素');
        return;
      }
      
      const myChart = echarts.init(chartDom);
      
      // 使用与主图表相同的配置，但可以根据需要调整尺寸和布局
      // 计算理想体重范围 (身高-105)±10%
      const idealWeight = (this.bodyInfo.height * 100 - 105);
      const weightLowerBound = idealWeight * 0.9;
      const weightUpperBound = idealWeight * 1.1;
      
      // 判断当前体重状态
      let weightStatus = '正常';
      let statusColor = this.themeColors.success;
      if (this.bodyInfo.weight < weightLowerBound) {
        weightStatus = '偏轻';
        statusColor = this.themeColors.warning;
      } else if (this.bodyInfo.weight > weightUpperBound) {
        weightStatus = '偏重';
        statusColor = this.themeColors.warning;
      }
      
      // 计算固定展示高度而不是比例转换
      const heightValue = 1.2; // 固定身高柱状图高度
      const weightValue = 0.8; // 固定体重柱状图高度
      const bmiValue = 0.5;   // 固定BMI柱状图高度

      const option = {
        title: {
          text: '身体数据',
          left: 'center',
          top: 0,
          textStyle: {
            color: '#2c3e50',
            fontSize: 16
          }
        },
        tooltip: {
          formatter: function(params) {
            if (params.dataIndex === 0) {
              return '身高: ' + this.bodyInfo.height + ' m';
            } else if (params.dataIndex === 1) {
              return '体重: ' + this.bodyInfo.weight + ' kg (' + weightStatus + ')';
            } else {
              return 'BMI: ' + this.bmi;
            }
          }.bind(this)
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',  // 减少底部空间
          top: '20%',     // 减少顶部空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['身高', '体重', 'BMI'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#5e6d82',
            fontSize: 12,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          show: false,
          max: 1.5
        },
        series: [
          {
            name: '数值',
            type: 'bar',
            barWidth: 40,
            z: 12,
            itemStyle: {
              color: function(params) {
                const colors = [this.themeColors.primary, statusColor, this.themeColors.secondary];
                return colors[params.dataIndex];
              }.bind(this),
              borderRadius: [5, 5, 0, 0]
            },
            data: [
              {
                value: heightValue,
                label: {
                  show: true,
                  position: 'top',
                  formatter: this.bodyInfo.height + ' m',
                  fontSize: 14,
                  color: '#5e6d82'
                }
              },
              {
                value: weightValue,
                label: {
                  show: true,
                  position: 'top',
                  formatter: this.bodyInfo.weight + ' kg\n' + weightStatus,
                  fontSize: 14,
                  color: '#5e6d82'
                }
              },
              {
                value: bmiValue,
                label: {
                  show: true,
                  position: 'top',
                  formatter: this.bmi + '\nBMI',
                  fontSize: 14,
                  color: '#5e6d82'
                }
              }
            ]
          }
        ]
      };
      
      myChart.setOption(option);
      
      // 添加窗口大小变化监听，自动调整图表大小
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    },
    
    // 小屏幕健康指数下方的生命体征图表
    renderVitalsChartSmall() {
      const chartDom = document.getElementById("vitals-chart");
      if (!chartDom) {
        console.error('找不到vitals-chart元素');
        return;
      }
      
      const myChart = echarts.init(chartDom);
      
      // 使用与主图表相同的配置，但可以根据需要调整尺寸和布局
      // 血压状态判断
      let bpStatus = '正常';
      let bpColor = this.themeColors.success;
      const bp = this.bloodPressure[0] || 120;
      if (bp < 90) {
        bpStatus = '偏低';
        bpColor = this.themeColors.info;
      } else if (bp > 140) {
        bpStatus = '偏高';
        bpColor = this.themeColors.danger;
      }
      
      // 心率状态判断
      let hrStatus = '正常';
      let hrColor = this.themeColors.success;
      const hr = this.heartRate[0] || 75;
      if (hr < 60) {
        hrStatus = '偏低';
        hrColor = this.themeColors.info;
      } else if (hr > 100) {
        hrStatus = '偏高';
        hrColor = this.themeColors.danger;
      }
      
      // 血糖状态判断
      let bsStatus = '正常';
      let bsColor = this.themeColors.success;
      const bs = this.bloodSugar[0] || 5.0;
      if (bs < 3.9) {
        bsStatus = '偏低';
        bsColor = this.themeColors.info;
      } else if (bs > 6.1) {
        bsStatus = '偏高';
        bsColor = this.themeColors.danger;
      }
      
      // 血脂状态判断
      let blStatus = '正常';
      let blColor = this.themeColors.success;
      const bl = this.bloodLipids[0] || 4.5;
      if (bl < 3.0) {
        blStatus = '偏低';
        blColor = this.themeColors.info;
      } else if (bl > 5.2) {
        blStatus = '偏高';
        blColor = this.themeColors.danger;
      }
      
      // 计算百分比
      const bpMax = 200; // 最大血压值
      const hrMax = 200; // 最大心率值
      const bsMax = 15;  // 最大血糖值
      const blMax = 8;   // 最大血脂值
      const bpPercent = Math.min(100, (bp / bpMax) * 100);
      const hrPercent = Math.min(100, (hr / hrMax) * 100);
      const bsPercent = Math.min(100, (bs / bsMax) * 100);
      const blPercent = Math.min(100, (bl / blMax) * 100);
      
      const option = {
        title: {
          text: '生命体征',
          left: 'center',
          top: 0,
              textStyle: {
            color: '#2c3e50',
            fontSize: 16
          }
        },
        grid: {
          top: 40,
          bottom: 10,
          left: 90,
          right: 100,
          containLabel: false
        },
        xAxis: {
          min: 0,
          max: 100,
          show: false,
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: ['心率', '血压', '血糖', '血脂'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#5e6d82',
            fontSize: 14,
            margin: 16
          }
        },
        series: [
          {
            type: 'bar',
            name: '进度',
            data: [
              {
                value: hrPercent,
                itemStyle: { color: hrColor }
              },
              {
                value: bpPercent,
                itemStyle: { color: bpColor }
              },
              {
                value: bsPercent,
                itemStyle: { color: bsColor }
              },
              {
                value: blPercent,
                itemStyle: { color: blColor }
              }
            ],
            barWidth: 15,
            label: {
              show: true,
              position: 'right',
              formatter: function(params) {
                if (params.dataIndex === 0) {
                  return hr + ' bpm (' + hrStatus + ')';
                } else if (params.dataIndex === 1) {
                  return bp + ' mmHg (' + bpStatus + ')';
                } else if (params.dataIndex === 2) {
                  return bs + ' mmol/L (' + bsStatus + ')';
                } else {
                  return bl + ' mmol/L (' + blStatus + ')';
                }
              },
              fontSize: 14,
              color: '#5e6d82'
            },
            itemStyle: {
              borderRadius: 10
            },
            z: 10
          },
          {
            type: 'bar',
            barWidth: 15,
            data: [100, 100, 100, 100],
            itemStyle: {
              color: 'rgba(0,0,0,0.05)',
              borderRadius: 10
            },
            z: 5
          }
        ]
      };

      myChart.setOption(option);
      
      // 添加窗口大小变化监听，自动调整图表大小
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    },
    
    // 主布局中的身高体重BMI图表（大屏幕）
    renderHeightWeightGauge() {
      const chartDom = document.getElementById("height-weight-gauge-main");
      if (!chartDom) {
        console.error('找不到height-weight-gauge-main元素');
        return;
      }
      
      const myChart = echarts.init(chartDom);
      
      // 计算理想体重范围 (身高-105)±10%
      const idealWeight = (this.bodyInfo.height * 100 - 105);
      const weightLowerBound = idealWeight * 0.9;
      const weightUpperBound = idealWeight * 1.1;
      
      // 判断当前体重状态
      let weightStatus = '正常';
      let statusColor = this.themeColors.success;
      if (this.bodyInfo.weight < weightLowerBound) {
        weightStatus = '偏轻';
        statusColor = this.themeColors.warning;
      } else if (this.bodyInfo.weight > weightUpperBound) {
        weightStatus = '偏重';
        statusColor = this.themeColors.warning;
      }
      
      // 计算固定展示高度而不是比例转换
      const heightValue = 1.2; // 固定身高柱状图高度
      const weightValue = 0.8; // 固定体重柱状图高度
      const bmiValue = 0.5;   // 固定BMI柱状图高度

      const option = {
        title: {
          text: '身体数据',
          left: 'center',
          top: 0,
          textStyle: {
            color: '#2c3e50',
            fontSize: 16
          }
        },
        tooltip: {
          formatter: function(params) {
            if (params.dataIndex === 0) {
              return '身高: ' + this.bodyInfo.height + ' m';
            } else if (params.dataIndex === 1) {
              return '体重: ' + this.bodyInfo.weight + ' kg (' + weightStatus + ')';
            } else {
              return 'BMI: ' + this.bmi;
            }
          }.bind(this)
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',  // 减少底部空间
          top: '20%',     // 减少顶部空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['身高', '体重', 'BMI'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#5e6d82',
            fontSize: 12,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          show: false,
          max: 1.5
        },
        series: [
          {
            name: '数值',
            type: 'bar',
            barWidth: 40,
            z: 12,
            itemStyle: {
              color: function(params) {
                const colors = [this.themeColors.primary, statusColor, this.themeColors.secondary];
                return colors[params.dataIndex];
              }.bind(this),
              borderRadius: [5, 5, 0, 0]
            },
            data: [
              {
                value: heightValue,
                label: {
                  show: true,
                  position: 'top',
                  formatter: this.bodyInfo.height + ' m',
                  fontSize: 14,
                  color: '#5e6d82'
                }
              },
              {
                value: weightValue,
                label: {
                  show: true,
                  position: 'top',
                  formatter: this.bodyInfo.weight + ' kg\n' + weightStatus,
                  fontSize: 14,
                  color: '#5e6d82'
                }
              },
              {
                value: bmiValue,
                label: {
                  show: true,
                  position: 'top',
                  formatter: this.bmi + '\nBMI',
                  fontSize: 14,
                  color: '#5e6d82'
                }
              }
            ]
          }
        ]
      };
      
      myChart.setOption(option);
      
      // 添加窗口大小变化监听，自动调整图表大小
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    },
    
    // 主布局中的生命体征图表（大屏幕）
    renderVitalsChart() {
      const chartDom = document.getElementById("vitals-chart-main");
      if (!chartDom) {
        console.error('找不到vitals-chart-main元素');
        return;
      }
      
      const myChart = echarts.init(chartDom);
      
      // 血压状态判断
      let bpStatus = '正常';
      let bpColor = this.themeColors.success;
      const bp = this.bloodPressure[0] || 120;
      if (bp < 90) {
        bpStatus = '偏低';
        bpColor = this.themeColors.info;
      } else if (bp > 140) {
        bpStatus = '偏高';
        bpColor = this.themeColors.danger;
      }
      
      // 心率状态判断
      let hrStatus = '正常';
      let hrColor = this.themeColors.success;
      const hr = this.heartRate[0] || 75;
      if (hr < 60) {
        hrStatus = '偏低';
        hrColor = this.themeColors.info;
      } else if (hr > 100) {
        hrStatus = '偏高';
        hrColor = this.themeColors.danger;
      }
      
      // 血糖状态判断
      let bsStatus = '正常';
      let bsColor = this.themeColors.success;
      const bs = this.bloodSugar[0] || 5.0;
      if (bs < 3.9) {
        bsStatus = '偏低';
        bsColor = this.themeColors.info;
      } else if (bs > 6.1) {
        bsStatus = '偏高';
        bsColor = this.themeColors.danger;
      }
      
      // 血脂状态判断
      let blStatus = '正常';
      let blColor = this.themeColors.success;
      const bl = this.bloodLipids[0] || 4.5;
      if (bl < 3.0) {
        blStatus = '偏低';
        blColor = this.themeColors.info;
      } else if (bl > 5.2) {
        blStatus = '偏高';
        blColor = this.themeColors.danger;
      }
      
      // 计算百分比
      const bpMax = 200; // 最大血压值
      const hrMax = 200; // 最大心率值
      const bsMax = 15;  // 最大血糖值
      const blMax = 8;   // 最大血脂值
      const bpPercent = Math.min(100, (bp / bpMax) * 100);
      const hrPercent = Math.min(100, (hr / hrMax) * 100);
      const bsPercent = Math.min(100, (bs / bsMax) * 100);
      const blPercent = Math.min(100, (bl / blMax) * 100);
      
      const option = {
        title: {
          text: '生命体征',
          left: 'center',
          top: 0,
            textStyle: {
            color: '#2c3e50',
            fontSize: 16
          }
        },
        grid: {
          top: 40,
          bottom: 10,
          left: 90,
          right: 100,
          containLabel: false
        },
        xAxis: {
          min: 0,
          max: 100,
          show: false,
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: ['心率', '血压', '血糖', '血脂'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#5e6d82',
            fontSize: 14,
            margin: 16
          }
        },
        series: [
          {
            type: 'bar',
            name: '进度',
            data: [
              {
                value: hrPercent,
                itemStyle: { color: hrColor }
              },
              {
                value: bpPercent,
                itemStyle: { color: bpColor }
              },
              {
                value: bsPercent,
                itemStyle: { color: bsColor }
              },
              {
                value: blPercent,
                itemStyle: { color: blColor }
              }
            ],
            barWidth: 15,
            label: {
              show: true,
              position: 'right',
              formatter: function(params) {
                if (params.dataIndex === 0) {
                  return hr + ' bpm (' + hrStatus + ')';
                } else if (params.dataIndex === 1) {
                  return bp + ' mmHg (' + bpStatus + ')';
                } else if (params.dataIndex === 2) {
                  return bs + ' mmol/L (' + bsStatus + ')';
                } else {
                  return bl + ' mmol/L (' + blStatus + ')';
                }
              },
              fontSize: 14,
              color: '#5e6d82'
            },
            itemStyle: {
              borderRadius: 10
            },
            z: 10
          },
          {
            type: 'bar',
            barWidth: 15,
            data: [100, 100, 100, 100],
            itemStyle: {
              color: 'rgba(0,0,0,0.05)',
              borderRadius: 10
            },
            z: 5
          }
        ]
      };

      myChart.setOption(option);
      
      // 添加窗口大小变化监听，自动调整图表大小
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    },
    
    // 健康评分卡（替代雷达图）
    renderHealthScoreChart() {
      const chartDom = document.getElementById("health-score-chart");
      if (!chartDom) {
        console.error('找不到health-score-chart元素');
        return;
      }
      
        const myChart = echarts.init(chartDom);
      
      // 计算各项健康评分
      const bmiScore = this.calculateMetricScore('bmi', this.bmi);
      const bpScore = this.calculateMetricScore('bloodPressure', this.bloodPressure[0]);
      const hrScore = this.calculateMetricScore('heartRate', this.heartRate[0]);
      const sugarScore = this.calculateMetricScore('bloodSugar', this.bloodSugar[0]);
      const visionScore = this.calculateMetricScore('vision', this.vision[0]);

        const option = {
          title: {
          text: '健康评估分数',
          left: 'center',
            textStyle: {
            fontSize: 16,
            color: '#2c3e50'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}分'
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
          },
          xAxis: {
          type: 'category',
          data: ['BMI', '血压', '心率', '血糖', '视力'],
            axisLabel: {
            interval: 0,
            color: '#5e6d82'
          },
          axisLine: {
            lineStyle: {
              color: '#eee'
            }
            },
            axisTick: {
            show: false
          }
          },
          yAxis: {
          type: 'value',
          name: '评分',
          min: 0,
          max: 100,
          interval: 20,
          axisLabel: {
            color: '#5e6d82'
          },
            axisLine: {
            show: false
            },
            splitLine: {
              lineStyle: {
              color: '#eee'
            }
          }
        },
        series: [
          {
            name: '评分',
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
              color: function(params) {
                const score = params.value;
                if (score >= 80) return this.themeColors.success;
                if (score >= 60) return this.themeColors.primary;
                if (score >= 40) return this.themeColors.warning;
                return this.themeColors.danger;
              }.bind(this),
              borderRadius: [5, 5, 0, 0]
            },
            data: [bmiScore, bpScore, hrScore, sugarScore, visionScore]
          },
          {
            name: '健康评分',
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 0
            },
            itemStyle: {
              opacity: 0
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(66, 185, 131, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(66, 185, 131, 0.1)'
                }
              ])
            },
            data: [bmiScore, bpScore, hrScore, sugarScore, visionScore]
          }
        ]
      };
      
      myChart.setOption(option);
      
      // 添加窗口大小变化监听，自动调整图表大小
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    },
    
    // 计算各指标评分
    calculateMetricScore(metric, value) {
      if (!value) return 75; // 默认评分
      
      let score = 0;
      switch(metric) {
        case 'bmi':
          // BMI: 18.5-24.9为最佳
          if (value >= 18.5 && value <= 24.9) score = 100;
          else if (value >= 17 && value < 18.5) score = 80;
          else if (value > 24.9 && value <= 27) score = 80;
          else if (value >= 15 && value < 17) score = 60;
          else if (value > 27 && value <= 30) score = 60;
          else score = 40;
          break;
        case 'bloodPressure':
          // 血压: 90-140为正常
          if (value >= 90 && value <= 140) score = 100;
          else if (value >= 80 && value < 90) score = 80;
          else if (value > 140 && value <= 160) score = 70;
          else if (value < 80) score = 60;
          else if (value > 160) score = 40;
          break;
        case 'heartRate':
          // 心率: 60-100为正常
          if (value >= 60 && value <= 100) score = 100;
          else if (value >= 50 && value < 60) score = 80;
          else if (value > 100 && value <= 120) score = 70;
          else if (value < 50) score = 60;
          else if (value > 120) score = 40;
          break;
        case 'bloodSugar':
          // 血糖: 3.9-6.1为正常
          if (value >= 3.9 && value <= 6.1) score = 100;
          else if (value >= 3.5 && value < 3.9) score = 80;
          else if (value > 6.1 && value <= 7) score = 70;
          else if (value < 3.5) score = 50;
          else if (value > 7) score = 40;
          break;
        case 'vision':
          // 视力: 1.0及以上为正常
          if (value >= 1.0) score = 100;
          else if (value >= 0.8 && value < 1.0) score = 90;
          else if (value >= 0.6 && value < 0.8) score = 80;
          else if (value >= 0.4 && value < 0.6) score = 70;
          else score = 60;
          break;
        default:
          score = 75;
      }
      
      return score;
    },
    
    // 健康趋势融合折线图
    renderTrendChart() {
      const chartDom = document.getElementById("trend-chart");
      if (!chartDom) {
        console.error('找不到trend-chart元素');
        return;
      }
      
      const myChart = echarts.init(chartDom);
      const option = {
        backgroundColor: '#fff',
        title: { 
          text: '健康趋势融合图', 
          left: 'center', 
          textStyle: { 
            color: this.themeColors.secondary, 
            fontSize: 16,
            fontWeight: 'normal' 
          } 
          },
          tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: { 
          data: ['血压', '血糖', '心率', '血脂'], 
          top: 30, 
          textStyle: { color: '#2c3e50' } 
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
          top: 60
        },
        xAxis: { 
          type: 'category', 
          data: this.date, 
          axisLabel: { 
            color: '#5e6d82',
            rotate: 30,
            fontSize: 10
          },
          axisTick: { alignWithLabel: true }
        },
        yAxis: { 
          type: 'value', 
          axisLabel: { color: '#5e6d82' },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#eee'
            }
          }
          },
          series: [
            {
            name: '血压', 
            data: this.bloodPressure, 
            type: 'line', 
              smooth: true,
            lineStyle: { width: 3, color: this.themeColors.primary }, 
            areaStyle: { 
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `rgba(66, 185, 131, 0.3)` },
                { offset: 1, color: `rgba(66, 185, 131, 0.05)` }
              ])
            }, 
            symbol: 'emptyCircle', 
            symbolSize: 6 
          },
          { 
            name: '血糖', 
            data: this.bloodSugar, 
            type: 'line', 
            smooth: true, 
            lineStyle: { width: 3, color: this.themeColors.info }, 
            areaStyle: { 
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `rgba(0, 188, 212, 0.3)` },
                { offset: 1, color: `rgba(0, 188, 212, 0.05)` }
              ])
            }, 
            symbol: 'emptyCircle', 
            symbolSize: 6 
          },
          { 
            name: '心率', 
            data: this.heartRate, 
            type: 'line', 
            smooth: true, 
            lineStyle: { width: 3, color: this.themeColors.warning }, 
            areaStyle: { 
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `rgba(255, 152, 0, 0.3)` },
                { offset: 1, color: `rgba(255, 152, 0, 0.05)` }
              ])
            }, 
            symbol: 'emptyCircle', 
            symbolSize: 6 
          },
          { 
            name: '血脂', 
            data: this.bloodLipids, 
            type: 'line', 
            smooth: true, 
            lineStyle: { width: 3, color: this.themeColors.secondary }, 
            areaStyle: { 
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `rgba(30, 136, 229, 0.3)` },
                { offset: 1, color: `rgba(30, 136, 229, 0.05)` }
              ])
            }, 
            symbol: 'emptyCircle', 
            symbolSize: 6 
          }
        ]
      };
        myChart.setOption(option);
      
      // 添加窗口大小变化监听，自动调整图表大小
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    },
    
    // 监听窗口大小变化，重新渲染图表
    handleResize() {
      this.initCharts();
    }
  },
  watch: {
    bodyInfo: {
      deep: true,
      async handler() {
        this.bmiM();
        await this.getBodyNotes();
        this.calcHealthIndex();
        
        // 确保DOM已渲染后再初始化图表
        this.$nextTick(() => {
          this.initCharts();
        });
      },
    },
  },
  created() {
    this.getBodyInfo();
  },
  mounted() {
    // 组件挂载完成后，确保所有DOM元素已加载
    this.$nextTick(() => {
      this.initCharts();
      window.addEventListener('resize', this.handleResize);
    });
  },
  // 组件销毁前清除所有的resize事件监听
  beforeDestroy() {
    // 在组件销毁前移除所有resize事件监听器
    window.removeEventListener('resize', this.handleResize);
    
    // 销毁所有echarts实例，防止内存泄漏
    const chartIds = [
      "health-index-water", 
      "height-weight-gauge", 
      "vitals-chart", 
      "height-weight-gauge-main", 
      "vitals-chart-main", 
      "health-score-chart", 
      "trend-chart"
    ];
    chartIds.forEach(id => {
      const dom = document.getElementById(id);
      if (dom) {
        const chart = echarts.getInstanceByDom(dom);
        if (chart) {
          chart.dispose();
        }
      }
    });
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  min-height: 100vh;
  background-color: #f5f7fa;
}
.dashboard-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
  letter-spacing: 1px;
}
/* 顶部区域 - 健康指数和身体数据 */
.top-section {
  display: flex;
  margin-bottom: 30px; /* 增加与下方图表的间距 */
  gap: 24px;
  max-height: none; /* 移除高度限制，让内容自然流动 */
}
.health-index-container {
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s, box-shadow 0.3s;
  height: auto; /* 自适应高度 */
}
.health-index-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.health-index-water {
  width: 180px;
  height: 180px;
}
.health-index-label {
  font-size: 18px;
  color: #5e6d82;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 15px;
}
/* 新增健康指数下方的图表容器 */
.sub-metrics-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
  display: none; /* 默认在大屏上隐藏 */
}
.sub-metrics-chart {
  width: 100%;
  height: 180px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s, box-shadow 0.3s;
}
.sub-metrics-chart:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
/* 身体数据可视化区域 */
.body-metrics-container {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 16px;
  min-height: 240px;
  height: 300px;
}

/* 身体数据和生命体征的容器样式 */
.data-container {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.data-container:nth-child(1) {
  flex: 2; /* 身体数据容器宽度 */
}

.data-container:nth-child(2) {
  flex: 3; /* 生命体征容器宽度 */
}

.data-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.metrics-chart {
  flex: 1;
  width: 100%;
  height: 100%;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 10px; /* 增加上方间距 */
}
.chart-wrapper {
  flex: 1 1 calc(50% - 20px);
  min-width: 300px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.chart-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.chart-box {
  width: 100%;
  height: 360px;
  padding: 16px;
  box-sizing: border-box; /* 确保padding不影响尺寸计算 */
}
/* 响应式调整 */
@media (max-width: 1200px) {
  .chart-wrapper {
    flex: 1 1 100%;
  }
}
@media (max-width: 992px) {
  .body-metrics-container {
    min-height: 400px;
  }
  .sub-metrics-container {
    display: flex;
  }
  .body-metrics-container {
    display: none;
  }
}
/* 平板尺寸特殊处理（针对820*1180） */
@media (min-width: 768px) and (max-width: 900px) {
  .top-section {
    max-height: none;
    margin-bottom: 40px;
  }
  .health-index-container {
    flex: 1;
    width: 100%;
  }
  .body-metrics-container {
    display: none; /* 隐藏主布局中的图表 */
  }
  .sub-metrics-container {
    display: flex; /* 显示健康指数下方的图表 */
  }
  .charts-container {
    padding-top: 20px; /* 增加上边距 */
  }
}
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    max-height: none;
    margin-bottom: 40px; /* 增加间距 */
  }
  .health-index-container {
    flex: 0 0 auto;
    width: 100%;
    min-height: auto; /* 让容器高度自适应内容 */
  }
  .body-metrics-container {
    display: none; /* 隐藏主布局中的图表 */
  }
  .sub-metrics-container {
    display: flex; /* 显示健康指数下方的图表 */
  }
  .chart-wrapper {
    flex: 1 1 100%;
    min-height: 340px; /* 降低最小高度 */
  }
  .chart-box {
    min-height: 280px; /* 降低最小高度 */
  }
  .charts-container {
    padding-top: 20px; /* 增加上边距 */
  }
}
</style>