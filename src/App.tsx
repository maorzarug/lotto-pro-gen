import { useState, useEffect, useMemo } from 'react';
import { PastDraw, LottoTicket, LottoTable } from './types';
import { INITIAL_PAST_DRAWS } from './data';
import { calculateStats } from './utils';
import { motion, AnimatePresence } from 'motion/react';

// Components
import StatsDashboard from './components/StatsDashboard';
import TicketBuilder from './components/TicketBuilder';
import ManualGrid from './components/ManualGrid';
import SavedTicketsList from './components/SavedTicketsList';
import AdBanner from './components/AdBanner';
import DrawCountdown from './components/DrawCountdown';
import LegalTermsModal from './components/LegalTermsModal';

// Icons
import { 
  Ticket, 
  Edit, 
  Save, 
  Sparkles, 
  Eye, 
  Heart, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  BookOpen,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [pastDraws, setPastDraws] = useState<PastDraw[]>(INITIAL_PAST_DRAWS);
  const [savedTickets, setSavedTickets] = useState<LottoTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<LottoTicket | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Clean collapsible system for secondary dashboard widgets
  const [openSection, setOpenSection] = useState<'none' | 'manual' | 'stats' | 'saved'>('none');
  
  const [sessionBannerMessage, setSessionBannerMessage] = useState<string | null>(null);
  const [isLargeText, setIsLargeText] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [forceTermsGate, setForceTermsGate] = useState<boolean>(false);

  // 1. Load initial states from LocalStorage or seed file
  useEffect(() => {
    fetchRemoteData(false);

    const storedTickets = localStorage.getItem('lotto_saved_tickets');
    if (storedTickets) {
      try {
        setSavedTickets(JSON.parse(storedTickets));
      } catch (e) {}
    }

    const accepted = localStorage.getItem('lotto_terms_accepted') === 'true';
    if (!accepted) {
      setIsTermsOpen(true);
      setForceTermsGate(true);
    }
  }, []);

  // 2. Persist states
  const savePastDraws = (updated: PastDraw[]) => {
    setPastDraws(updated);
    localStorage.setItem('lotto_past_draws', JSON.stringify(updated));
  };

  const saveSavedTickets = (updated: LottoTicket[]) => {
    setSavedTickets(updated);
    localStorage.setItem('lotto_saved_tickets', JSON.stringify(updated));
  };

  const handleAcceptTerms = () => {
    localStorage.setItem('lotto_terms_accepted', 'true');
    setIsTermsOpen(false);
    setForceTermsGate(false);
    triggerBanner('🤝 תנאי השימוש והגילוי הנאות אושרו בהצלחה.');
  };

  // 3. Dynamic statistics calculation
  const stats = useMemo(() => {
    return calculateStats(pastDraws);
  }, [pastDraws]);

  // 4. Past draw addition / modification
  const handleAddDraw = (draw: PastDraw) => {
    const filtered = pastDraws.filter((d) => d.drawId !== draw.drawId);
    const updated = [draw, ...filtered].sort((a, b) => b.drawId - a.drawId);
    savePastDraws(updated);
    triggerBanner('✓ הגרלה חדשה נוספה! הסטטיסטיקות עודכנו מחדש.');
  };

  const handleResetDraws = () => {
    savePastDraws(INITIAL_PAST_DRAWS);
    triggerBanner('✓ מאגר הגרלות העבר אופס ושוחזר בהצלחה.');
  };

  const handleImportCsv = (text: string, isAutoLoad = false): boolean => {
    const lines = text.split('\n');
    const imported: PastDraw[] = [];

    lines.forEach((line) => {
      if (!line.trim() || line.toLowerCase().includes('drawid') || line.includes('הגרלה')) {
        return; 
      }

      const parts = line.split(',');
      if (parts.length >= 7) {
        const drawId = parseInt(parts[0].trim());
        const date = parts[1].trim() || new Date().toISOString().split('T')[0];
        const numbers = parts
          .slice(2, 8)
          .map((v) => parseInt(v.trim()))
          .filter((v) => !isNaN(v) && v >= 1 && v <= 37)
          .sort((a, b) => a - b);

        const strong = parseInt(parts[8]?.trim() || '4');
        const extra = parts[9]?.trim();

        if (!isNaN(drawId) && numbers.length === 6 && !isNaN(strong)) {
          imported.push({
            drawId,
            date,
            numbers,
            strong,
            extra: extra || undefined,
          });
        }
      }
    });

    if (imported.length > 0) {
      const existingMap = new Map<number, PastDraw>(pastDraws.map((d) => [d.drawId, d]));
      imported.forEach((d) => existingMap.set(d.drawId, d));
      const merged = Array.from(existingMap.values()).sort((a, b) => b.drawId - a.drawId);
      savePastDraws(merged);
      triggerBanner(`✓ יבוא הושלם! ${imported.length} הגרלות חדשות עודכנו.`);
      return true;
    } else {
      if (!isAutoLoad) {
        alert('פורמט קובץ ה-CSV אינו תקין.');
      }
      return false;
    }
  };

  const fetchRemoteData = async (isManualRefresh = false) => {
    if (isRefreshing) return;
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetch('/lotto_database.csv');
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          const csvText = await response.text();
          if (csvText && !csvText.includes('<!DOCTYPE') && !csvText.includes('<html')) {
            const success = handleImportCsv(csvText, true);
            if (success) {
              triggerBanner(isManualRefresh ? '✓ סנכרון הושלם ונתוני ההגרלות עודכנו בהצלחה!' : '✓ נתוני הגרלה רשמיים נטענו בהצלחה!');
              if (isManualRefresh) {
                setTimeout(() => setIsRefreshing(false), 800);
              }
              return;
            }
          }
        }
      }
    } catch (e) {
      console.log('Skipping remote fetch, using local seed defaults');
    }

    const storedDraws = localStorage.getItem('lotto_past_draws');
    if (storedDraws) {
      try {
        const parsed = JSON.parse(storedDraws);
        if (parsed && parsed.length >= 1) {
          setPastDraws(parsed);
          if (isManualRefresh) {
            triggerBanner('✓ נתוני הגרלה עודכנו מתוך הזיכרון המקומי.');
            setTimeout(() => setIsRefreshing(false), 800);
          }
          return;
        }
      } catch (e) {}
    }

    setPastDraws(INITIAL_PAST_DRAWS);
    if (isManualRefresh) {
      triggerBanner('✓ שוחזר מאגר ברירת המחדל.');
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleSaveTicket = (ticket: LottoTicket) => {
    if (savedTickets.some((t) => t.id === ticket.id)) {
      triggerBanner('טופס זה כבר שמור בהיסטוריה.');
      return;
    }
    const updated = [ticket, ...savedTickets];
    saveSavedTickets(updated);
    triggerBanner('✓ הטופס נשמר! תוכל לצפות בו תמיד בלוח השמירות מטה.');
  };

  const handleDeleteTicket = (id: string) => {
    const updated = savedTickets.filter((t) => t.id !== id);
    saveSavedTickets(updated);
    triggerBanner('הטופס נמחק מהשמירות.');
  };

  const handleClearTickets = () => {
    if (window.confirm('האם למחוק סופית את כל טפסי ההיסטוריה?')) {
      saveSavedTickets([]);
      triggerBanner('היסטוריית הטפסים השמורים אופסה.');
    }
  };

  // Add custom manual table to active generated ticket
  const handleAddCustomTable = (table: LottoTable) => {
    if (activeTicket) {
      const updatedTables = [...activeTicket.tables, table];
      updatedTables.sort((a, b) => b.score - a.score);
      const updatedTicket: LottoTicket = {
        ...activeTicket,
        tables: updatedTables,
      };
      setActiveTicket(updatedTicket);
      triggerBanner('✓ הטבלה האישית שלך נסרקה והתווספה לטופס הפעיל בהצלחה!');
    } else {
      const newTicket: LottoTicket = {
        id: `ticket-${Date.now()}`,
        tables: [table],
        hasExtra: false,
        createdAt: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      };
      setActiveTicket(newTicket);
      triggerBanner('✓ הטבלה האישית שלך סומנה כטופס פעיל חדש.');
    }
    // Anchor to generator section to see changes
    setOpenSection('none');
  };

  const triggerBanner = (msg: string) => {
    setSessionBannerMessage(msg);
    setTimeout(() => setSessionBannerMessage(null), 4000);
  };

  const toggleSection = (section: 'manual' | 'stats' | 'saved') => {
    setOpenSection(openSection === section ? 'none' : section);
  };

  return (
    <div className={`min-h-screen bg-[#070911] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/10 selection:text-cyan-200 ${isLargeText ? 'large-text-layout' : ''}`} dir="rtl">
      
      {/* Sticky Top Alerts banner */}
      {sessionBannerMessage && (
        <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold py-2 px-4 text-center transition-all sticky top-0 z-50 shadow-md">
          {sessionBannerMessage}
        </div>
      )}

      {/* Main Ultra-simple Header Segment */}
      <header className="bg-[#0f1422]/70 border-b border-white/5 py-3.5 px-4 sticky top-0 backdrop-blur-md z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles size={16} className="fill-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white leading-tight flex items-center gap-1">
                Lotto Generator Pro
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                מחולל פיס חכם, פשוט ונגיש לנייד
              </p>
            </div>
          </div>

          {/* Accessibility Option Action */}
          <button
            onClick={() => setIsLargeText(!isLargeText)}
            title={isLargeText ? "כיווץ גופן רגיל" : "הגדל גופן לקריאה נוחה"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
              isLargeText 
                ? 'bg-amber-400 border-amber-300 text-black shadow-md' 
                : 'bg-white/5 border-white/5 text-slate-300 hover:text-white'
            }`}
          >
            <Eye size={15} />
          </button>
        </div>
      </header>

      {/* Main Single-screen Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-3 sm:p-5 space-y-4 pb-12">
        
        {/* Simplified Welcoming Header with Condensed 1-2 lines Disclaimer */}
        <div className="bg-[#0f1422] border-l-2 border-cyan-500 rounded-xl p-3.5 shadow-sm text-right space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-white">
              <Heart size={14} className="text-cyan-400 fill-cyan-500/10" />
              <span className="text-xs font-black">מחולל לוטו, צ'אנס ו-777 בקלות 🍀</span>
            </div>
            
            {/* Connection / Import indicator */}
            <button
              onClick={() => fetchRemoteData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-[0.98] text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 px-2.5 py-1 rounded-lg text-[10px] font-black w-fit cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed select-none"
              title="לחץ לעדכון יזום וטעינה מחדש של נתוני הגרלות הפיס האחרונות"
            >
              <RefreshCw 
                size={11} 
                className={`text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              <span>
                {isRefreshing 
                  ? 'מעדכן...' 
                  : `סנכרון תקין (${pastDraws.length} הגרלות) 🔄`
                }
              </span>
            </button>
          </div>
          
          <p className="text-[11px] text-slate-350 leading-relaxed">
            המערכת מסייעת להגריל צירופים מאוזנים מבחינה סטטיסטית על ידי ניתוח תוצאות העבר הרשמיות בישראל.
          </p>

          {/* New block showing the most recent draft numbers */}
          {pastDraws.length > 0 && (
            <div className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cyan-400">
                  🏆 תוצאות ההגרלה האחרונה בהיסטוריה (מספר {pastDraws[0].drawId} בתאריך {pastDraws[0].date})
                </span>
                <span className="text-[9px] text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded">
                  רשמי פיס
                </span>
              </div>
              <div className="flex items-center gap-2 justify-start" dir="ltr">
                <div className="flex gap-1">
                  {pastDraws[0].numbers.map((n) => (
                    <span
                      key={n}
                      className="w-7 h-7 rounded-full bg-[#030712] border border-cyan-500/30 text-cyan-300 font-extrabold text-xs flex items-center justify-center wrapper-ball"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="w-[1px] h-5 bg-white/10 mx-0.5" />
                <span
                  className="w-7 h-7 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-extrabold text-xs flex items-center justify-center font-sans"
                  title="מספר חזק של ההגרלה האחרונה"
                >
                  {pastDraws[0].strong}
                </span>
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-400 bg-black/35 py-1.5 px-2.5 rounded border border-white/5 leading-relaxed font-semibold">
            ❤️ <strong>גילוי נאות למשחק אחראי:</strong> מדובר במשחקי הגרלה אקראיים לחלוטין. הכלים באתר נועדו לניתוח סטטיסטי בלבד ואין בהם הבטחת זכייה כלשהי. שחקו באחריות!
          </div>
        </div>

        {/* Top Ad Unit */}
        <AdBanner slotId="top" label="תוכן ממומן - מיקום עליון פופולרי" variant="leaderboard" />

        {/* Primary Generator Core Widget */}
        <div id="primary-generator-section">
          <TicketBuilder
            stats={stats}
            onSaveTicket={handleSaveTicket}
            activeTicket={activeTicket}
            setActiveTicket={setActiveTicket}
          />
        </div>

        {/* Dynamic Countdown and Smarter Auto-Sampler */}
        <DrawCountdown
          pastDraws={pastDraws}
          onAddDraw={handleAddDraw}
          triggerBanner={triggerBanner}
        />

        {/* Bottom Ad Unit */}
        <AdBanner slotId="bottom" label="תוכן ממומן - מיקום תחתון נוסף" variant="compact" />

        {/* Dynamic Secondary Action Drawers - Bento Style Compact Expandables */}
        <div className="space-y-2 pt-3">
          
          {/* 1. Toggleable Manual entry grid */}
          <div className="bg-[#0f1422] border border-white/5 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('manual')}
              className="w-full px-4 py-3 flex justify-between items-center text-xs font-extrabold text-slate-200 hover:text-white hover:bg-white/3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Edit size={14} className="text-cyan-400" />
                <span>הרכבה ודירוג טבלה ידנית 📝 (אופציונלי)</span>
              </div>
              {openSection === 'manual' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {openSection === 'manual' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5 bg-slate-950/20"
                >
                  <div className="p-3.5">
                    <ManualGrid
                      stats={stats}
                      onAddCustomTable={handleAddCustomTable}
                      activeTicketSize={activeTicket ? activeTicket.tables.length : 0}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Toggleable Saved Tickets List */}
          <div className="bg-[#0f1422] border border-white/5 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('saved')}
              className="w-full px-4 py-3 flex justify-between items-center text-xs font-extrabold text-slate-200 hover:text-white hover:bg-white/3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Save size={14} className="text-emerald-400" />
                <span>היסטוריית טפסים שמורים 💾 ({savedTickets.length})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                {savedTickets.length > 0 && (
                  <span className="bg-rose-500 text-white rounded-full text-[9px] font-bold px-1.5 py-0.5 ml-1">
                    {savedTickets.length}
                  </span>
                )}
                {openSection === 'saved' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>
            <AnimatePresence>
              {openSection === 'saved' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5 bg-slate-950/20"
                >
                  <div className="p-3.5">
                    <SavedTicketsList
                      tickets={savedTickets}
                      onDeleteTicket={handleDeleteTicket}
                      onClearAll={handleClearTickets}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Toggleable Stats and past draws manager */}
          <div className="bg-[#0f1422] border border-white/5 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('stats')}
              className="w-full px-4 py-3 flex justify-between items-center text-xs font-extrabold text-slate-200 hover:text-white hover:bg-white/3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Database size={14} className="text-indigo-400" />
                <span>מאגר הגרלות וסטטיסטיקה 📊 (חמים / קרים)</span>
              </div>
              {openSection === 'stats' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {openSection === 'stats' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5 bg-slate-950/20"
                >
                  <div className="p-3.5">
                    <StatsDashboard
                      pastDraws={pastDraws}
                      stats={stats}
                      onAddDraw={handleAddDraw}
                      onResetDraws={handleResetDraws}
                      onImportCsv={handleImportCsv}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>

      {/* Simplified, Humble Footer */}
      <footer className="bg-[#0b0e14]/90 border-t border-white/5 py-6 text-center text-[10px] text-slate-500 space-y-2 mt-auto">
        <div className="max-w-2xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">
            Lotto Generator Pro © 2026 • של מאור
          </p>
          <p className="max-w-md mx-auto leading-relaxed">
            המערכת נועדה לצורך הרכבה סטטיסטית של צירופי מספרים בלבד. משחקי הגרלה מיועדים למבוגרים מעל 18 ותלויים במזל אקראי בלבד. שחקו באחריות ובהנאה. ❤️
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setForceTermsGate(false);
                setIsTermsOpen(true);
              }}
              className="text-cyan-500 hover:text-cyan-400 font-extrabold cursor-pointer transition-colors hover:underline"
              type="button"
            >
              תקנון ותנאי שימוש 📜
            </button>
            <span className="text-white/10">•</span>
            <span className="text-slate-400 font-semibold">משחק אחראי 🔞</span>
          </div>
        </div>
      </footer>

      {/* Legal Terms Modal Pop-up */}
      <LegalTermsModal 
        isOpen={isTermsOpen} 
        onClose={() => {
          setIsTermsOpen(false);
          setForceTermsGate(false);
        }} 
        forceAccept={forceTermsGate}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
