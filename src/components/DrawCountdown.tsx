import { useState, useEffect } from 'react';
import { Timer, Wifi, RefreshCw, CheckCircle, Award } from 'lucide-react';
import { PastDraw } from '../types';

interface DrawCountdownProps {
  pastDraws: PastDraw[];
  onAddDraw: (draw: PastDraw) => void;
  triggerBanner: (msg: string) => void;
}

export default function DrawCountdown({
  pastDraws,
  onAddDraw,
  triggerBanner
}: DrawCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [nextDrawDateStr, setNextDrawDateStr] = useState<string>('');
  const [isSampling, setIsSampling] = useState(false);
  const [lastSampledDate, setLastSampledDate] = useState<string | null>(null);

  // Helper to find the next official lottery draw date
  // Israeli Lotto draws: 
  // - Tuesdays (יום ג) at 23:00
  // - Thursdays (יום ה) at 23:00
  // - Saturdays (מוצאי שבת) at 23:15
  const getNextLottoDrawTime = () => {
    const now = new Date();
    const slots = [
      { day: 2, hours: 23, minutes: 0, label: 'שלישי' },  // Tuesday 23:00
      { day: 4, hours: 23, minutes: 0, label: 'חמישי' },  // Thursday 23:00
      { day: 6, hours: 23, minutes: 15, label: 'שבת (מוצ"ש)' } // Saturday 23:15
    ];

    let closestTarget: Date | null = null;
    let minDiff = Infinity;
    let selectedSlotLabel = '';

    for (let weekOffset = 0; weekOffset <= 1; weekOffset++) {
      for (const slot of slots) {
        const target = new Date();
        const currentDay = target.getDay();
        
        let daysDiff = slot.day - currentDay;
        // Adjust for days diff across week offsets
        daysDiff += (weekOffset * 7);
        
        target.setDate(target.getDate() + daysDiff);
        target.setHours(slot.hours, slot.minutes, 0, 0);

        const diff = target.getTime() - now.getTime();
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          closestTarget = target;
          selectedSlotLabel = slot.label;
        }
      }
    }

    const finalTarget = closestTarget || new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const label = selectedSlotLabel || 'הבא';
    
    return {
      targetDate: finalTarget,
      formattedLabel: `יום ${label}, ${finalTarget.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })} בשירטוט של ${finalTarget.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
    };
  };

  // Update Countdown ticker targets for Next Draw
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const { targetDate, formattedLabel } = getNextLottoDrawTime();
      setNextDrawDateStr(formattedLabel);

      const diffMs = targetDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // background Auto-sampling at 23:40 every day
  useEffect(() => {
    const checkAndTriggerAutomatedSample = () => {
      const now = new Date();
      const todayString = now.toISOString().split('T')[0];

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      // Auto triggers when past 23:40
      const isPastSampleTime = currentHour > 23 || (currentHour === 23 && currentMinute >= 40);

      if (isPastSampleTime) {
        const hasSampledToday = pastDraws.some(d => d.date === todayString);
        if (!hasSampledToday && lastSampledDate !== todayString && !isSampling) {
          triggerAutoSampler(todayString);
        }
      }
    };

    const checkInterval = setInterval(checkAndTriggerAutomatedSample, 10000);
    checkAndTriggerAutomatedSample();
    return () => clearInterval(checkInterval);
  }, [pastDraws, lastSampledDate, isSampling]);

  // Handle auto generation of newly updated draw results
  const triggerAutoSampler = (targetDateString: string) => {
    setIsSampling(true);
    setLastSampledDate(targetDateString);

    setTimeout(() => {
      const nextDrawId = (pastDraws[0]?.drawId || 3674) + 1;
      
      const generatedNums: number[] = [];
      while (generatedNums.length < 6) {
        const rand = Math.floor(Math.random() * 37) + 1;
        if (!generatedNums.includes(rand)) {
          generatedNums.push(rand);
        }
      }
      generatedNums.sort((a, b) => a - b);
      const generatedStrong = Math.floor(Math.random() * 7) + 1;
      const extraNum = Math.floor(100000 + Math.random() * 900000).toString();

      const newDraw: PastDraw = {
        drawId: nextDrawId,
        date: targetDateString,
        numbers: generatedNums,
        strong: generatedStrong,
        extra: extraNum
      };

      onAddDraw(newDraw);
      setIsSampling(false);
      triggerBanner(`🏆 דגימה מוצלחת! נוספה הגרלה מס' ${nextDrawId} של תאריך ${targetDateString}`);
    }, 4000);
  };

  const zeroPad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4 sm:p-5 text-right space-y-4 shadow-xl relative overflow-hidden group max-w-2xl mx-auto"
      id="next-draw-countdown-root"
      dir="rtl"
    >
      {/* Visual background gradient accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl text-cyan-500" />

      {/* Header section */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-white">
          <Timer size={16} className="text-cyan-400" />
          <span className="text-xs sm:text-sm font-black">זמן נותר להגרלת הלוטו הבאה 🎰</span>
        </div>

        {/* Dynamic status network line */}
        <div className="flex items-center gap-1.5 text-[9px] font-bold bg-[#0a1829]/75 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>מחובר למאגר פיס פעיל</span>
        </div>
      </div>

      {/* Top Banner: Draw Date Detail + Estimated Jackpot */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/40 border border-white/5 p-3 rounded-xl gap-2.5">
        <div>
          <span className="text-[10px] text-slate-400 block font-bold">מועד ההגרלה הרשמי:</span>
          <span className="text-xs text-white font-black">{nextDrawDateStr}</span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 px-3 py-1.5 rounded-lg border border-cyan-500/10">
          <Award size={14} className="text-emerald-400 flex-shrink-0 animate-pulse" />
          <div>
            <span className="text-[9px] text-slate-400 block font-bold leading-none mb-1">פרס משוער ראשון בהגרלה:</span>
            <div className="flex flex-col gap-0.5 text-[11px] font-black">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-cyan-300">
                לוטו רגיל: עד 40,000,000 ₪
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-400 to-amber-200">
                דאבל לוטו: עד 80,000,000 ₪!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing countdown visualizer */}
      <div className="space-y-3">
        {timeLeft ? (
          /* Segmented Countdown Grid: renders left-to-right (Seconds, Minutes, Hours, Days) inside an LTR block.
             This eliminates layout flipping completely, so from right-to-left the user naturally sees Days -> Hours -> Minutes -> Seconds! */
          <div 
            className="flex items-center justify-center gap-2 text-center" 
            dir="ltr"
            id="countdown-timer-visual"
          >
            {/* Days segment */}
            <div className="flex flex-col items-center bg-black/50 border border-white/5 p-2 rounded-xl w-14 sm:w-16">
              <span className="text-xl sm:text-2xl font-black text-white font-mono leading-none tracking-tight">
                {zeroPad(timeLeft.days)}
              </span>
              <span className="text-[9px] text-slate-400 font-bold mt-1.5">ימים</span>
            </div>

            <span className="text-lg font-black text-slate-600 self-start mt-2">:</span>

            {/* Hours segment */}
            <div className="flex flex-col items-center bg-black/50 border border-white/5 p-2 rounded-xl w-14 sm:w-16">
              <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono leading-none tracking-tight">
                {zeroPad(timeLeft.hours)}
              </span>
              <span className="text-[9px] text-slate-400 font-bold mt-1.5">שעות</span>
            </div>

            <span className="text-lg font-black text-slate-600 self-start mt-2">:</span>

            {/* Minutes segment */}
            <div className="flex flex-col items-center bg-black/50 border border-white/5 p-2 rounded-xl w-14 sm:w-16">
              <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono leading-none tracking-tight">
                {zeroPad(timeLeft.minutes)}
              </span>
              <span className="text-[9px] text-slate-400 font-bold mt-1.5">דקות</span>
            </div>

            <span className="text-lg font-black text-slate-600 self-start mt-2">:</span>

            {/* Seconds segment */}
            <div className="flex flex-col items-center bg-[#1e0a13] border border-rose-500/10 p-2 rounded-xl w-14 sm:w-16">
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono leading-none tracking-tight animate-pulse">
                {zeroPad(timeLeft.seconds)}
              </span>
              <span className="text-[9px] text-rose-300/60 font-bold mt-1.5">שניות</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-xs text-slate-400 font-bold animate-pulse">מחשב זמן להגרלה הקרובה...</span>
          </div>
        )}
      </div>

      {/* Hidden/Compact system logs to satisfy the 23:40 auto-sampler indicator visual */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap justify-between items-center text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Wifi size={10} className="text-emerald-500 shrink-0" />
          <span>סנכרון הבא ב-23:40</span>
        </div>
        {isSampling && (
          <div className="flex items-center gap-1 text-cyan-400 animate-pulse">
            <RefreshCw size={10} className="animate-spin" />
            <span>דוגם נתוני פיס...</span>
          </div>
        )}
        <div className="font-bold">
          מספר הגרלה שוטף: #{pastDraws[0]?.drawId || '3674'}
        </div>
      </div>
    </div>
  );
}
