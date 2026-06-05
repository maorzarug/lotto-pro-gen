import { useState } from 'react';
import { Sparkles, Code, Brain, ShieldCheck, Gamepad2, ArrowRightLeft } from 'lucide-react';

interface AdBannerProps {
  slotId?: string; // Unique ID for targeting different placements
  label?: string;  // Custom label for the placement
  variant?: 'leaderboard' | 'compact' | 'sidebar';
}

export default function AdBanner({
  slotId = 'default-banner',
  label = 'תוכן ממומן',
  variant = 'leaderboard'
}: AdBannerProps) {
  const [showIntegrationGuide, setShowIntegrationGuide] = useState(false);

  // Define dimensions based on modern standard interactive advertising formats
  const dimensionsClass = 
    variant === 'leaderboard' 
      ? 'min-h-[100px] w-full max-w-4xl' 
      : variant === 'sidebar'
      ? 'min-h-[250px] w-full'
      : 'min-h-[70px] w-full';

  return (
    <div 
      id={`ad-placement-${slotId}`} 
      className="w-full flex flex-col items-center justify-center my-4 relative"
      dir="rtl"
    >
      {/* Small badge to satisfy ad policy guidelines */}
      <div className="flex justify-between items-center w-full max-w-2xl px-2 mb-1.5">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block"></span>
          {label} • פרסומת פנימית
        </span>
        
        {/* Helper info toggle for the webmaster */}
        <button
          type="button"
          onClick={() => setShowIntegrationGuide(!showIntegrationGuide)}
          className="text-[9px] text-cyan-400/80 bg-cyan-950/20 border border-cyan-500/10 px-2 py-0.5 rounded hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
          title="לחץ להנחיות שילוב קוד Google AdSense"
        >
          <Code size={10} />
          <span>הדבקת קוד Google AdSense</span>
        </button>
      </div>

      {/* Main Container Layer for Ad / Styled Feature Banner */}
      <div 
        className="w-full max-w-4xl rounded-2xl flex justify-center items-center text-center transition-all overflow-hidden relative group shadow-xl"
      >
        <a 
          href="https://s.click.aliexpress.com/e/_c4r98DhB?bz=725*90" 
          target="_parent"
          rel="noopener noreferrer"
          className="block w-full max-w-[725px] h-auto overflow-hidden rounded-xl border border-white/10 hover:border-cyan-500/40 hover:shadow-cyan-950/20 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative"
        >
          {/* Subtle soft backdrop reflection effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-indigo-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <img 
            width={725} 
            height={90} 
            src="https://ae-pic-a1.aliexpress-media.com/kf/S28f0f70c243c4514a57521a3b063ecbbi.png" 
            alt="מבצעי חם באליאקספרס AliExpress" 
            className="w-full h-auto object-cover block select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </a>

        {/* Code integration hints display (Toggleable) */}
        {showIntegrationGuide && (
          <div className="absolute inset-0 bg-slate-950/98 p-4 flex flex-col justify-between text-right overflow-y-auto text-[10px] font-sans text-slate-300 z-20">
            <div className="space-y-2">
              <span className="block text-cyan-400 font-bold border-b border-cyan-950 pb-1 flex items-center gap-1">
                <Sparkles size={11} />
                שילוב קוד Google AdSense או קוד מודעה מסחרי:
              </span>
              <p className="leading-relaxed">
                1. כנסו לחשבון ה-AdSense שלכם וצרו יחידת מודעה מסוג <strong className="text-white">Display Ad (מודעת תצוגה)</strong> והגדירו אותה כ-<strong className="text-white">Responsive (רספונסיבית)</strong>.
              </p>
              <p className="leading-relaxed">
                2. פתחו את הקובץ <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 inline-block font-mono">/src/components/AdBanner.tsx</code>.
              </p>
              <p className="leading-relaxed">
                3. החליפו את ה-JSX הפנימי בקוד ה-AdSense שקיבלתם מגוגל. המערכת תומכת בטעינת קוד צד-שלישי בצורה חלקה ויפה.
              </p>
            </div>
            
            <button
              onClick={() => setShowIntegrationGuide(false)}
              className="mt-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 py-1.5 rounded-lg text-[9px] font-extrabold cursor-pointer transition-all"
            >
              הבנתי, סגור מדריך ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

