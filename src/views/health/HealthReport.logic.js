import userApi from "@/api/userManage"; 

export default {
  name: "HealthReport", // 组件命名
  data() {
    return {
      bodyInfo: null, // 初始化为 null
      isLoading: false, // 加载状态
      error: null,     // 错误信息
    };
  },

  computed: {
    // 基础信息项数组
    basicInfoItems() {
        if (!this.bodyInfo) return [];
        // 格式化血压显示
        let bloodPressureDisplay = '-';
        if (this.bodyInfo.bloodPressure !== null) {
            bloodPressureDisplay = String(this.bodyInfo.bloodPressure); // 默认转字符串
        }

        return [
            { label: '体重', value: this.bodyInfo.weight, unit: 'kg' },
            { label: '身高', value: this.bodyInfo.height, unit: 'm' },
            { label: 'BMI', value: this.bmi !== null ? this.bmi.toFixed(2) : null, unit: '' }, // 在这里格式化 BMI
            { label: '血糖', value: this.bodyInfo.bloodSugar, unit: 'mmol/L' },
            { label: '血压', value: bloodPressureDisplay, unit: 'mmHg' }, // 使用格式化后的血压值
            { label: '胆固醇', value: this.bodyInfo.bloodLipid, unit: 'mmol/l' }, // 确认指标名称和单位
            { label: '心率', value: this.bodyInfo.heartRate, unit: '次/分钟' },
            { label: '视力', value: this.bodyInfo.vision, unit: '度' },
        ];
    },

    // BMI 计算
    bmi() {
      if (!this.bodyInfo || this.bodyInfo.weight === null || this.bodyInfo.height === null || isNaN(this.bodyInfo.weight) || isNaN(this.bodyInfo.height) || this.bodyInfo.height <= 0) {
        return null;
      }
      return this.bodyInfo.weight / (this.bodyInfo.height * this.bodyInfo.height);
    },

    // 肥胖分析进度条百分比
    bmiPercentage() {
        if (this.bmi === null) return 0;
        const percentage = Math.min(Math.max((this.bmi / 35) * 100, 0), 100); // 假设上限35
        return Math.round(percentage);
    },

    // 视力类型判断
    visionType() {
      if (this.bodyInfo === null || this.bodyInfo.vision === null || isNaN(this.bodyInfo.vision)) return "未知";
      const vision = this.bodyInfo.vision;
      if (vision >= 600) return "高度近视";
      if (vision >= 300) return "中度近视";
      if (vision > 0) return "轻度近视";
      if (vision === 0) return "无近视";
      return "数据异常"; // 处理负数或其他
    },

    // 视力建议
    visionSuggestion() {
      switch (this.visionType) {
        case "高度近视": return "积极治疗，建议定期就医检查眼底情况。";
        case "中度近视": return "注意保护眼睛，避免长时间用眼，定期检查视力。";
        case "轻度近视": return "加强眼部保健，注意用眼卫生，增加户外活动时间。";
        case "无近视": return "很好，请继续保持良好的用眼习惯。";
        case "数据异常": return "请检查视力数据是否准确录入。";
        default: return "请完善视力信息以获取建议。";
      }
    },

    // 体型判断
    bodyType() {
        if (this.bmi === null) return "未知";
        if (this.bmi >= 28) return "肥胖";
        if (this.bmi >= 24) return "超重";
        // 参考中国成人标准 BMI
        if (this.bmi >= 18.5) return "正常";
        if (this.bmi > 0) return "偏瘦"; // 确保 BMI 大于 0
        return "数据异常"; // BMI <= 0
    },

    // 肥胖分析 - 健康风险
    obesityHealthRisk() {
        switch (this.bodyType) {
            case "肥胖": return "您的体重过高，肥胖状态会显著增加健康风险，请尽快咨询医生并开始健康管理。";
            case "超重": return "您的体重已超重，请注意调整饮食和增加运动，预防进一步增重及相关疾病。";
            case "正常": return "您的体重在正常范围内，请继续保持健康的生活方式。";
            case "偏瘦": return "您的体重偏低，请注意均衡营养，保证足够能量摄入，如有需要可咨询医生。";
            case "数据异常": return "BMI 数据异常，无法评估健康风险。";
            default: return "请完善体重和身高信息以评估健康风险。";
        }
    },

    // 肥胖分析 - 疾病风险
    obesityDiseaseRisk() {
         switch (this.bodyType) {
            case "肥胖": return "显著增加患心血管疾病（如高血压、心脏病、中风）、2型糖尿病、高血脂、脂肪肝、睡眠呼吸暂停、某些癌症及关节炎等多种疾病的风险。";
            case "超重": return "增加患高血压、高血脂、糖尿病前期或2型糖尿病、心血管疾病、胆囊疾病等风险。";
            case "正常": return "相对风险较低，但仍需保持健康生活方式以预防慢性病。";
            case "偏瘦": return "体重过低可能与营养不良、免疫力下降、骨质疏松等问题有关。";
            case "数据异常": return "BMI 数据异常，无法评估疾病风险。";
            default: return "请完善体重和身高信息以评估疾病风险。";
        }
    },

    // 体型建议
    bodyTypeSuggestion() {
      switch (this.bodyType) {
        case "肥胖": return "强烈建议咨询医生或营养师，制定个性化的减重计划，包括饮食控制和规律运动。";
        case "超重": return "建议调整饮食结构，减少高热量、高脂肪食物摄入，增加蔬果和全谷物，并坚持规律运动。";
        case "正常": return "恭喜！请继续保持均衡饮食和适度运动的良好习惯。";
        case "偏瘦": return "建议增加营养摄入，特别是蛋白质和健康脂肪，并进行适度的力量训练。如有需要可咨询医生。";
        case "数据异常": return "请检查体重和身高数据。";
        default: return "请完善体重和身高信息以获取体型建议。";
      }
    },

    // 计算可能的疾病风险
    calculatedRisk() {
      if (!this.bodyInfo) return "";
      const risks = [];

      // 血压风险判断
      if (this.bodyInfo.bloodPressure !== null) {
          let systolicPressure = null;
          if (typeof this.bodyInfo.bloodPressure === 'string' && this.bodyInfo.bloodPressure.includes('/')) {
              const parts = this.bodyInfo.bloodPressure.split('/');
              const firstPart = Number(parts[0]);
              if (!isNaN(firstPart)) systolicPressure = firstPart;
          } else if (typeof this.bodyInfo.bloodPressure === 'number' && !isNaN(this.bodyInfo.bloodPressure)) {
              systolicPressure = this.bodyInfo.bloodPressure;
          }
          // 假设 140/90 mmHg 为高血压界限 (收缩压 >= 140 或 舒张压 >= 90)
          // 注意：如果只有一个数字，仅按收缩压判断可能不全面
          if (systolicPressure !== null && systolicPressure >= 140) {
             risks.push("高血压风险");
          } else if (typeof this.bodyInfo.bloodPressure === 'string' && this.bodyInfo.bloodPressure.includes('/')) {
              const parts = this.bodyInfo.bloodPressure.split('/');
              if (parts.length > 1) {
                 const diastolicPressure = Number(parts[1]);
                 if (!isNaN(diastolicPressure) && diastolicPressure >= 90) {
                     risks.push("高血压风险");
                 }
              }
          }
      }

      // 其他风险 (增加 null 和 isNaN 判断)
      if (this.bodyInfo.bloodLipid !== null && !isNaN(this.bodyInfo.bloodLipid) && this.bodyInfo.bloodLipid > 5.2) risks.push("高血脂风险"); // 参考值需确认
      if (this.bodyInfo.bloodSugar !== null && !isNaN(this.bodyInfo.bloodSugar) && this.bodyInfo.bloodSugar > 6.1) risks.push("糖尿病风险"); // 空腹血糖参考值
      if (this.bodyInfo.drinking === true) risks.push("过量饮酒风险");
      if (this.bodyInfo.exercise === false) risks.push("缺乏运动风险");
      if (this.bodyInfo.heartRate !== null && !isNaN(this.bodyInfo.heartRate) && this.bodyInfo.heartRate > 100) risks.push("静息心率过快");
      if (this.bodyInfo.sleepDuration !== null && !isNaN(this.bodyInfo.sleepDuration) && this.bodyInfo.sleepDuration < 7) risks.push("睡眠不足风险");
      if (this.bodyInfo.sleepQuality === "差") risks.push("睡眠质量差风险");
      if (this.bodyInfo.smoking === true) risks.push("吸烟相关疾病风险");
      if (this.visionType === '高度近视' || this.visionType === '中度近视') risks.push("近视相关眼病风险");
      if (this.bodyInfo.waterConsumption !== null && !isNaN(this.bodyInfo.waterConsumption) && this.bodyInfo.waterConsumption < 1500) risks.push("饮水不足风险");
      if (this.bodyType === '肥胖' || this.bodyType === '超重') risks.push("超重/肥胖相关疾病风险");

      return risks.length > 0 ? risks.join("，") : "无明显高风险项";
    },

    // 标准体重指数百分比 (逻辑待定)
    calculatedStandardHeightPercentage() {
        // !!! 业务逻辑需要明确 !!!
        // 暂时返回 0 或基于 BMI 的值，避免显示错误或误导性信息
        // if (this.bmi !== null) return this.bmiPercentage;
        return 0; // 返回 0 直到逻辑明确
    },

    // 基础代谢率百分比
    calculatedBMRPercentage() {
        if (!this.bodyInfo || this.bodyInfo.weight === null || this.bodyInfo.height === null || this.bodyInfo.age === null || !this.bodyInfo.sex || isNaN(this.bodyInfo.weight) || isNaN(this.bodyInfo.height) || isNaN(this.bodyInfo.age)) return 0;

        const weight = this.bodyInfo.weight;
        const heightCm = this.bodyInfo.height * 100;
        const age = this.bodyInfo.age;
        const sex = this.bodyInfo.sex;
        let bmr;

        if (weight <= 0 || heightCm <= 0 || age <= 0) return 0;

        // Harris-Benedict 公式 (修正版)
        if (sex.toLowerCase() === '男' || sex.toLowerCase() === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
        } else if (sex.toLowerCase() === '女' || sex.toLowerCase() === 'female') {
            bmr = 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
        } else {
            return 0; // 性别未知
        }

        if (bmr <= 0) return 0;

        const referenceBMR = 1500; // 参考值，可调整
        const percentage = Math.min(Math.max((bmr / referenceBMR) * 100, 0), 200);
        return Math.round(percentage);
    },

    // 生活习惯总结
    calculatedHabits() {
        if (!this.bodyInfo) return "";
        const habitsList = [];

        // 饮食偏好
        const foodMap = { "蔬菜": "偏好蔬菜", "水果": "偏好水果", "肉类": "偏好肉类", "鱼类": "偏好鱼类", "豆类": "偏好豆类", "谷物": "偏好谷物" };
        if (this.bodyInfo.foodTypes && typeof this.bodyInfo.foodTypes === 'string' && foodMap[this.bodyInfo.foodTypes]) {
            habitsList.push(foodMap[this.bodyInfo.foodTypes]);
        } else if (this.bodyInfo.foodTypes && typeof this.bodyInfo.foodTypes === 'string') {
             habitsList.push(`饮食包含: ${this.bodyInfo.foodTypes}`);
        }

        // 健康指标关联习惯 (增加检查)
        if (this.bodyInfo.bloodSugar !== null && !isNaN(this.bodyInfo.bloodSugar)) {
           habitsList.push(this.bodyInfo.bloodSugar > 7 ? "血糖偏高，可能与饮食/习惯有关" : "血糖水平尚可");
        }
        if (this.bodyInfo.heartRate !== null && !isNaN(this.bodyInfo.heartRate)) {
            habitsList.push(this.bodyInfo.heartRate > 100 ? "静息心率偏快，可能与压力/缺乏锻炼有关" : "静息心率尚可");
        }
        if (this.visionType === '高度近视' || this.visionType === '中度近视') habitsList.push("存在近视，提示注意用眼习惯");

        // 作息与睡眠 (增加检查)
        if (this.bodyInfo.sleepDuration !== null && !isNaN(this.bodyInfo.sleepDuration)) {
            habitsList.push(this.bodyInfo.sleepDuration < 7 ? "睡眠时长不足" : "睡眠时长充足");
        }
        if (this.bodyInfo.sleepQuality && typeof this.bodyInfo.sleepQuality === 'string' && this.bodyInfo.sleepQuality.trim() !== '') {
             habitsList.push(`睡眠质量自评：${this.bodyInfo.sleepQuality}`);
        }

        // 不良嗜好
        habitsList.push(this.bodyInfo.smoking === true ? "有吸烟习惯" : "无吸烟习惯");
        habitsList.push(this.bodyInfo.drinking === true ? "有饮酒习惯" : "无饮酒习惯");

        // 运动与饮水
        habitsList.push(this.bodyInfo.exercise === true ? "有运动习惯" : "缺乏运动");
        if (this.bodyInfo.waterConsumption !== null && !isNaN(this.bodyInfo.waterConsumption)) {
            habitsList.push(this.bodyInfo.waterConsumption < 1500 ? "日均饮水量可能不足" : "日均饮水量充足");
        }

        return habitsList.length > 0 ? habitsList.join("； ") : "暂无足够信息评估生活习惯";
    },

    // 健康评分
    calculatedScore() {
        if (!this.bodyInfo) return 0;
        let score = 100;

        // BMI 评分
        if (this.bmi !== null) {
            if (this.bodyType === '肥胖') score -= 25;
            else if (this.bodyType === '超重') score -= 15;
            else if (this.bodyType === '偏瘦') score -= 10;
            else if (this.bodyType === '数据异常') score -= 15;
            // 正常不扣分
        } else {
            score -= 10; // 缺少 BMI 数据
        }

        // 风险项评分
        const riskString = this.calculatedRisk || "";
        const riskCount = (riskString === "无明显高风险项" || riskString === "") ? 0 : (riskString.match(/，/g) || []).length + 1;
        if (riskCount > 5) score -= 25;
        else if (riskCount > 2) score -= 15;
        else if (riskCount > 0) score -= 5;

        // 视力评分
        if (this.visionType === '高度近视') score -= 15;
        else if (this.visionType === '中度近视') score -= 10;
        else if (this.visionType === '数据异常') score -= 5;
        // 轻度、无近视、未知(数据不足) 不扣分

        // BMR 评分
        const bmrPercentage = this.calculatedBMRPercentage;
        if (bmrPercentage > 0) {
             if (bmrPercentage < 80 || bmrPercentage > 120) score -= 10; // 偏离正常范围
        } else if (this.bodyInfo.weight && this.bodyInfo.height && this.bodyInfo.age && this.bodyInfo.sex) {
             // BMR需要的数据都有，但计算结果为0（可能数据异常或公式问题）
             score -= 5;
        }

         // 生活习惯评分 (简单示例)
         if (this.bodyInfo.smoking === true) score -= 10;
         if (this.bodyInfo.drinking === true) score -= 5;
         if (this.bodyInfo.exercise === false) score -= 10;
         if ((this.bodyInfo.sleepDuration !== null && this.bodyInfo.sleepDuration < 7) || this.bodyInfo.sleepQuality === '差') score -= 10;

        return Math.max(0, Math.min(score, 100)); // 最终得分 0-100
    },
  },

  methods: {
    async fetchBodyInfo() {
      this.isLoading = true;
      this.error = null;
      try {
        // 调用真实API获取身体信息
        const response = await userApi.getBodyInfo();
        
        // 检查API返回的数据格式
        if (response && response.data && response.data.bodyList && response.data.bodyList.length > 0) {
          const rawInfo = response.data.bodyList[0];
          this.bodyInfo = this.preprocessBodyInfo(rawInfo);
          console.log('获取到身体信息:', this.bodyInfo);
        } else {
          console.warn("未获取到有效的身体信息");
          this.error = "未获取到有效的身体信息，请确认是否已录入。";
          this.bodyInfo = null;
        }
      } catch (error) {
        console.error("获取身体信息失败:", error);
        this.error = `获取健康数据失败: ${error.message || '未知错误'}. 请稍后重试或联系管理员。`;
        
        // 处理认证失败的情况
        if (error.response && error.response.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
        }
        
        this.bodyInfo = null;
      } finally {
        this.isLoading = false;
      }
    },

    // 数据预处理
    preprocessBodyInfo(info) {
        const numericFields = ['weight', 'height', /*'bmi',*/ 'bloodSugar', 'bloodLipid', 'heartRate', 'vision', 'age', 'sleepDuration', 'waterConsumption'];
        const booleanFields = ['smoking', 'drinking', 'exercise'];
        const processedInfo = { ...info };

        numericFields.forEach(field => {
            if (processedInfo[field] !== undefined && processedInfo[field] !== null && processedInfo[field] !== '') {
                const num = Number(processedInfo[field]);
                // 保留 null 或有效数字
                processedInfo[field] = isNaN(num) ? null : num;
            } else {
                 processedInfo[field] = null; // 统一空值为 null
            }
        });

        // 血压特殊处理
        if (typeof info.bloodPressure === 'string') {
            processedInfo.bloodPressure = info.bloodPressure.trim();
            // 可选：进一步校验格式 '数字/数字'
            if (!/^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(processedInfo.bloodPressure) && !/^\d+(\.\d+)?$/.test(processedInfo.bloodPressure)) {
                 console.warn(`血压格式不规范: ${processedInfo.bloodPressure}`);
                 // 可以选择设为 null 或保留原样，这里保留
            }
        } else if (info.bloodPressure !== undefined && info.bloodPressure !== null) {
             const num = Number(info.bloodPressure);
             processedInfo.bloodPressure = isNaN(num) ? String(info.bloodPressure) : num; // 单值数字或转回字符串
        } else {
             processedInfo.bloodPressure = null;
        }

        booleanFields.forEach(field => {
             if (processedInfo[field] !== undefined && processedInfo[field] !== null) {
                 if (typeof processedInfo[field] === 'string') {
                     processedInfo[field] = processedInfo[field].trim().toLowerCase() === 'true';
                 } else {
                     processedInfo[field] = Boolean(processedInfo[field]);
                 }
             } else {
                  // 布尔值缺失，是设为 false 还是 null？根据业务决定，这里设为 null
                  processedInfo[field] = null;
             }
        });

        ['foodTypes', 'sex', 'sleepQuality'].forEach(field => {
            if (typeof processedInfo[field] === 'string') {
                processedInfo[field] = processedInfo[field].trim();
            } else if (processedInfo[field] === null || processedInfo[field] === undefined) {
                 processedInfo[field] = ''; // 字符串字段空值设为空字符串
            }
        });

        // 移除原始 BMI，强制前端计算
        delete processedInfo.bmi;

        return processedInfo;
    }
  },

  created() {
    this.fetchBodyInfo(); // 组件创建时获取数据
  },
};