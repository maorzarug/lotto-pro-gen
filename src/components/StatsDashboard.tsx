import React, { useState, useMemo } from 'react';
import { PastDraw, StatFrequencies } from '../types';
import { calculateStats } from '../utils';
import { BarChart3, TrendingUp, RotateCcw, Plus, Trash2, Calendar, FileDown, AlertTriangle } from 'lucide-react';

interface StatsDashboardProps {
  pastDraws: PastDraw[];
  stats: StatFrequencies;
  onAddDraw: (draw: PastDraw) => void;
  onResetDraws: () => void;
  onImportCsv: (text: string) => void;
}

export default function StatsDashboard({
  pastDraws,
  stats,
  onAddDraw,
  onResetDraws,
  onImportCsv,
}: StatsDashboardProps) {
  const [newDrawId, setNewDrawId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNumbers, setNewNumbers] = useState<string[]>(['', '', '', '', '', '']);
  const [newStrong, setNewStrong] = useState('');
  const [newExtra, setNewExtra] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [showCsvBox, setShowCsvBox] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const id = parseInt(newDrawId);
    const strongVal = parseInt(newStrong);
    const nums = newNumbers.map((v) => parseInt(v)).filter((v) => !isNaN(v) && v >= 1 && v <= 37);

    if (isNaN(id) || id <= 0) {
      setValidationError('אנא הזן מספר הגרלה תקין');
      return;
    }
    if (nums.length !== 6) {
      setValidationError('אנא הזן בדיוק 6 מספרים תקינים בין 1 ל-37');
      return;
    }
    if (isNaN(strongVal) || strongVal < 1 || strongVal > 7) {
      setValidationError('אנא הזן מספר חזק תקין בין 1 ל-7');
      return;
    }

    const draw: PastDraw = {
      drawId: id,
      date: newDate || new Date().toISOString().split('T')[0],
      numbers: nums.sort((a, b) => a - b),
      strong: strongVal,
      extra: newExtra || undefined,
    };

    onAddDraw(draw);
    setNewDrawId('');
    setNewNumbers(['', '', '', '', '', '']);
    setNewStrong('');
    setNewExtra('');
    setShowAddForm(false);
  };

  const handleCsvImport = () => {
    if (!csvInput.trim()) return;
    onImportCsv(csvInput);
    setCsvInput('');
    setShowCsvBox(false);
  };

  // Safe preset loading for CSV demo
  const loadDemoCsv = () => {
    const demo = `DrawId,Date,Num1,Num2,Num3,Num4,Num5,Num6,Strong,Extra
3675,2026-06-03,4,8,15,22,34,36,6,102938
3676,2026-06-07,2,11,18,25,29,33,3,991028
3677,2026-06-10,1,13,14,20,27,35,5,849102
3678,2026-06-14,7,12,19,21,28,37,1,304918`;
    setCsvInput(demo);
  };

  return (
    <div className="space-y-8" dir="rtl" id="stats-dashboard">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total draw count card */}
        <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30 flex items-center justify-between transition-all hover:border-cyan-500/20">
          <div>
            <span className="text-xs text-slate-400 font-medium block">סה"כ הגרלות במאגר</span>
            <span className="text-3xl font-extrabold text-white tracking-tight mt-1 inline-block font-mono">
              {pastDraws.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">+ מופע בסיס סטטיסטי רחב</span>
          </div>
          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Hot numbers cards */}
        <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30 flex items-center justify-between transition-all hover:border-cyan-500/20">
          <div>
            <span className="text-xs text-slate-400 font-medium block">המספרים החמים ביותר</span>
            <div className="flex gap-1.5 mt-2">
              {stats.hotNumbers.slice(0, 5).map((n) => (
                <span
                  key={n}
                  className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs font-bold font-mono"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 self-center">
            <span className="text-xs font-black font-mono">HOT</span>
          </div>
        </div>

        {/* Cold numbers cards */}
        <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30 flex items-center justify-between transition-all hover:border-cyan-500/20">
          <div>
            <span className="text-xs text-slate-400 font-medium block">המספרים הקרים ביותר</span>
            <div className="flex gap-1.5 mt-2">
              {stats.coldNumbers.slice(0, 5).map((n) => (
                <span
                  key={n}
                  className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xs font-bold font-mono"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 self-center">
            <span className="text-xs font-black font-mono">COLD</span>
          </div>
        </div>
      </div>

      {/* Main Stats Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hot & Cold Frequency Visualizer */}
        <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-cyan-400" size={18} />
              שכיחות הופעת מספרים (1 - 37)
            </h3>
            <span className="text-xs text-slate-400 font-medium">חם (זהוב) ◄ קר (תכלת)</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {Array.from({ length: 37 }, (_, i) => i + 1).map((n) => {
              const frequency = stats.numberFrequencies[n] || 0;
              const vals = Object.values(stats.numberFrequencies);
              const maxFreq = Math.max(...vals);
              const minFreq = Math.min(...vals);
              const ratio = (frequency - minFreq) / (maxFreq - minFreq || 1);

              const isHot = stats.hotNumbers.slice(0, 8).includes(n);
              const isCold = stats.coldNumbers.slice(0, 8).includes(n);

              return (
                <div
                  key={n}
                  className={`relative rounded-xl p-2.5 border text-center transition-all hover:scale-105 duration-200 ${
                    isHot
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm'
                      : isCold
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-405'
                      : 'bg-[#0a0d14] border-white/5 text-slate-300'
                  }`}
                >
                  <span className="block text-sm font-extrabold font-mono">{n}</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                    {frequency} של'
                  </span>
                  
                  {/* Subtle bar indicator inside the button */}
                  <div className="h-1 w-full bg-[#121622] mt-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHot ? 'bg-amber-400' : isCold ? 'bg-cyan-405' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(15, ratio * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strong number & Database Settings Panel */}
        <div className="space-y-6">
          {/* Strong Number Distribution */}
          <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp className="text-rose-450" size={18} />
              שכיחות המספר החזק (1 - 7)
            </h3>
            <div className="space-y-3.5">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => {
                const count = stats.strongFrequencies[n] || 0;
                const totalStrong = Object.values(stats.strongFrequencies).reduce((a, b) => a + b, 0) || 1;
                const percent = Math.round((count / totalStrong) * 100);

                return (
                  <div key={n} className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-black font-mono flex items-center justify-center text-sm">
                      {n}
                    </span>
                    <div className="flex-1 bg-white/5 h-2.5 rounded-full overflow-hidden relative">
                      <div
                        className="bg-rose-550 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent * 3}%` }}
                      />
                    </div>
                    <span className="w-16 text-left text-[11px] font-mono font-bold text-slate-400">
                      {count} הופעות
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Database management */}
          <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">ניהול קובצי הגרלות</h3>
              <button
                onClick={onResetDraws}
                className="text-[11px] text-rose-400 hover:text-white font-semibold flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                שחזר הגדרות מקוריות
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              מערכת הניתוח פועלת על בסיס הגרלות לוטו ישראלי רשמיות. באפשרותך לייבא קובץ CSV שהורד מאתר מפעל הפיס או להוסיף תוצאות חדשות ידנית.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowCsvBox(false);
                  setValidationError(null);
                }}
                className="flex-1 bg-[#111622] hover:bg-[#151b2a] border border-white/10 text-slate-350 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                הוסף הגרלה ידנית
              </button>

              <button
                onClick={() => {
                  setShowCsvBox(!showCsvBox);
                  setShowAddForm(false);
                  setValidationError(null);
                }}
                className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileDown size={14} />
                ייבא הגרלות ב-CSV
              </button>
            </div>

            {/* Error Banner Container */}
            {validationError && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-xs flex gap-2 items-center leading-relaxed">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Inline CSV importer */}
            {showCsvBox && (
              <div className="mt-4 p-4 bg-[#0a0d14] border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">הדבק נתוני CSV או השתמש בדוגמה:</span>
                  <button
                    onClick={loadDemoCsv}
                    className="text-[10px] text-cyan-400 hover:underline bg-white/5 px-2 py-1 rounded border border-white/5"
                  >
                    טען קפיצה של הגרלות לדוגמה
                  </button>
                </div>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="DrawId,Date,Num1,Num2,Num3,Num4,Num5,Num6,Strong"
                  className="w-full text-xs font-mono p-3 bg-[#111622] border border-white/10 rounded-xl h-24 text-white focus:outline-hidden focus:border-cyan-400 text-left"
                  dir="ltr"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCsvBox(false)}
                    className="text-xs text-slate-400 hover:bg-white/5 px-3 py-1.5 rounded-lg"
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    onClick={handleCsvImport}
                    className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg px-4 py-1.5 text-xs font-black shadow-md shadow-cyan-950/20 hover:from-cyan-400 hover:to-indigo-500 cursor-pointer"
                  >
                    ייבא נתונים
                  </button>
                </div>
              </div>
            )}

            {/* Inline Add Draw Form */}
            {showAddForm && (
              <form onSubmit={handleAddSubmit} className="mt-4 p-4 bg-[#0a0d14] border border-white/5 rounded-xl space-y-3 text-right">
                <span className="block text-xs font-bold text-slate-300 mb-1">הוספת הגרלה חדשה למאגר</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">מספר הגרלה</label>
                    <input
                      type="number"
                      required
                      placeholder="למשל 3675"
                      value={newDrawId}
                      onChange={(e) => setNewDrawId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#111622] border border-white/10 rounded-lg text-right text-white focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">תאריך הגרלה</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#111622] border border-white/10 rounded-lg text-white font-mono focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">6 מספרים (1 עד 37)</label>
                  <div className="grid grid-cols-6 gap-1.5" dir="ltr">
                    {newNumbers.map((val, idx) => (
                      <input
                        key={idx}
                        type="number"
                        min="1"
                        max="37"
                        required
                        placeholder={`מס' ${idx + 1}`}
                        value={val}
                        onChange={(e) => {
                          const updated = [...newNumbers];
                          updated[idx] = e.target.value;
                          setNewNumbers(updated);
                        }}
                        className="w-full text-center text-xs p-2.5 bg-[#111622] border border-white/10 rounded-md text-white font-bold focus:outline-hidden focus:border-cyan-405"
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">מספר חזק (1-7)</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      required
                      placeholder="1-7"
                      value={newStrong}
                      onChange={(e) => setNewStrong(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#111622] border border-white/10 rounded-lg text-center font-bold text-white focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">אקסטרה (6 ספרות - אופציונלי)</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="למשל 192803"
                      value={newExtra}
                      onChange={(e) => setNewExtra(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#111622] border border-white/10 rounded-lg text-center text-white focus:outline-hidden focus:border-cyan-445"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-slate-400 hover:bg-white/5 px-3 py-1.5 rounded-lg"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg px-4 py-1.5 text-xs font-black shadow-lg shadow-cyan-950/20 hover:from-cyan-400 hover:to-indigo-500 cursor-pointer"
                  >
                    שמור הגרלה
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* History Log */}
      <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="text-cyan-400" size={18} />
          יומן הגרלות קודמות
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold text-slate-500">
                <th className="py-3 px-4 font-semibold pb-3">מספר הגרלה</th>
                <th className="py-3 px-4 font-semibold pb-3">תאריך הגרלה</th>
                <th className="py-3 px-4 text-center font-semibold pb-3">מספרים</th>
                <th className="py-3 px-4 text-center font-semibold pb-3">חזק</th>
                <th className="py-3 px-4 text-center font-semibold pb-3">אקסטרה (טופס)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
              {pastDraws.slice(0, 10).map((draw) => {
                return (
                  <tr key={draw.drawId} className="hover:bg-white/[0.02] transition-colors font-sans">
                    <td className="py-3.5 px-4 font-bold font-mono text-cyan-400">#{draw.drawId}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-450">{draw.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1.5 justify-center">
                        {draw.numbers.map((num) => (
                          <span
                            key={num}
                            className="w-7 h-7 rounded-full bg-black/40 border border-white/10 text-slate-200 font-extrabold font-mono text-xs flex items-center justify-center shadow-xs"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold font-mono text-xs flex items-center justify-center mx-auto shadow-xs">
                        {draw.strong}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-mono font-bold text-purple-400">
                      {draw.extra ? draw.extra : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pastDraws.length > 10 && (
          <div className="text-center mt-3 text-xs text-slate-500 font-mono">
            מציג רק את 10 ההגרלות האחרונות מתוך {pastDraws.length}
          </div>
        )}
      </div>
    </div>
  );
}
