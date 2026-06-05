import { LottoTicket } from '../types';
import { Trash2, Ticket, Printer, Award } from 'lucide-react';

interface SavedTicketsListProps {
  tickets: LottoTicket[];
  onDeleteTicket: (id: string) => void;
  onClearAll: () => void;
}

export default function SavedTicketsList({
  tickets,
  onDeleteTicket,
  onClearAll,
}: SavedTicketsListProps) {
  if (tickets.length === 0) {
    return (
      <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-10 text-center space-y-3" dir="rtl">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-white/5">
          <Ticket size={24} />
        </div>
        <p className="text-white font-bold text-sm">טרם נשמרו טפסים במערכת</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          לחצו על "הפק טבלאות" במסך המחולל כדי לצפות ולשמור כאן את הטבלאות והצירופים המנצחים שלכם.
        </p>
      </div>
    );
  }

  const handlePrint = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gameLabel = ticket.gameType === 'lotto' ? 'לוטו' : ticket.gameType === '777' ? '777' : "צ'אנס";

    const rowsHtml = ticket.tables
      .map((t, idx) => {
        let displayContent = '';
        if (ticket.gameType === 'chance' && t.chanceCards) {
          displayContent = t.chanceCards.map(c => `${c.suit} ${c.value}`).join(' | ');
        } else {
          displayContent = t.numbers.join(', ');
        }

        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">טבלה ${idx + 1}</td>
            <td style="padding: 10px; font-family: monospace; letter-spacing: 2px;">${displayContent}</td>
            <td style="padding: 10px; font-weight: bold; color: #e11d48; text-align: center;">${t.strong || '-'}</td>
            <td style="padding: 10px; font-weight: bold; text-align: center;">${t.score}%</td>
          </tr>
        `;
      })
      .join('');

    const extraHtml = ticket.extraNumber
      ? `<div style="margin-top: 20px; padding: 15px; border: 2px dashed #a855f7; border-radius: 8px; text-align: center; background: #faf5ff;">
          <h3 style="margin: 0 0 8px 0; color: #7e22ce; font-size: 14px;">מספר אקסטרה (EXTRA)</h3>
          <div style="font-size: 24px; font-weight: 900; letter-spacing: 8px; font-family: monospace; color: #7e22ce;">${ticket.extraNumber}</div>
         </div>`
      : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>טופס ${gameLabel} מנותח</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; direction: rtl; padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f4f4f5; font-weight: bold; padding: 10px; text-align: right; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="margin: 0; text-align: center; color: #4f46e5;">Lotto Generator Pro</h2>
            <p style="text-align: center; font-size: 12px; color: #666; margin: 5px 0 20px 0;">טופס ${gameLabel} חכם מבוסס סטטיסטיקה - הופק ב-${ticket.createdAt}</p>
            
            <table>
              <thead>
                <tr>
                  <th>טבלה</th>
                  <th>מספרים / קלפים לסימון</th>
                  <th style="text-align: center;">חזק</th>
                  <th style="text-align: center;">התאמה</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            
            ${extraHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6" dir="rtl" id="saved-tickets-list">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="font-bold text-white text-base">היסטוריית טפסים שמורים במערכת</h3>
          <p className="text-xs text-slate-400 mt-1">
            טפסים אלה נשמרו באופן מאובטח בדפדפנך לשימוש משני ושילוח מהיר.
          </p>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-rose-400 hover:text-white font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-2 rounded-xl transition-all cursor-pointer"
        >
          מחק את כל ההיסטוריה
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((ticket) => {
          // Calculate overall statistics
          const avgScore = Math.round(
            ticket.tables.reduce((acc, t) => acc + t.score, 0) / ticket.tables.length
          );

          const isLotto = ticket.gameType === 'lotto' || !ticket.gameType;
          const is777 = ticket.gameType === '777';
          const isChance = ticket.gameType === 'chance';

          const gameLabel = isLotto ? 'לוטו' : is777 ? '777' : "צ'אנס";

          return (
            <div
              key={ticket.id}
              className="bg-[#0f1422] border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/30 flex flex-col justify-between hover:border-cyan-500/30 transition-all text-right"
            >
              <div className="space-y-4">
                {/* Save header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-cyan-400">
                      <Ticket size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">טופס {gameLabel} ({ticket.tables.length} טבלאות)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">שעת הפקה: {ticket.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handlePrint(ticket.id)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      title="הדפס או ייצא PDF"
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteTicket(ticket.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="מחק טופס"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Simplified columns view */}
                <div className="space-y-2">
                  {ticket.tables.map((table, tIdx) => (
                    <div
                      key={table.id}
                      className="flex items-center justify-between text-xs p-1.5 bg-black/20 hover:bg-white/5 border border-white/5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-white/10 text-slate-350 text-[10px] font-bold flex items-center justify-center font-mono">
                          {tIdx + 1}
                        </span>
                        {isChance && table.chanceCards ? (
                          <span className="font-mono text-cyan-400 font-bold" dir="ltr">
                            {table.chanceCards.map(c => `${c.suit}${c.value}`).join(' | ')}
                          </span>
                        ) : (
                          <span className="font-mono text-slate-250 font-bold">
                            {table.numbers.join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isLotto && table.strong && (
                          <span className="text-[10px] text-rose-450 font-bold">חזק: {table.strong}</span>
                        )}
                        <span className="text-[10px] text-slate-300 bg-black/45 border border-white/15 px-1.5 py-0.5 rounded font-bold font-mono">
                          {table.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Block / Combined ticket info footer */}
              <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between">
                <div>
                  {isLotto && ticket.hasExtra && ticket.extraNumber ? (
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-purple-400 block leading-none">מספר EXTRA</span>
                      <span className="text-sm font-black font-mono tracking-wider text-purple-300 inline-block mt-1">
                        {ticket.extraNumber}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500">ללא משחק אקסטרה</span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-xl text-[10px] font-extrabold shadow-md">
                  <Award size={12} />
                  <span>ציון ממוצע: {avgScore}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
