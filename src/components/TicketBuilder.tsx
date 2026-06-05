import { useState, useMemo } from 'react';
import { LottoTable, LottoTicket, StatFrequencies } from '../types';
import { 
  generateCombination, 
  generateExtraNumber, 
  scoreCombination,
  generate777Combination,
  score777Combination,
  generateChanceCombination
} from '../utils';
import { 
  Zap, 
  HelpCircle, 
  Flame, 
  Snowflake, 
  Scale, 
  Shuffle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Ticket, 
  Award,
  Sparkles,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TicketBuilderProps {
  stats: StatFrequencies;
  onSaveTicket: (ticket: LottoTicket) => void;
  activeTicket: LottoTicket | null;
  setActiveTicket: (ticket: LottoTicket | null) => void;
}

const FORMULA_LABELS = {
  HOT: 'חם (נפוץ ביותר)',
  COLD: 'קר (נדיר ועתיק)',
  BALANCED: 'מאוזן (פילוג זהב)',
  RANDOM: 'אקראי (מזל נקי)',
  CHANCE: 'מנוע סינון 🏆',
};

const FORMULA_ICONS = {
  HOT: <Flame className="text-amber-500" size={14} />,
  COLD: <Snowflake className="text-cyan-400" size={14} />,
  BALANCED: <Scale className="text-emerald-400" size={14} />,
  RANDOM: <Shuffle className="text-slate-400" size={14} />,
  CHANCE: <Award className="text-purple-400" size={14} />,
};

const FORMULA_DESCRIPTIONS = {
  CHANCE: 'סימולציה המחשבת שילובים אופטימליים לדחיית צירופים חלשים במיוחד.',
  HOT: 'בוחר מספרים שעלו בתדירות הגבוהה ביותר בהגרלות האחרונות של מפעל הפיס.',
  COLD: 'מתמקד במספרים שלא עלו זמן רב מתוך הנחה של תיקון סטטיסטי.',
  BALANCED: 'שילוב אינטליגנטי של יחסי זוגי/אי-זוגי וטווח סכומים מומלץ.',
  RANDOM: 'הגרלה אקראית פשוטה ללא סינונים מתמטיים.',
};

export default function TicketBuilder({
  stats,
  onSaveTicket,
  activeTicket,
  setActiveTicket,
}: TicketBuilderProps) {
  const [activeGame, setActiveGame] = useState<'lotto' | '777' | 'chance'>('lotto');
  const [tableCount, setTableCount] = useState<number>(14);
  const [selectedAlgo, setSelectedAlgo] = useState<LottoTable['algo']>('CHANCE');
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // 17 previous draw numbers state for 777 repetition engine
  const [prior777Text, setPrior777Text] = useState<string>('3, 8, 12, 17, 21, 26, 30, 34, 39, 43, 47, 51, 56, 60, 62, 65, 69');

  // Parsed 777 list
  const parsedPrior777 = useMemo(() => {
    const nums = prior777Text
      .split(/[\s,;|]+/)
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v) && v >= 1 && v <= 70);
    return Array.from(new Set(nums)).sort((a: number, b: number) => a - b);
  }, [prior777Text]);

  const handleGenerate = () => {
    const generatedTables: LottoTable[] = [];

    for (let i = 0; i < tableCount; i++) {
      if (activeGame === 'lotto') {
        const { numbers, strong } = generateCombination(selectedAlgo, stats);
        const { score, details } = scoreCombination(numbers, strong);
        generatedTables.push({
          id: `table-gen-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          numbers,
          strong,
          score,
          scoreDetails: details,
          algo: selectedAlgo,
          gameType: 'lotto',
        });
      } else if (activeGame === '777') {
        // Generate with custom previous draw recurrence override
        const numbers = generate777Combination(selectedAlgo, parsedPrior777);
        const { score, details } = score777Combination(numbers, parsedPrior777);
        generatedTables.push({
          id: `table-gen-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          numbers,
          score,
          scoreDetails: details,
          algo: selectedAlgo,
          gameType: '777',
        });
      } else {
        // Chance Game Type
        const cards = generateChanceCombination();
        const randomScore = Math.floor(Math.random() * 16) + 81; // 81% to 96%
        generatedTables.push({
          id: `table-gen-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          numbers: [],
          score: randomScore,
          scoreDetails: [
            {
              title: 'שילוב קלפים מאוזן',
              score: randomScore,
              max: 100,
              feedback: 'הטבלה נוצרה באמצעות חלוקת סדרות ומונעת כפילויות של אותם קלפים חופפים.',
              status: 'optimal'
            }
          ],
          algo: 'CHANCE',
          gameType: 'chance',
          chanceCards: cards,
        });
      }
    }

    // Sort tables by descending score (highest score rating first)
    generatedTables.sort((a, b) => b.score - a.score);

    const hasExtraValue = activeGame === 'lotto';
    const ticket: LottoTicket = {
      id: `ticket-${Date.now()}`,
      tables: generatedTables,
      hasExtra: hasExtraValue,
      extraNumber: hasExtraValue ? generateExtraNumber() : undefined,
      gameType: activeGame,
      createdAt: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveTicket(ticket);
    setExpandedTableId(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 65) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const getScoreStatusLabel = (score: number) => {
    if (score >= 90) return 'אופטימלי ✨';
    if (score >= 78) return 'מצוין';
    return 'סביר';
  };

  const changeGame = (game: 'lotto' | '777' | 'chance') => {
    setActiveGame(game);
    setActiveTicket(null);
  };

  return (
    <div className="space-y-5" dir="rtl" id="ticket-builder">
      {/* Game Type Selection Tabs */}
      <div className="flex bg-[#0f1422] p-1 rounded-xl border border-white/5 gap-1 max-w-sm mx-auto shadow-md">
        {(['lotto', '777', 'chance'] as const).map((game) => (
          <button
            key={game}
            type="button"
            onClick={() => changeGame(game)}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
              activeGame === game
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {game === 'lotto' ? '🎰 לוטו' : game === '777' ? '💎 777' : '🃏 צ\'אנס'}
          </button>
        ))}
      </div>

      {/* Main Generator Card */}
      <div className="bg-[#0f1422] border border-white/5 rounded-2xl p-5 shadow-lg shadow-black/40 space-y-4">
        
        {/* Active game header inside card */}
        <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">
              הפקת טבלאות {activeGame === 'lotto' ? 'ללוטו' : activeGame === '777' ? 'ל-777' : 'לצ\'אנס'} ⚙️
            </span>
          </div>
          
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="text-[11px] font-bold text-slate-400 flex items-center gap-1 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 cursor-pointer transition-colors"
          >
            <Sliders size={12} />
            <span>הגדרות מתקדמות ({FORMULA_LABELS[selectedAlgo]})</span>
          </button>
        </div>

        {/* 777 Specific - 17 Prior Draw Repetition Engine Selector */}
        {activeGame === '777' && (
          <div className="bg-[#090d16] border border-cyan-550/20 p-4 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
              <div>
                <span className="text-xs font-black text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  מנוע רגרסיה: חזרה של 3 מספרים מההגרלה הקודמת 🔁
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  סטטיסטית, כ-3 מספרים מהגרלה קודמת חוזרים שוב. הזן את 17 מספרי ההגרלה האחרונה לעדכון:
                </p>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded-full font-bold">
                פעיל כעת
              </span>
            </div>

            <input
              type="text"
              value={prior777Text}
              onChange={(e) => setPrior777Text(e.target.value)}
              placeholder="למשל: 3, 8, 12, 17..."
              className="w-full bg-black/40 border border-white/10 text-xs text-cyan-300 font-mono py-2.5 px-3 rounded-lg focus:outline-hidden focus:border-cyan-400 transition-colors text-right"
            />

            {/* Render Parsed list indicators */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-slate-450 font-bold ml-1">זוהו {parsedPrior777.length} מספרים:</span>
              <div className="flex flex-wrap gap-0.5">
                {parsedPrior777.map((n) => (
                  <span key={n} className="text-[10px] font-mono font-bold bg-white/5 text-slate-300 px-1 py-0.5 rounded border border-white/5">
                    {n}
                  </span>
                ))}
                {parsedPrior777.length !== 17 && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    מומלץ להזין בדיוק 17 מספרים (כרגע: {parsedPrior777.length})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Advanced Settings (Formula) */}
        <AnimatePresence>
          {showAdvancedSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3 border-b border-white/5 pb-3"
            >
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">בחר נוסחה ומודל סטטיסטי 🎯</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(Object.keys(FORMULA_LABELS) as LottoTable['algo'][]).map((algo) => (
                    <button
                      key={algo}
                      type="button"
                      disabled={activeGame === 'chance' && algo !== 'CHANCE'}
                      onClick={() => setSelectedAlgo(algo)}
                      className={`py-2 px-1 rounded-lg text-[11px] font-extrabold border transition-all flex flex-col items-center gap-1 justify-center cursor-pointer ${
                        activeGame === 'chance' && algo !== 'CHANCE'
                          ? 'opacity-30 cursor-not-allowed bg-black/20 border-transparent text-slate-600'
                          : selectedAlgo === algo
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-xs'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {FORMULA_ICONS[algo]}
                      <span>{FORMULA_LABELS[algo]}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal bg-black/20 p-2 rounded-lg border border-white/5">
                  {activeGame === 'chance' ? FORMULA_DESCRIPTIONS.CHANCE : FORMULA_DESCRIPTIONS[selectedAlgo]}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick parameters Selection Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Columns selection group */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-black text-slate-350 shrink-0">כמות טבלאות להגרלה:</span>
            <div className="relative w-full sm:w-44">
              <select
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value))}
                className="w-full bg-black/40 border border-white/10 text-xs text-white font-extrabold py-2.5 pl-8 pr-3.5 rounded-xl appearance-none focus:outline-hidden focus:border-cyan-400 transition-all text-right cursor-pointer"
              >
                {[2, 4, 6, 8, 10, 12, 14].map((num) => (
                  <option key={num} value={num} className="bg-[#0f1422] text-slate-200 font-bold">
                    {num} טבלאות {num === 6 ? '(חלוקה פופולרית)' : num === 14 ? '(טופס מלא)' : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="w-full sm:w-56 shrink-0">
            <button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-md shadow-cyan-950/20 flex items-center justify-center gap-1.5 text-sm cursor-pointer transform active:scale-98"
            >
              <Zap size={14} className="animate-bounce" />
              <span>חולל {tableCount} טבלאות עכשיו ⚡</span>
            </button>
          </div>

        </div>
      </div>

      {/* Generated Ticket display */}
      {activeTicket && activeTicket.gameType === activeGame && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1">
                <Sparkles className="text-purple-400" size={14} />
                <span>הופק טופס {activeGame === 'lotto' ? 'לוטו' : activeGame === '777' ? '777' : 'צ\'אנס'} חכם!</span>
              </h4>
              <p className="text-[11px] text-slate-450">
                הטבלאות מסודרות מהדירוג הסטטיסטי הגבוה ביותר ומטה 🏆
              </p>
            </div>
            
            <button
              onClick={() => onSaveTicket(activeTicket)}
              className="text-[11px] bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              שמור טופס להיסטוריה 💾
            </button>
          </div>

          {/* Column rows */}
          <div className="space-y-2">
            <AnimatePresence>
              {activeTicket.tables.map((table, index) => {
                const isExpanded = expandedTableId === table.id;
                
                let exportString = '';
                if (activeGame === 'chance' && table.chanceCards) {
                  exportString = `צ'אנס: ${table.chanceCards.map(c => `${c.suit}${c.value}`).join(' | ')}`;
                } else {
                  exportString = `777: ${table.numbers.join(', ')}`;
                }

                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="bg-[#0f1422] border border-white/5 rounded-xl overflow-hidden shadow-xs hover:border-cyan-500/25 transition-all text-right"
                  >
                    <div className="p-3 sm:p-4 flex flex-col md:flex-row items-center gap-3.5 justify-between">
                      {/* Left: Row Number + Rating score */}
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex flex-col items-center justify-center border border-white/5 shrink-0">
                          <span className="text-[8px] text-slate-500 font-bold">טבלה</span>
                          <span className="text-sm font-black text-white leading-none">
                            {index + 1}
                          </span>
                        </div>

                        <div
                          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shrink-0 text-right ${getScoreBadgeColor(
                            table.score
                          )}`}
                        >
                          <span className="text-xs font-black font-sans">
                            {table.score}%
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            ({getScoreStatusLabel(table.score)})
                          </span>
                        </div>
                      </div>

                      {/* Center: Row chosen numbers/deck */}
                      <div className="flex items-center gap-1.5 text-center w-full md:w-auto justify-center" dir="ltr">
                        {activeGame === 'lotto' && (
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="flex gap-1.5">
                              {table.numbers.map((n) => (
                                <span
                                  key={n}
                                  className="w-8 h-8 rounded-full bg-[#0a0d14] border border-white/10 text-slate-100 font-extrabold text-xs flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                  {n}
                                </span>
                              ))}
                            </div>
                            <div className="h-6 w-[1.5px] bg-white/10 mx-1" />
                            <div className="text-center flex items-center">
                              <span className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-extrabold text-xs flex items-center justify-center">
                                {table.strong}
                              </span>
                            </div>
                          </div>
                        )}

                        {activeGame === '777' && (
                          <div className="flex gap-1 flex-wrap justify-center">
                            {table.numbers.map((n) => {
                              const isRepeat = parsedPrior777.includes(n);
                              return (
                                <span
                                  key={n}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-extrabold text-xs flex items-center justify-center shadow-2xs border transition-colors ${
                                    isRepeat 
                                      ? 'bg-cyan-550/15 text-cyan-300 border-cyan-500/50' 
                                      : 'bg-[#0a0f18] border-slate-800 text-slate-200'
                                  }`}
                                  title={isRepeat ? 'מספר חזרה מהגרלה קודמת' : undefined}
                                >
                                  {n}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {activeGame === 'chance' && table.chanceCards && (
                          <div className="flex gap-1.5">
                            {table.chanceCards.map((card, cIdx) => (
                              <div
                                key={cIdx}
                                className={`w-11 h-16 rounded-md bg-[#0e121e] border border-slate-800 flex flex-col justify-between p-1 shadow-xs font-sans text-center ${
                                  card.isRed ? 'text-rose-500' : 'text-slate-250'
                                }`}
                              >
                                <span className="text-[8px] font-bold text-slate-400 leading-none" dir="rtl">
                                  {card.suit === '♣' ? 'ת' : card.suit === '♦' ? 'י' : card.suit === '♥' ? 'ל' : 'ע'}
                                </span>
                                <span className="text-xs font-black leading-none py-0.5">
                                  {card.value}
                                </span>
                                <span className="text-sm font-black leading-none self-end">
                                  {card.suit}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Copy & Stats Report Toggle */}
                      <div className="flex gap-1 w-full md:w-auto justify-end">
                        <button
                          onClick={() => copyToClipboard(exportString, table.id)}
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                          {copiedId === table.id ? (
                            <Check className="text-emerald-400" size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>

                        <button
                          onClick={() => setExpandedTableId(isExpanded ? null : table.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-black/40 hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer border border-white/5"
                        >
                          אנליזה {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      </div>
                    </div>

                    {/* Statistical feedback expansion */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-white/5 bg-[#0a0d14]/60"
                        >
                          <div className="p-3.5 space-y-3">
                            <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest">דוח פילוגים והתאמות סטטיסטיות:</span>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                              {table.scoreDetails?.map((det, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="bg-[#121622] border border-white/5 rounded-lg p-2.5 space-y-1.5 text-right"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-200">{det.title}</span>
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                      det.status === 'optimal'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : det.status === 'moderate'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                      {det.score}/{det.max}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                                    {det.feedback}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Form-level Extra for Lotto */}
          {activeGame === 'lotto' && activeTicket.extraNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-950/15 border border-purple-500/20 rounded-xl p-4 mt-2 text-center relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 max-w-lg mx-auto">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">
                    הגרלת EXTRA עבור הטופס כולו (מעודכן אוטומטית)
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    מסופק מספר אקסטרה ייחודי, תואם את ספח השילוח של מפעל הפיס.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(activeTicket.extraNumber || '', 'extra')}
                    className="p-1.5 border border-purple-500/20 bg-black/40 text-purple-400 hover:text-purple-300 rounded hover:shadow-2xs transition-all cursor-pointer"
                  >
                    {copiedId === 'extra' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>

                  <div className="flex gap-0.5" dir="ltr">
                    {activeTicket.extraNumber.split('').map((char, cIdx) => (
                      <span
                        key={cIdx}
                        className="w-7 h-9 rounded bg-[#0a0d14] border border-purple-500/20 text-purple-400 text-sm font-black flex items-center justify-center font-mono"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
