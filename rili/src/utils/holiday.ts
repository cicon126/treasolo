const solarHolidays: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-24': '平安夜',
  '12-25': '圣诞节'
};

const lunarHolidays: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '2-2': '龙抬头',
  '5-5': '端午节',
  '7-7': '七夕节',
  '7-15': '中元节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-23': '小年',
  '12-30': '除夕'
};

export function getSolarHoliday(month: number, day: number): string | undefined {
  return solarHolidays[`${month}-${day}`];
}

export function getLunarHoliday(month: number, day: number): string | undefined {
  return lunarHolidays[`${month}-${day}`];
}

export function getHoliday(
  solarMonth: number,
  solarDay: number,
  lunarMonth: number,
  lunarDay: number
): string | undefined {
  const lunarHoliday = getLunarHoliday(lunarMonth, lunarDay);
  const solarHoliday = getSolarHoliday(solarMonth, solarDay);
  
  if (lunarHoliday && solarHoliday) {
    return `${lunarHoliday} / ${solarHoliday}`;
  }
  return lunarHoliday || solarHoliday;
}
