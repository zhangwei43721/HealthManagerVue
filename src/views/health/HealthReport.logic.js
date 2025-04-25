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
    // --- 基础数据和简单计算 ---

    // 解析后的血压对象，方便后续使用
    parsedBloodPressure() {
        if (!this.bodyInfo || typeof this.bodyInfo.bloodPressure !== 'string' || !this.bodyInfo.bloodPressure.includes('/')) {
            // 如果不是 '收缩压/舒张压' 格式的字符串，则认为是无效或不完整数据
            return null;
        }
        const parts = this.bodyInfo.bloodPressure.split('/');
        if (parts.length !== 2) return null; // 必须是两部分

        const systolic = Number(parts[0].trim());
        const diastolic = Number(parts[1].trim());

        if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
            // 确保两部分都是有效的正数
            return null;
        }
        return { systolic, diastolic };
    },

    // BMI 计算 (身高单位是厘米 cm)
    bmi() {
      // 确保 weight 和 height 都是有效的正数
      if (!this.bodyInfo || typeof this.bodyInfo.weight !== 'number' || this.bodyInfo.weight <= 0 || typeof this.bodyInfo.height !== 'number' || this.bodyInfo.height <= 0) {
        return null; // 返回 null 表示无法计算
      }
      // 将身高从厘米转换为米
      const heightInMeters = this.bodyInfo.height / 100;
      if (heightInMeters <= 0) {
          return null;
      }
      return this.bodyInfo.weight / (heightInMeters * heightInMeters);
    },

    // --- 分类与判断 ---

    // 体型判断
    bodyType() {
        if (this.bmi === null) return "未知";
        if (this.bmi >= 28) return "肥胖";
        if (this.bmi >= 24) return "超重";
        // 参考中国成人标准 BMI
        if (this.bmi >= 18.5) return "正常";
        if (this.bmi > 0) return "偏瘦"; // 确保 BMI 大于 0
        return "数据异常"; // BMI <= 0 (理论上 preprocess 后不会出现)
    },

     // 视力类型判断
    visionType() {
      // 确保 vision 是有效数字
      if (this.bodyInfo === null || typeof this.bodyInfo.vision !== 'number' || isNaN(this.bodyInfo.vision)) return "未知";
      const vision = this.bodyInfo.vision;
      // 注意：视力 0 通常代表正常或未测量，这里假设 0 是无近视。如果 0 代表未测量，逻辑需调整。
      // 同时，视力通常用对数视力表（如 5.0）或国际标准视力表（如 1.0），这里的 220 '度' 是指屈光度。
      if (vision >= 600) return "高度近视";
      if (vision >= 300) return "中度近视";
      if (vision > 0) return "轻度近视"; // 度数大于0即为近视
      if (vision === 0) return "无近视"; // 假设 0 度表示无近视
      return "数据异常"; // 处理负数或其他不太可能的值
    },

    // --- 格式化显示与建议 ---

    // 基础信息项数组 (用于界面展示)
    basicInfoItems() {
        if (!this.bodyInfo) return [];

        // 格式化血压显示
        let bloodPressureDisplay = '-';
        const bp = this.parsedBloodPressure;
        if (bp) {
            bloodPressureDisplay = `${bp.systolic}/${bp.diastolic}`;
        } else if (this.bodyInfo.bloodPressure !== null && this.bodyInfo.bloodPressure !== undefined) {
             // 如果有原始值但无法解析，可以显示原始值或提示格式错误
             bloodPressureDisplay = `格式错误 (${this.bodyInfo.bloodPressure})`;
        }

        // 格式化身高显示 (显示cm，但保留原始值用于计算)
        const heightDisplay = typeof this.bodyInfo.height === 'number' ? (this.bodyInfo.height * 100).toFixed(1) : '-'; // 假设原始是米

        return [
            { label: '体重', value: this.bodyInfo.weight !== null ? this.bodyInfo.weight.toFixed(1) : '-', unit: 'kg' },
            { label: '身高', value: heightDisplay, unit: 'cm' }, // 显示 cm
            { label: 'BMI', value: this.bmi !== null ? this.bmi.toFixed(2) : '-', unit: '' },
            { label: '血糖', value: this.bodyInfo.bloodSugar !== null ? this.bodyInfo.bloodSugar.toFixed(1) : '-', unit: 'mmol/L' },
            { label: '血压', value: bloodPressureDisplay, unit: 'mmHg' },
            { label: '血脂', value: this.bodyInfo.bloodLipid !== null ? this.bodyInfo.bloodLipid.toFixed(1) : '-', unit: 'mmol/l' }, // 确认指标名称 (后端是 bloodLipid)
            { label: '心率', value: this.bodyInfo.heartRate !== null ? Math.round(this.bodyInfo.heartRate) : '-', unit: '次/分钟' },
            { label: '近视度数', value: this.bodyInfo.vision !== null ? Math.round(this.bodyInfo.vision) : '-', unit: '度' }, // 标签改为近视度数更清晰
        ];
    },

    // 肥胖分析进度条百分比
    bmiPercentage() {
        if (this.bmi === null) return 0;
        // 保持原逻辑，上限 35 比较随意，可根据需要调整
        const percentage = Math.min(Math.max((this.bmi / 35) * 100, 0), 100);
        return Math.round(percentage);
    },

    // 视力建议
    visionSuggestion() {
      switch (this.visionType) {
        case "高度近视": return "积极治疗，建议定期就医检查眼底情况。";
        case "中度近视": return "注意保护眼睛，避免长时间用眼，定期检查视力。";
        case "轻度近视": return "加强眼部保健，注意用眼卫生，增加户外活动时间。";
        case "无近视": return "很好，请继续保持良好的用眼习惯。";
        case "数据异常": return "请检查视力数据是否准确录入。";
        default: return "视力信息不足，无法提供建议。"; // "未知" 时的提示
      }
    },

    // 肥胖分析 - 健康风险
    obesityHealthRisk() {
        switch (this.bodyType) {
            case "肥胖": return "您的体重过高，肥胖状态会显著增加健康风险，请尽快咨询医生并开始健康管理。";
            case "超重": return "您的体重已超重，请注意调整饮食和增加运动，预防进一步增重及相关疾病。";
            case "正常": return "您的体重在正常范围内，请继续保持健康的生活方式。";
            case "偏瘦": return "您的体重偏低，请注意均衡营养，保证足够能量摄入，如有需要可咨询医生。";
            case "数据异常": return "BMI 数据异常，无法评估健康风险。";
            default: return "请完善体重和身高信息以评估健康风险。"; // "未知"
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
             default: return "请完善体重和身高信息以评估疾病风险。"; // "未知"
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
        default: return "请完善体重和身高信息以获取体型建议。"; // "未知"
      }
    },

    // --- 复杂计算与总结 ---

    // 计算可能的疾病风险
    calculatedRisk() {
      if (!this.bodyInfo) return "数据加载中或加载失败";
      const risks = [];

      // 血压风险判断 (使用解析后的血压)
      const bp = this.parsedBloodPressure;
      if (bp) {
          // 参考中国高血压指南：收缩压 >= 140 mmHg 或 舒张压 >= 90 mmHg
          if (bp.systolic >= 140 || bp.diastolic >= 90) {
             risks.push("高血压风险");
          }
          // 可选：增加低血压风险判断 (e.g., < 90/60)
          // if (bp.systolic < 90 || bp.diastolic < 60) {
          //    risks.push("低血压风险");
          // }
      } else if (this.bodyInfo.bloodPressure !== null && this.bodyInfo.bloodPressure !== undefined) {
          // 如果有血压数据但格式不对，可以加个提示
          risks.push("血压数据格式需修正");
      }

      // 其他风险 (确保是数字类型再比较)
      // !! 注意：这些阈值需要根据具体的医学指南或业务需求确认 !!
      const info = this.bodyInfo;
      if (typeof info.bloodLipid === 'number' && info.bloodLipid > 5.2) risks.push("高血脂风险"); // 总胆固醇？低密度脂蛋白？需明确指标和阈值
      if (typeof info.bloodSugar === 'number' && info.bloodSugar > 6.1 && info.bloodSugar < 7.0) risks.push("空腹血糖受损风险"); // 空腹血糖参考值 (IFG)
      if (typeof info.bloodSugar === 'number' && info.bloodSugar >= 7.0) risks.push("糖尿病风险"); // 空腹血糖参考值 (糖尿病)
      if (typeof info.heartRate === 'number' && info.heartRate > 100) risks.push("静息心率过快");
      if (typeof info.heartRate === 'number' && info.heartRate < 60) risks.push("静息心率过缓"); // 可选

      // 视力风险
      if (this.visionType === '高度近视' || this.visionType === '中度近视') risks.push("近视相关眼病风险");

      // 体型风险
      if (this.bodyType === '肥胖' || this.bodyType === '超重') risks.push("超重/肥胖相关疾病风险");
      if (this.bodyType === '偏瘦') risks.push("体重过轻相关风险");

      // 生活习惯直接风险
      if (info.smoking === true) risks.push("吸烟相关疾病风险");
      if (info.drinking === true) risks.push("过量饮酒风险"); // "有饮酒习惯"不直接等于风险，但这里简化处理
      if (info.exercise === false) risks.push("缺乏运动风险");
      if (typeof info.sleepDuration === 'number' && info.sleepDuration < 7) risks.push("睡眠不足风险"); // 假设7小时是界限
      if (info.sleepQuality === "差") risks.push("睡眠质量差风险"); // 假设"差"是风险项
      if (typeof info.waterConsumption === 'number' && info.waterConsumption < 1500) risks.push("饮水不足风险"); // 假设1500ml是界限

      return risks.length > 0 ? risks.join("，") : "暂未发现明显风险项";
    },

    // 基础代谢率 (BMR) 计算 - 返回绝对值 (kcal/day)
    calculatedBMR() {
        const info = this.bodyInfo;
        if (!info || typeof info.weight !== 'number' || info.weight <= 0
                  || typeof info.height !== 'number' || info.height <= 0
                  || typeof info.age !== 'number' || info.age <= 0
                  || typeof info.gender !== 'string' || !info.gender) {
            return null; // 必要信息不全
        }

        const weight = info.weight;
        const heightCm = info.height * 100; // !! 确保 height 是米，转换为厘米 !!
        const age = info.age;
        const gender = info.gender.toLowerCase(); // 转小写以便比较
        let bmr;

        // Harris-Benedict 公式 (修正版)
        if (gender === '男' || gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
        } else if (gender === '女' || gender === 'female') {
            bmr = 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
        } else {
            return null; // 性别不识别
        }

        return bmr > 0 ? Math.round(bmr) : null; // 返回正数 BMR 或 null
    },

    // 生活习惯总结
    calculatedHabits() {
        if (!this.bodyInfo) return "数据加载中或加载失败";
        const habitsList = [];
        const info = this.bodyInfo;

        // 饮食偏好 - 处理可能的多种食物类型（如果以逗号分隔）
        if (info.foodTypes && typeof info.foodTypes === 'string') {
             habitsList.push(`饮食偏好/包含: ${info.foodTypes.trim()}`);
        } else {
             habitsList.push("饮食偏好未记录");
        }

        // 作息与睡眠
        if (typeof info.sleepDuration === 'number') {
            habitsList.push(`平均睡眠时长: ${info.sleepDuration.toFixed(1)} 小时` + (info.sleepDuration < 7 ? " (可能不足)" : ""));
        } else {
            habitsList.push("睡眠时长未记录");
        }
        if (info.sleepQuality && typeof info.sleepQuality === 'string' && info.sleepQuality.trim() !== '') {
             habitsList.push(`睡眠质量自评: ${info.sleepQuality.trim()}` + (info.sleepQuality === "差" ? " (有待改善)" : ""));
        } else {
             habitsList.push("睡眠质量未记录");
        }

        // 运动习惯
         if (info.exercise === true) {
             habitsList.push("有运动习惯");
         } else if (info.exercise === false) {
             habitsList.push("缺乏运动");
         } else {
             habitsList.push("运动习惯未记录"); // 处理 null 的情况
         }

        // 饮水习惯
        if (typeof info.waterConsumption === 'number') {
            habitsList.push(`日均饮水: ${Math.round(info.waterConsumption)} ml` + (info.waterConsumption < 1500 ? " (可能不足)" : ""));
        } else {
            habitsList.push("饮水量未记录");
        }

        // 不良嗜好
        if (info.smoking === true) {
             habitsList.push("有吸烟习惯");
         } else if (info.smoking === false) {
             // 无吸烟习惯通常不特别列出，除非需要强调
             // habitsList.push("无吸烟习惯");
         } else {
             habitsList.push("吸烟情况未记录");
         }

        if (info.drinking === true) {
             habitsList.push("有饮酒习惯");
         } else if (info.drinking === false) {
             // habitsList.push("无饮酒习惯");
         } else {
             habitsList.push("饮酒情况未记录");
         }


        // 可以选择性加入与习惯强相关的指标提示
        // if (typeof info.bloodSugar === 'number' && info.bloodSugar >= 7.0) habitsList.push("血糖偏高提示注意饮食");
        // if (typeof info.heartRate === 'number' && info.heartRate > 100) habitsList.push("静息心率偏快提示关注压力/运动");

        return habitsList.length > 0 ? habitsList.join("； ") : "暂无足够信息评估生活习惯";
    },

    // 健康评分 (这是一个非常主观的示例，需要仔细调整权重)
    calculatedScore() {
        if (!this.bodyInfo) return 0; // 没有数据无法评分
        let score = 100;
        const info = this.bodyInfo;

        // 1. BMI 评分
        if (this.bmi !== null) {
            switch (this.bodyType) {
                case '肥胖': score -= 20; break;
                case '超重': score -= 10; break;
                case '偏瘦': score -= 10; break;
                case '数据异常': score -= 10; break; // BMI计算异常
                // '正常' 不扣分
            }
        } else {
            score -= 10; // 缺少关键的 BMI 数据
        }

        // 2. 血压评分
        const bp = this.parsedBloodPressure;
        if (bp) {
            if (bp.systolic >= 140 || bp.diastolic >= 90) score -= 15; // 高血压
            else if (bp.systolic >= 130 || bp.diastolic >= 85) score -= 5; // 正常高值/1级前期 (示例)
            // 可选：低血压扣分
        } else if (info.bloodPressure !== null && info.bloodPressure !== undefined) {
            score -= 5; // 血压数据格式有问题
        } else {
            score -= 10; // 缺少血压数据
        }

        // 3. 其他指标风险评分 (简化：每有一个明确风险项扣分)
        // 使用 calculatedRisk 的结果来判断，更简单
        const riskString = this.calculatedRisk || "";
        if (riskString !== "暂未发现明显风险项" && riskString !== "数据加载中或加载失败") {
            const riskCount = (riskString.match(/风险/g) || []).length; // 简单统计"风险"字样次数
            score -= Math.min(riskCount * 3, 15); // 每个风险扣3分，最多扣15分 (示例)
        }
        if (riskString.includes("血压数据格式需修正")) score -= 2; // 格式问题轻微扣分

        // 4. 视力评分
        switch (this.visionType) {
            case '高度近视': score -= 10; break;
            case '中度近视': score -= 5; break;
            case '数据异常': score -= 2; break;
             // 轻度、无近视、未知 不扣分
        }

        // 5. 生活习惯评分
        if (info.smoking === true) score -= 10;
        if (info.drinking === true) score -= 5; // 饮酒扣分可以根据频率/量调整
        if (info.exercise === false) score -= 8;
        if ((typeof info.sleepDuration === 'number' && info.sleepDuration < 7) || info.sleepQuality === '差') score -= 7;
        if (typeof info.waterConsumption === 'number' && info.waterConsumption < 1500) score -= 3;

        // 确保分数在 0-100 之间
        return Math.max(0, Math.min(Math.round(score), 100));
    },

    // 这个字段不再需要，如果需要展示 BMR，直接用 calculatedBMR
    // calculatedBMRPercentage() { ... }

    // 这个字段逻辑不明，保持原样或移除
    calculatedStandardHeightPercentage() {
        return 0;
    },
  },

  methods: {
    async fetchBodyInfo() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await userApi.getBodyInfo(); // 假设 API 调用方式不变

        if (response && response.data && response.data.bodyList && response.data.bodyList.length > 0) {
          const rawInfo = response.data.bodyList[0];
          this.bodyInfo = this.preprocessBodyInfo(rawInfo);
          console.log('处理后的身体信息:', this.bodyInfo);
        } else {
          console.warn("API未返回有效的身体信息");
          this.error = "未获取到有效的身体信息，请确认是否已录入。";
          this.bodyInfo = null; // 清空旧数据
        }
      } catch (error) {
        console.error("获取身体信息失败:", error);
        this.error = `获取健康数据失败: ${error.message || '未知错误'}. 请稍后重试或联系管理员。`;
        if (error.response && error.response.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          // this.$router.push('/login'); // 取消注释以启用跳转
        }
        this.bodyInfo = null; // 出错时清空数据
      } finally {
        this.isLoading = false;
      }
    },

    // 数据预处理 - 更加健壮和一致
    preprocessBodyInfo(info) {
        const processedInfo = { ...info }; // 创建副本

        // 数值字段处理: 尝试转为数字，无效则设为 null
        const numericFields = ['weight', 'height', 'bloodSugar', 'bloodLipid', 'heartRate', 'vision', 'age', 'sleepDuration', 'waterConsumption'];
        numericFields.forEach(field => {
            const value = processedInfo[field];
            if (value !== undefined && value !== null && value !== '') {
                const num = Number(value);
                processedInfo[field] = isNaN(num) ? null : num; // 无效数字转为 null
            } else {
                 processedInfo[field] = null; // 空或不存在也设为 null
            }
        });

        // 血压特殊处理: 保留原始字符串，让 computed 属性去解析和验证
        if (processedInfo.bloodPressure !== undefined && processedInfo.bloodPressure !== null) {
            processedInfo.bloodPressure = String(processedInfo.bloodPressure).trim();
            if (processedInfo.bloodPressure === '') {
                processedInfo.bloodPressure = null;
            }
            // 不再在这里做复杂格式校验，交给 parsedBloodPressure 计算属性
        } else {
            processedInfo.bloodPressure = null;
        }

        // 布尔值字段处理: 明确处理 true/false/"true"/"false"，其他视为 null
        const booleanFields = ['smoking', 'drinking', 'exercise'];
        booleanFields.forEach(field => {
             const value = processedInfo[field];
             if (value === true || String(value).toLowerCase() === 'true') {
                 processedInfo[field] = true;
             } else if (value === false || String(value).toLowerCase() === 'false') {
                 processedInfo[field] = false;
             } else {
                  processedInfo[field] = null; // 未提供或无法识别的布尔值设为 null
             }
        });

        // 字符串字段处理: trim，空字符串或 null/undefined 统一为 null
        const stringFields = ['name', 'gender', 'sleepQuality', 'foodTypes']; // 'name' 和 'gender' 也处理下
        stringFields.forEach(field => {
            const value = processedInfo[field];
            if (typeof value === 'string') {
                const trimmedValue = value.trim();
                processedInfo[field] = trimmedValue === '' ? null : trimmedValue; // 空字符串转为 null
            } else if (value === undefined || value === null) {
                 processedInfo[field] = null;
            } else {
                 // 如果不是字符串、null、undefined (例如数字被用在字符串字段)，转为字符串或 null
                 const strVal = String(value).trim();
                 processedInfo[field] = strVal === '' ? null : strVal;
            }
        });

        // 移除后端可能存在的 BMI，强制前端重新计算
        delete processedInfo.bmi;
        // 确保 id 存在且为数字或字符串
        processedInfo.id = processedInfo.id !== undefined && processedInfo.id !== null ? processedInfo.id : null;

        return processedInfo;
    }
  },

  created() {
    this.fetchBodyInfo(); // 组件创建时获取数据
  },
};