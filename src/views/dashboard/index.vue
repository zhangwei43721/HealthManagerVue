<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">健康数据概览</h1>
    
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-s-data"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">身高</div>
              <div class="stat-value">{{ this.bodyInfo.height || '-' }}<span class="unit">m</span></div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-s-marketing"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">体重</div>
              <div class="stat-value">{{ this.bodyInfo.weight || '-' }}<span class="unit">kg</span></div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-s-custom"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">BMI</div>
              <div class="stat-value">{{ this.bmi || '-' }}</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">年龄</div>
              <div class="stat-value">{{ this.bodyInfo.age || '-' }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="charts-container">
      <div class="chart-wrapper">
        <div class="chart-box" ref="myChart"></div>
      </div>

      <div class="chart-wrapper">
        <div id="chart-container" class="chart-box"></div>
      </div>

      <div class="chart-wrapper">
        <div id="chart-containerLine" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>



<script>
import * as echarts from "echarts";

import userApi from "@/api/userManage";
import FunctionApi from "@/api/Function_Menu";
export default {
  data() {
    return {
      charts: "",
      bodyInfo: "",
      bmi: null,
      score: null,
      BodyNotesInfo: "",

      vision: [],
      waterConsumption: [],
      bloodSugar: [],
      bloodPressure: [],
      date: [],
      heartRate: [],
    };
  },
  methods: {
    async getBodyInfo() {
      try {
        // 使用解构赋值从 userApi.getBodyInfo() 返回的 Promise 对象中提取 data.bodyList 数组的第一个元素（即 bodyInfo 对象）
        const {
          data: {
            bodyList: [bodyInfo],
          },
        } = await userApi.getBodyInfo();
        this.bodyInfo = bodyInfo;
      } catch (error) {
        console.log("获取身体信息错误");
        
        this.$router.push('/login');
      }
    },


    async getBodyNotes() {
      try {
  
        const response = await FunctionApi.getBodyNotes(this.bodyInfo.id);

        // 从返回结果中获取 BodyNotesInfo，并赋值给组件的 BodyNotesInfo 属性
        this.BodyNotesInfo = response.data;

        // 遍历 BodyNotesInfo 数组中的每一个元素，将其各个属性值分别添加到对应的数组中,note包含每一条数据的对象
        this.BodyNotesInfo.forEach((note) => {
          this.vision.push(note.vision);
          this.waterConsumption.push(note.waterConsumption);
          this.bloodSugar.push(note.bloodSugar);
          this.bloodPressure.push(note.bloodPressure);
          this.heartRate.push(note.heartRate);
          const formattedDate = new Date(note.date).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          this.date.push(formattedDate);
        });
      } catch (error) {
        console.log("获取身体信息错误");
      }
    },

    bmiM() {
      // 从bodyInfo中获取身高和体重的值，并转换为 Number 类型
      const weight = Number(this.bodyInfo.weight);
      // 计算BMI值
      const bmiValue = weight / (this.bodyInfo.height * this.bodyInfo.height);
      // 返回计算结果并保留两位小数
      this.bmi = bmiValue.toFixed(2);
      return bmiValue.toFixed(2);
    },

    BarChart() {
      const chartDom = document.getElementById("chart-container");
      const myChart = echarts.init(chartDom);

      const option = {
        color: ["#3398DB"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        title: {
          text: "视力变化趋势图",
          textStyle: {
            fontWeight: "normal",
            fontSize: 25,
            color: "#666",
          },
          left: "center",
          top: 20,
          padding: [10, 10, 0, 10],
        },
        xAxis: [
          {
            type: "category",
            data: this.date,
            axisTick: {
              alignWithLabel: true,
            },
            axisLabel: {
              interval: 1, //设置X轴文字显示间隔
              rotate: 45, //设置X轴文字旋转角度
              textStyle: {
                fontSize: 12, //设置X轴文字样式
              },
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            axisLabel: {
              textStyle: {
                fontSize: 12, //设置Y轴文字样式
              },
            },
          },
        ],
        series: [
          {
            name: "视力",
            type: "bar",
            barWidth: "60%",
            data: this.vision,
            itemStyle: {
              // 阴影的大小
              shadowBlur: 5,
              // 阴影水平方向上的偏移
              shadowOffsetX: 2,
              // 阴影垂直方向上的偏移
              shadowOffsetY: 2,
              // 阴影颜色
              shadowColor: "rgba(0, 0, 0, 0.5)",
              // 柱状图圆角，初始化效果
              barBorderRadius: 5,
            },
          },
        ],
      };

      myChart.setOption(option);
    },
    area() {
      const chartDom = document.getElementById("chart-containerLine");
      const myChart = echarts.init(chartDom);

      const option = {
        title: {
          text: "血压血糖变化趋势图",
          textStyle: {
            fontWeight: "normal",
            fontSize: 25,
            color: "#666",
          },
          left: "center",
          top: 20,
          padding: [10, 10, 0, 10],
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["血压", "血糖"],
        },
        xAxis: {
          type: "category",
          data: this.date,
          axisLabel: {
            interval: 1, //设置X轴文字显示间隔
            textStyle: {
              fontSize: 12, //设置X轴文字样式
            },
          },
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "血压",
            data: this.bloodPressure,
            type: "line",
          },
          {
            name: "血糖",
            data: this.bloodSugar,
            type: "line",
          },
        ],
      };

      myChart.setOption(option);
    },
  },

  watch: {
    bodyInfo: {
      deep: true, //监听对象内部属性的变化
      async handler() {
        this.bmiM(); // 计算BMI值
        await this.getBodyNotes(); // 获取身体数据信息
        this.BarChart();
        this.area();
        const chartDom = this.$refs.myChart;
        const myChart = echarts.init(chartDom);

        const option = {
          title: {
            text: "心率变化趋势图",
            textStyle: {
              fontWeight: "normal",
              fontSize: 25,
              color: "#666",
            },
            left: "center",
            top: 20,
          },
          xAxis: {
            type: "category",
            data: this.date,
            axisLabel: {
              fontSize: 12,
              interval: 2,
            },
            axisTick: {
              show: false,
            },
          },
          yAxis: {
            type: "value",
            axisLine: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                type: "dashed",
                color: "#ddd",
              },
            },
            axisTick: {
              show: false,
            },
          },
          tooltip: {
            trigger: "axis",
            formatter: function (params) {
              return params[0].name + "：" + params[0].value;
            },
          },
          series: [
            {
              data: this.heartRate,
              type: "line",
              smooth: true,
              lineStyle: {
                width: 3,
                color: "#00bfff",
              },
              symbol: "circle",
              symbolSize: 8,
              itemStyle: {
                color: "#00bfff",
                borderColor: "#fff",
                borderWidth: 2,
              },
              markLine: {
                data: [
                  {
                    type: "average",
                    name: "平均值",
                  },
                ],
                label: {
                  position: "insideEndBottom",
                  formatter: "{b}：{c}",
                },
                lineStyle: {
                  type: "dashed",
                  color: "green",
                  width: 2,
                },
                symbol: "none",
              },
              animation: true,
              animationDuration: 3000,
              animationEasing: "cubicInOut",
            },
          ],
        };

        myChart.setOption(option);
      },
    },
  },

  created() {
    this.getBodyInfo();
  },

  async mounted() {},
};
</script>
<style scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.stats-cards {
  margin-bottom: 36px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  height: 140px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon i {
  font-size: 48px;
  color: #409EFF;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 18px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.unit {
  font-size: 16px;
  font-weight: normal;
  margin-left: 4px;
  color: #909399;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.chart-wrapper {
  flex: 1 1 calc(33.333% - 20px);
  min-width: 300px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-box {
  width: 100%;
  height: 400px;
  padding: 16px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .chart-wrapper {
    flex: 1 1 calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .chart-wrapper {
    flex: 1 1 100%;
  }
  
  .stat-card {
    height: auto;
    padding: 16px;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
  }
  
  .stat-icon i {
    font-size: 36px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>