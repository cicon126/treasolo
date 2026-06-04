import type { HealthRecord, HealthScore, HealthAdvice, MetricType, UserProfile } from '@/types/health';

export const calcBMI = (weight: number, height: number): number => {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};

export const getBMIStatus = (bmi: number): { level: string; label: string; color: string } => {
  if (bmi < 18.5) return { level: 'low', label: '偏瘦', color: '#3491FA' };
  if (bmi < 24) return { level: 'normal', label: '正常', color: '#2DB67D' };
  if (bmi < 28) return { level: 'high', label: '偏胖', color: '#FF7D00' };
  return { level: 'danger', label: '肥胖', color: '#F53F3F' };
};

export const getBPStatus = (systolic: number, diastolic: number): { level: string; label: string; color: string } => {
  if (systolic < 90 || diastolic < 60) return { level: 'low', label: '偏低', color: '#3491FA' };
  if (systolic <= 140 && diastolic <= 90) return { level: 'normal', label: '正常', color: '#2DB67D' };
  if (systolic <= 159 || diastolic <= 99) return { level: 'high', label: '偏高', color: '#FF7D00' };
  return { level: 'danger', label: '高血压', color: '#F53F3F' };
};

export const getBloodSugarStatus = (value: number): { level: string; label: string; color: string } => {
  if (value < 3.9) return { level: 'low', label: '偏低', color: '#3491FA' };
  if (value <= 6.1) return { level: 'normal', label: '正常', color: '#2DB67D' };
  if (value <= 7.0) return { level: 'high', label: '偏高', color: '#FF7D00' };
  return { level: 'danger', label: '异常', color: '#F53F3F' };
};

export const getHeartRateStatus = (value: number): { level: string; label: string; color: string } => {
  if (value < 60) return { level: 'low', label: '偏低', color: '#3491FA' };
  if (value <= 100) return { level: 'normal', label: '正常', color: '#2DB67D' };
  return { level: 'high', label: '偏高', color: '#FF7D00' };
};

export const calcHealthScore = (record: HealthRecord, profile: UserProfile): HealthScore => {
  let weightScore = 70;
  let bpScore = 70;
  let sugarScore = 70;
  let heartScore = 70;

  if (record.weight && profile.height) {
    const bmi = calcBMI(record.weight, profile.height);
    const status = getBMIStatus(bmi);
    weightScore = status.level === 'normal' ? 95 : status.level === 'low' ? 65 : status.level === 'high' ? 55 : 40;
  }

  if (record.systolic && record.diastolic) {
    const status = getBPStatus(record.systolic, record.diastolic);
    bpScore = status.level === 'normal' ? 95 : status.level === 'low' ? 60 : status.level === 'high' ? 50 : 30;
  }

  if (record.bloodSugar) {
    const status = getBloodSugarStatus(record.bloodSugar);
    sugarScore = status.level === 'normal' ? 95 : status.level === 'low' ? 55 : status.level === 'high' ? 50 : 30;
  }

  if (record.heartRate) {
    const status = getHeartRateStatus(record.heartRate);
    heartScore = status.level === 'normal' ? 95 : status.level === 'low' ? 60 : 50;
  }

  const total = Math.round((weightScore + bpScore + sugarScore + heartScore) / 4);

  return { total, weightScore, bpScore, sugarScore, heartScore };
};

