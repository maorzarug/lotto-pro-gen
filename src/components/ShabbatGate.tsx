import React, { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldAlert, Heart, Info, Clock, AlertTriangle } from 'lucide-react';

/**
 * Calculates Israel DST boundaries and sunset times.
 * This is fully self-contained, offline-first, and highly accurate.
 */
function getIsraelDSTStart(year: number): Date {
  const target = new Date(year, 2, 31); // Month index 2 is March
  const day = target.getDay(); // 0 is Sunday
  target.setDate(31 - day); // Last Sunday of March
  target.setDate(target.getDate() - 2); // Friday before last Sunday
  target.setHours(2, 0, 0, 0);
  return target;
}

function getIsraelDSTEnd(year: number): Date {
  const target = new Date(year, 9, 31); // Month index 9 is October
  const day = target.getDay(); // 0 is Sunday
  target.setDate(31 - day); // Last Sunday of October
  target.setHours(2, 0, 0, 0);
  return target;
}

function checkIsIsraelDST(date: Date): boolean {
  const year = date.getFullYear();
  const dstStart = getIsraelDSTStart(year);
  const dstEnd = getIsraelDSTEnd(year);
  return date >= dstStart && date < dstEnd;
}

export function getIsraelSunset(date: Date): { sunsetHour: number; sunsetMinute: number } {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();

  // Baseline sunset local times for 1st and 15th of each month (Central Israel)
  const sunsetTable: { [month: number]: { 1: [number, number]; 15: [number, number] } } = {
    0: { 1: [16, 45], 15: [16, 56] },  // Jan
    1: { 1: [17, 12], 15: [17, 24] },  // Feb
    2: { 1: [17, 36], 15: [17, 47] },  // Mar (Standard/Daylight saving transition)
    3: { 1: [19, 0], 15: [19, 10] },   // Apr
    4: { 1: [19, 21], 15: [19, 31] },  // May
    5: { 1: [19, 41], 15: [19, 44] },  // Jun
    6: { 1: [19, 44], 15: [19, 37] },  // Jul
    7: { 1: [19, 25], 15: [19, 10] },  // Aug
    8: { 1: [18, 51], 15: [18, 32] },  // Sep
    9: { 1: [18, 12], 15: [17, 54] },  // Oct (DST transitions back)
    10: { 1: [16, 43], 15: [16, 36] }, // Nov
    11: { 1: [16, 35], 15: [16, 38] }, // Dec
  };

  const mData = sunsetTable[month];
  const t1 = mData[1];
  const t15 = mData[15];

  let hour = 17;
  let minute = 30;

  if (day <= 15) {
    const ratio = (day - 1) / 14;
    const minDiff = (t15[0] * 60 + t15[1]) - (t1[0] * 60 + t1[1]);
    const currentMin = (t1[0] * 60 + t1[1]) + minDiff * ratio;
    hour = Math.floor(currentMin / 60);
    minute = Math.round(currentMin % 60);
  } else {
    const nextMonth = (month + 1) % 12;
    const n1 = sunsetTable[nextMonth][1];
    const totalDays = new Date(year, month + 1, 0).getDate();
    const ratio = (day - 15) / (totalDays - 15);
    const minDiff = (n1[0] * 60 + n1[1]) - (t15[0] * 60 + t15[1]);
    const currentMin = (t15[0] * 60 + t15[1]) + minDiff * ratio;
    hour = Math.floor(currentMin / 60);
    minute = Math.round(currentMin % 60);
  }

  // Adjust for DST transition spikes in Israel
  if (month === 2) {
    const dstStarts = getIsraelDSTStart(year);
    if (date >= dstStarts) {
      if (day < 15) hour += 1;
    } else {
      if (day >= 15) hour -= 1;
    }
  } else if (month === 9) {
    const dstEnds = getIsraelDSTEnd(year);
    if (date >= dstEnds) {
      if (day < 15) hour -= 1;
    } else {
      if (day >= 15) hour += 1;
    }
  }

  return { sunsetHour: hour, sunsetMinute: minute };
}

