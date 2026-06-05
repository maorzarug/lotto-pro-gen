import { useState, useMemo } from 'react';
import { LottoTable, StatFrequencies } from '../types';
import { scoreCombination } from '../utils';
import { Sparkles, Check, Info, HelpCircle, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface ManualGridProps {
  stats: StatFrequencies;
  onAddCustomTable: (table: LottoTable) => void;
  activeTicketSize: number;
}

export default function ManualGrid({ stats, onAddCustomTable, activeTicketSize }: ManualGridProps) {
  const [selectedNums, setSelectedNums] = useState<number[]>([]);
  const [selectedStrong, setSelectedStrong] = useState<number | null>(null);

  const toggleNumber = (num: number) => {
    if (selectedNums.includes(num)) {
      setSelectedNums(selectedNums.filter((n) => n !== num));
    } else {
      if (selectedNums.length >= 6) {
        // limit 6
        return;
      }
      setSelectedNums([...selectedNums, num].sort((a, b) => a - b));
    }
  };

  const selectStrongNumber = (num: number) => {
    setSelectedStrong(num === selectedStrong ? null : num);
  };

  const clearSelection = () => {
    setSelectedNums([]);
    setSelectedStrong(null);
  };

  // Evaluate selected numbers dynamically on the fly
  const evaluation = useMemo(() => {
    if (selectedNums.length === 0) return null;
    const strongVal = selectedStrong || 4; // default dummy strong for evaluation
    return scoreCombination(selectedNums, strongVal);
  }, [selectedNums, selectedStrong]);

  const canSave = selectedNums.length === 6 && selectedStrong !== null;

  const handleSave = () => {
    if (!canSave || !evaluation) return;

    const customTable: LottoTable = {
      id: `table-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      numbers: [...selectedNums],
      strong: selectedStrong!,
      score: evaluation.score,
      scoreDetails: evaluation.details,
      algo: 'RANDOM', // classified as human-defined custom
    };

    onAddCustomTable(customTable);
    clearSelection();
  };

  // Dynamic recommendations text
  const smartRecommendation = useMemo(() => {
    if (selectedNums.length === 0) {
      return 'בחר מספרים על גבי הלוח לקבלת אנליזה סטטיסטית מיידית.';
    }
    if (selectedNums.length < 6) {
      return `בחרת ${selectedNums.length} מתוך 6 מספרים. המשך לבחור מספרים כדי לחשב את סכום הטווח והתפלגות הטבלה החכמה.`;
    }

    const sum = selectedNums.reduce((a, b) => a + b, 0);
    const evens = selectedNums.filter((n) => n % 2 === 0).length;
    const odds = 6 - evens;

    if (sum < 95) {
      return `שים לב: סכום המספרים הוא ${sum} שהינו נמוך יחסית (פחות מ-95). נסה להחליף חלק מהמספרים הקטנים במספרים מעל 19 כדי לאזן את הציון.`;
    }
    if (sum > 135) {
      return `שים לב: סכום המספרים הוא ${sum} שהינו גבוה יחסית (מעל 135). מומלץ לשלב חלק מהמספרים הנמוכים (1 עד 18) לקבלת פיזור אופטימלי.`;
    }
    if (evens === 0 || odds === 0) {
      return 'חלוקת זוגי/אי-זוגי קיצונית (הכל זוגיים או הכל אי-זוגיים). הסטטיסטיקה מראה שצירופים כאלו מהווים פחות מ-2.5% מכלל הזכיות.';
    }

    return 'הרכב מספרים מצוין! התפלגות הטבלה עומדת בכללי חוק נורמלי אופטימלי להגרלה הקרובה.';
  }, [selectedNums]);

  return (
    <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30 grid grid-cols-1 lg:grid-cols-12 gap-8" dir="rtl" id="manual-grid">
      
      {/* 1. Main Grid Numbers (Columns 1-37 Board) */}
      <div className="lg:col-span-8 space-y-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Sparkles className="text-cyan-400 fill-cyan-500/20" size={16} />
            הרכבת טבלת לוטו מותאמת אישית בכוחות עצמך
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            בחר בדיוק 6 מספרים מתוך הלוח (1-37) ומספר חזק בודד (1-7). המערכת תספק ציון התאמה מיידי.
          </p>
        </div>

        {/* Regular Numbers Grid Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400">לוח מספרים ראשי (מחולק לעשרות)</span>
            <span className={`font-mono font-bold ${selectedNums.length === 6 ? 'text-cyan-400' : 'text-slate-500'}`}>
              {selectedNums.length}/6 נבחרו
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-10 gap-2 select-none" dir="ltr">
            {Array.from({ length: 37 }, (_, i) => i + 1).map((n) => {
              const isSelected = selectedNums.includes(n);
              const isHot = stats.hotNumbers.slice(0, 5).includes(n);

              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNumber(n)}
                  className={`h-11 rounded-xl text-sm font-extrabold border transition-all flex flex-col justify-center items-center relative cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/40'
                      : isHot
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-black/40 hover:bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <span className="leading-none">{n}</span>
                  {isHot && !isSelected && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strong Number Selector */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400">בחר מספר חזק (1-7)</span>
            <span className={`font-mono font-bold ${selectedStrong ? 'text-rose-400' : 'text-slate-500'}`}>
              {selectedStrong ? 'חזק נבחר' : 'טרם נבחר'}
            </span>
          </div>

          <div className="flex gap-2" dir="ltr">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => {
              const isSelected = selectedStrong === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => selectStrongNumber(n)}
                  className={`w-11 h-11 rounded-full text-sm font-black border transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/40'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Real-time dynamic evaluation panel (Right hand side info) */}
      <div className="lg:col-span-4 bg-black/30 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-xs text-slate-400 font-semibold block">אנליזה חיה ביו-סטטיסטית</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-black font-mono transition-colors ${
                evaluation ? (evaluation.score >= 80 ? 'text-emerald-400' : evaluation.score >= 50 ? 'text-amber-400' : 'text-rose-400') : 'text-slate-600'
              }`}>
                {evaluation ? `${evaluation.score}%` : '—'}
              </span>
              {evaluation && (
                <span className="text-xs font-bold text-slate-500">ציון איכות אופטימלי</span>
              )}
            </div>
          </div>

          {/* Specific breakdown metrics */}
          {evaluation && (
            <div className="space-y-3">
              {evaluation.details.map((det, dIdx) => (
                <div key={dIdx} className="bg-[#111622] p-3 rounded-xl border border-white/5 text-xs shadow-md space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{det.title}</span>
                    <span className={det.status === 'optimal' ? 'text-emerald-400' : det.status === 'moderate' ? 'text-amber-400' : 'text-rose-400'}>
                      {det.score}/{det.max}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    {det.feedback}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* General recommendation box */}
          <div className="p-3 bg-cyan-950/10 border border-cyan-500/20 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-cyan-400">
              <Info size={14} />
              <span>המלצה מהירה למילוי</span>
            </div>
            <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
              {smartRecommendation}
            </p>
          </div>
        </div>

        {/* Actions panel */}
        <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              disabled={selectedNums.length === 0 && selectedStrong === null}
              className="flex-1 py-3 px-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-center"
            >
              נקה בחירה
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-cyan-950/20 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-center"
            >
              <Plus size={14} />
              שמור טבלה לטופס
            </button>
          </div>
          {activeTicketSize > 0 && (
            <span className="block text-center text-[10px] text-slate-500 font-medium leading-relaxed">
              הטבלה תישמר בטופס הקיים המכיל כעת {activeTicketSize} טבלאות. קובצי האקסטרה ייוותרו משותפים.
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