export const generateAdvices = (record: HealthRecord, profile: UserProfile): HealthAdvice[] => {
  const advices: HealthAdvice[] = [];

  if (record.weight && profile.height) {
    const bmi = calcBMI(record.weight, profile.height);
    const status = getBMIStatus(bmi);
    if (status.level === 'normal') {
      advices.push({
        type: 'weight',
        level: 'normal',
        title: '体重正常',
        description: `您的BMI为${bmi}，处于健康范围内`,
        suggestions: ['继续保持均衡饮食', '每周保持3-5次运动', '定期监测体重变化']
      });
    } else if (status.level === 'low') {
      advices.push({
        type: 'weight',
        level: 'warning',
        title: '体重偏轻',
        description: `您的BMI为${bmi}，低于正常范围`,
        suggestions: ['增加蛋白质和碳水摄入', '少食多餐，保证营养', '进行适度力量训练增肌']
      });
    } else {
      advices.push({
        type: 'weight',
        level: status.level === 'high' ? 'warning' : 'danger',
        title: status.level === 'high' ? '体重偏重' : '肥胖警告',
        description: `您的BMI为${bmi}，${status.level === 'high' ? '超出正常范围' : '严重超标'}`,
        suggestions: ['控制每日热量摄入', '增加有氧运动时间', '减少高油高糖食物', '建议咨询营养师制定饮食计划']
      });
    }
  }

  if (record.systolic && record.diastolic) {
    const status = getBPStatus(record.systolic, record.diastolic);
    if (status.level === 'normal') {
      advices.push({
        type: 'bloodPressure',
        level: 'normal',
        title: '血压正常',
        description: `血压${record.systolic}/${record.diastolic}mmHg，处于健康范围`,
        suggestions: ['保持低盐饮食', '规律作息，避免熬夜', '适当运动，控制情绪']
      });
    } else if (status.level === 'low') {
      advices.push({
        type: 'bloodPressure',
        level: 'warning',
        title: '血压偏低',
        description: `血压${record.systolic}/${record.diastolic}mmHg，低于正常值`,
        suggestions: ['起床时动作放缓', '适量增加盐分摄入', '避免长时间站立', '多饮水补充血容量']
      });
    } else {
      advices.push({
        type: 'bloodPressure',
        level: status.level === 'high' ? 'warning' : 'danger',
        title: status.level === 'high' ? '血压偏高' : '高血压警告',
        description: `血压${record.systolic}/${record.diastolic}mmHg，${status.level === 'high' ? '超出正常范围' : '严重偏高'}`,
        suggestions: ['严格限制盐分摄入', '戒烟限酒', '保持心情平和', '遵医嘱服用降压药物', '每日定时监测血压']
      });
    }
  }

  if (record.bloodSugar) {
    const status = getBloodSugarStatus(record.bloodSugar);
    if (status.level === 'normal') {
      advices.push({
        type: 'bloodSugar',
        level: 'normal',
        title: '血糖正常',
        description: `空腹血糖${record.bloodSugar}mmol/L，处于健康范围`,
        suggestions: ['保持规律饮食', '选择低GI食物', '适量运动有助于血糖稳定']
      });
    } else if (status.level === 'low') {
      advices.push({
        type: 'bloodSugar',
        level: 'warning',
        title: '血糖偏低',
        description: `空腹血糖${record.bloodSugar}mmol/L，低于正常值`,
        suggestions: ['随身携带糖果或饼干', '避免空腹剧烈运动', '定时定量进餐', '出现头晕冷汗时及时补充糖分']
      });
    } else {
      advices.push({
        type: 'bloodSugar',
        level: status.level === 'high' ? 'warning' : 'danger',
        title: status.level === 'high' ? '血糖偏高' : '血糖异常',
        description: `空腹血糖${record.bloodSugar}mmol/L，${status.level === 'high' ? '超出正常范围' : '严重偏高'}`,
        suggestions: ['严格控制碳水摄入', '增加膳食纤维', '定期检测糖化血红蛋白', '建议就医检查', '避免含糖饮料和甜食']
      });
    }
  }

  if (record.heartRate) {
    const status = getHeartRateStatus(record.heartRate);
    if (status.level === 'normal') {
      advices.push({
        type: 'heartRate',
        level: 'normal',
        title: '心率正常',
        description: `心率${record.heartRate}次/分，处于健康范围`,
        suggestions: ['坚持有氧运动锻炼心肺', '保持良好作息', '避免过度摄入咖啡因']
      });
    } else if (status.level === 'low') {
      advices.push({
        type: 'heartRate',
        level: 'warning',
        title: '心率偏低',
        description: `心率${record.heartRate}次/分，低于正常值`,
        suggestions: ['如非运动员建议就医检查', '注意是否有头晕乏力症状', '避免突然剧烈运动']
      });
    } else {
      advices.push({
        type: 'heartRate',
        level: 'warning',
        title: '心率偏高',
        description: `心率${record.heartRate}次/分，高于正常值`,
        suggestions: ['减少咖啡因和酒精摄入', '练习深呼吸放松', '如持续偏高建议就医', '保持充足睡眠']
      });
    }
  }

  return advices;
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#2DB67D';
  if (score >= 70) return '#FF7D00';
  return '#F53F3F';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '一般';
  if (score >= 60) return '偏低';
  return '需关注';
};