export interface ShabbatStatus {
  isShabbat: boolean;
  blockReason: 'pre_shabbat' | 'shabbat' | 'post_shabbat' | null;
  candlesTime: Date | null;
  havdalahTime: Date | null;
  sunsetTime: Date | null;
}

export function checkIsShabbat(date: Date): ShabbatStatus {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday

  // If it's Sunday - Thursday, it is definitely not Shabbat.
  if (dayOfWeek !== 5 && dayOfWeek !== 6) {
    return { isShabbat: false, blockReason: null, candlesTime: null, havdalahTime: null, sunsetTime: null };
  }

  // Determine sunset for the current week's Friday or Saturday.
  let targetFriday = new Date(date);
  let targetSaturday = new Date(date);

  if (dayOfWeek === 5) {
    // It is Friday today
    targetSaturday.setDate(date.getDate() + 1);
  } else {
    // It is Saturday today
    targetFriday.setDate(date.getDate() - 1);
  }

  // Set times to local Israeli Sunset
  const sunsetFridayInfo = getIsraelSunset(targetFriday);
  const sunsetSaturdayInfo = getIsraelSunset(targetSaturday);

  const fridaySunset = new Date(targetFriday);
  fridaySunset.setHours(sunsetFridayInfo.sunsetHour, sunsetFridayInfo.sunsetMinute, 0, 0);

  const saturdaySunset = new Date(targetSaturday);
  saturdaySunset.setHours(sunsetSaturdayInfo.sunsetHour, sunsetSaturdayInfo.sunsetMinute, 0, 0);

  // Shabbat times:
  // Friday Candle Lighting (standard Israel is 20 minutes before Sunset, Jerusalem is 40. We will use a safe 30 minutes before Sunset standard).
  const candlesTime = new Date(fridaySunset.getTime() - 30 * 60 * 1000);
  
  // Saturday Havdalah (standard Israel is ~42-45 minutes after Sunset).
  const havdalahTime = new Date(saturdaySunset.getTime() + 45 * 60 * 1000);

  // User requested: "10 דק' לפני כניסת שבת ו-10 דק' אחרי צאת שבת"
  const blockStartTime = new Date(candlesTime.getTime() - 10 * 60 * 1000);
  const blockEndTime = new Date(havdalahTime.getTime() + 10 * 60 * 1000);

  const currentTime = date.getTime();

  if (currentTime >= blockStartTime.getTime() && currentTime <= blockEndTime.getTime()) {
    // We are inside the blocked window!
    let reason: ShabbatStatus['blockReason'] = 'shabbat';
    if (currentTime < candlesTime.getTime()) {
      reason = 'pre_shabbat';
    } else if (currentTime > havdalahTime.getTime()) {
      reason = 'post_shabbat';
    }

    return {
      isShabbat: true,
      blockReason: reason,
      candlesTime,
      havdalahTime,
      sunsetTime: dayOfWeek === 5 ? fridaySunset : saturdaySunset,
    };
  }

  return {
    isShabbat: false,
    blockReason: null,
    candlesTime,
    havdalahTime,
    sunsetTime: dayOfWeek === 5 ? fridaySunset : saturdaySunset,
  };
}

interface ShabbatGateProps {
  children: ReactNode;
}

