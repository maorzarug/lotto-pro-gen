import { X, ShieldAlert, HeartHandshake, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceAccept?: boolean;
  onAccept?: () => void;
}

export default function LegalTermsModal({ isOpen, onClose, forceAccept = false, onAccept }: LegalTermsModalProps) {
  const handleConfirm = () => {
    if (onAccept) {
      onAccept();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          {/* Glass Overlay with fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={forceAccept ? undefined : onClose}
            className={`absolute inset-0 bg-black/80 backdrop-blur-lg ${forceAccept ? 'cursor-default' : 'cursor-pointer'}`}
          />

          {/* Modal Container with scale-in */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative z-10"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0d1324]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white leading-tight">תקנון ותנאי שימוש</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">גילוי נאות, הגבלת אחריות ומשחק אחראי 📜</p>
                </div>
              </div>
              
              {/* Close Button - Only show if not forcing acceptance */}
              {!forceAccept && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="סגור תקנון"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed font-sans max-h-[60vh] scrollbar-thin scrollbar-thumb-white/10">
              
              {/* 1. Introductory Notice */}
              <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex gap-3 text-right">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 animate-pulse" size={18} />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-200">הצהרה חשובה להבהרה מוקדמת</h4>
                  <p className="text-[11px] text-slate-400 font-bold leading-normal">
                    האתר והשירותים המוצעים בו הינם כלים עצמאיים למחקר וסטטיסטיקה. הגלישה והשימוש בכלים ובנתונים המופיעים באתר כפופים להסכמתך המלאה לתנאים המפורטים מטה.
                  </p>
                </div>
              </div>

              {/* 2. Sections */}
              <div className="space-y-5 text-xs sm:text-sm">
                
                {/* Section A */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-extrabold pb-1 border-b border-white/5">
                    <HeartHandshake size={14} className="text-cyan-400" />
                    <span>1. משחק אחראי ואי עידוד הימורים</span>
                  </div>
                  <p className="text-slate-400 pr-0.5 leading-normal">
                    אתר זה <strong>אינו</strong> מעודד, משדל, ממליץ או דוחף בשום צורה ואופן להשתתף בהגרלות פיס, הימורים או משחקי מזל כלשהם. השתתפות בהגרלות ומשחקי מזל מיועדת אך ורק למבוגרים מעל גיל 18 על פי חוק. משחקים אלו גוררים סיכון כספי ויש לשחק בהם בתבונה, בשליטה עצמית מלאה ומתוך הבנה שהסיכוי להפסד קיים תמיד.
                  </p>
                </div>

                {/* Section B */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-extrabold pb-1 border-b border-white/5">
                    <ShieldAlert size={14} className="text-rose-400" />
                    <span>2. הגבלת אחריות מוחלטת (Limitation of Liability)</span>
                  </div>
                  <p className="text-slate-400 pr-0.5 leading-normal">
                    כל תוצאה או צירוף מספרים המופק באמצעות הכלים הסטטיסטיים, האלגוריתמים, או המחוללים באתר (כגון "חמים/קרים", "מנתח ידני" או סימולציות עבר) מיועדים <strong>לבידור, שעשוע וניתוח תיאורטי בלבד</strong>. 
                  </p>
                  <p className="text-slate-400 pr-0.5 leading-normal">
                    מפעילי המערכת, מפתחיה ובעלי האתר <strong>אינם נושאים בשום אחריות</strong> (ישירה או עקיפה) לכל פעולה כספית שתבצע, הימורים שתשלח, כרטיסים שתרכוש, או תוצאה חיובית/שלילית שתיגרם בעקבות הנתונים המופיעים באתר. כל נזק, הפסד כספי, או עוגמת נפש שייגרמו למשתמש או לצד ג' הם באחריותו הבלעדית של המשתמש.
                  </p>
                </div>

                {/* Section C */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-extrabold pb-1 border-b border-white/5">
                    <Eye size={14} className="text-indigo-400" />
                    <span>3. היעדר קשר למפעל הפיס הרשמי</span>
                  </div>
                  <p className="text-slate-400 pr-0.5 leading-normal">
                    אתר זה פועל באופן <strong>פרטי ועצמאי לחלוטין</strong>. האתר עשוי להציג פרסומות, קישורים ממומנים או מודעות מסחריות שונות במטרה לממן את עלויות פיתוח, תחזוקת השרתים ותפעול המערכת. אין לאתר, לבעליו או ליוצריו כל קשר מוסדי, שותפות, חסות או ייצוג רשמי מטעם מועצת מפעל הפיס הישראלי, הטוטו או כל גוף הגרלות ממשלתי. כל סימני המסחר, השמות המסחריים והלוגויים שייכים לבעליהם החוקיים בלבד.
                  </p>
                </div>

                {/* Section D */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-extrabold pb-1 border-b border-white/5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>4. דיוק ואמינות מאגר הנתונים</span>
                  </div>
                  <p className="text-slate-400 pr-0.5 leading-normal">
                    מערכות האתר עושות כל מאמץ לסנכרן, לדגום ולעדכן את ההגרלות האחרונות מדי יום (כולל ב-23:40 בכל יום פעילות). עם זאת, ייתכנו שגיאות טכניות, שיבושים בשרת, הפרעות תקשורת או עיכובים זמניים במאגר. <strong>הנתונים הקובעים והרשמיים והיחידים לעניין זכיות בפרס כלשהו הם אך ורק אלו המפורסמים ישירות בערוצים הרשמיים של מפעל הפיס</strong>.
                  </p>
                </div>

              </div>

              {/* 3. Footer Declaration Accent */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-slate-400 font-extrabold block">
                  המשך הגלישה ויצירת טפסים באתר מהווה קבלה והסכמה מלאה ובלתי חוזרת של תנאים אלו.
                </span>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-[#0d1324] border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={handleConfirm}
                className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs px-6 py-2 rounded-lg cursor-pointer transform hover:scale-[1.02] transition-all select-none shadow-lg shadow-indigo-950/50"
              >
                קראתי ואני מסכים 🤝
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