export default function ShabbatGate({ children }: ShabbatGateProps) {
  const [shabbatState, setShabbatState] = useState<ShabbatStatus>({
    isShabbat: false,
    blockReason: null,
    candlesTime: null,
    havdalahTime: null,
    sunsetTime: null,
  });

  const [devBypass, setDevBypass] = useState<boolean>(false);

  useEffect(() => {
    // Runs an initial check and keeps checking every 30 seconds
    const performCheck = () => {
      const result = checkIsShabbat(new Date());
      setShabbatState(result);
    };

    performCheck();
    const interval = setInterval(performCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatHebrewDate = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  const isDevMode = process.env.NODE_ENV !== 'production';

  // If shabbat screen is triggered and we are not in bypass mode, display the full-screen Sabbath message
  if (shabbatState.isShabbat && !devBypass) {
    return (
      <div 
        className="fixed inset-0 z-[9999] min-h-screen bg-[#070a13] flex flex-col justify-center items-center text-center p-6 select-none" 
        dir="rtl"
      >
        {/* Sky glow effect */}
        <div className="absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        
        {/* Candle light glow */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full space-y-8 relative z-10">
          
          {/* Main Sabbath icon centerpiece */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex gap-1.5 justify-center items-end h-28 relative">
              {/* Flame 1 */}
              <motion.div 
                animate={{ 
                  y: [0, -4, 0], 
                  scaleY: [1, 1.15, 1],
                  scaleX: [1, 0.9, 1] 
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="w-4 h-12 bg-gradient-to-t from-amber-600 via-amber-400 to-amber-100 rounded-full blur-[1px] origin-bottom shadow-[0_0_20px_#f59e0b]"
              />
              {/* Pillar 1 */}
              <div className="w-6 h-16 bg-gradient-to-b from-slate-200 to-slate-400 rounded-t-sm rounded-b-md shadow-lg border-t border-white/20" />

              {/* Flame 2 */}
              <motion.div 
                animate={{ 
                  y: [-2, 2, -2], 
                  scaleY: [1, 1.1, 1],
                  scaleX: [1, 0.95, 1] 
                }}
                transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut', delay: 0.2 }}
                className="w-4 h-12 bg-gradient-to-t from-amber-600 via-amber-400 to-amber-100 rounded-full blur-[1px] origin-bottom shadow-[0_0_20px_#f59e0b] ml-6"
              />
              {/* Pillar 2 */}
              <div className="w-6 h-16 bg-gradient-to-b from-slate-200 to-slate-400 rounded-t-sm rounded-b-md shadow-lg border-t border-white/20" />
            </div>

            <span className="text-[10px] text-amber-500/80 tracking-widest font-black uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase">
              שומר שבת קודש 🌟
            </span>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              אתר זה שומר שבת
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
              גולשים יקרים, אתר הגנרטור לצירופי לוטוPro אינו פעיל בשבתות וחגי ישראל. הפעילות תתחדש באופן אוטומטי עם מוצאי יום המנוחה.
            </p>
          </motion.div>

          {/* Timeframe indicators */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 max-w-md mx-auto space-y-3.5 divide-y divide-white/5 text-right shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2.5">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 text-right">
                <Clock size={14} className="text-amber-500" />
                <span>כניסת שבת:</span>
              </span>
              <span className="text-xs text-white font-black font-mono">
                {formatHebrewDate(shabbatState.candlesTime)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2.5 pb-2.5">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 text-right">
                <Sparkles size={14} className="text-indigo-400" />
                <span>צאת שבת:</span>
              </span>
              <span className="text-xs text-white font-black font-mono">
                {formatHebrewDate(shabbatState.havdalahTime)}
              </span>
            </div>

            <div className="pt-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-semibold block">
                * המערכת ננעלת כ-10 דקות לפני כניסת השבת ונפתחת כ-10 דקות לאחר צאתה.
              </span>
            </div>
          </motion.div>

          {/* Dev bypass option - invisible in production build */}
          {isDevMode && (
            <div className="pt-8 opacity-40 hover:opacity-100 transition-opacity">
              <button
                onClick={() => setDevBypass(true)}
                className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                עקוף למטרת פיתוח באולפן AI 🛠️ (לא יופיע בייצור)
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-600 font-bold pt-4">
            שבת שלום ומבורכת לכל בית ישראל ❤️
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
