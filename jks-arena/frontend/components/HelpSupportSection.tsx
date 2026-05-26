"use client";

import { useState } from "react";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  { question: "How do I book a gaming slot?", answer: "Go to the 'Book Slot' section in your dashboard. Select your preferred date, check rig availability, choose your duration, and confirm your players." },
  { question: "Can I cancel or reschedule my booking?", answer: "Yes, you can cancel any upcoming session directly from your 'Upcoming Session' card. Currently, we allow cancellations up to 30 minutes before the start time." },
  { question: "What hardware/consoles are available?", answer: "We feature high-end PS5 Digital Edition consoles and a professional Racing Simulator equipped with a Logitech G29 wheel for the ultimate experience." },
  { question: "How many players can I bring with me?", answer: "Each PS5 slot allows for up to 4 players (Host + 3 Companions) for multiplayer titles. For Racing Simulators, it is strictly 1 player per rig to ensure safety." },
  { question: "Do you offer food and drinks in the Arena?", answer: "Yes! We have a dedicated cafe area serving snacks and beverages. Note that food and open drinks are not allowed near the gaming rigs." },
  { question: "What should I do if my rig isn't working?", answer: "Immediately notify the Arena manager on duty. We will either resolve the issue on the spot or move your session to an available rig of equal caliber." }
];

const policies = {
  refunds: `Refund & Cancellation Policy
1. Cancellations made 30 minutes or more before the scheduled booking time are eligible for a full refund.
2. Cancellations made less than 30 minutes before the scheduled booking time will incur a 50% cancellation fee.
3. No-shows are not eligible for a refund.
4. In the rare event of hardware failure or power outage on our end, a full refund or a free reschedule will be provided.
5. Refunds will be credited to the original payment method within 5-7 business days.`,
  terms: `Terms & Conditions
1. Users must be 16 years of age or older to book a session independently. Minors must be accompanied by an adult.
2. Any physical damage to the consoles, controllers, monitors, or simulator equipment due to negligence or rage will be billed to the registered user's account.
3. Outside food and beverages are strictly prohibited near the gaming stations.
4. JKS Arena reserves the right to terminate a session without refund if a user is found to be disruptive, abusive to staff, or violating our community guidelines.
5. Account sharing is not permitted. Only the registered user and their designated guests may occupy the booked station.`
};

type Tab = "FAQ" | "SUPPORT" | "POLICIES";

export default function HelpSupportSection({ isDark = false }: { isDark?: boolean }) {
  const [activeTab, setActiveTab] = useState<Tab>("FAQ");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Forms states
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");

  const textColor = isDark ? "text-white" : "text-[#1A1A1A]";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const bgCard = isDark ? "bg-[#1E1E2E] border-white/10" : "bg-white border-black/5";
  const bgHover = isDark ? "hover:border-[#ff6b35]/50 hover:bg-white/5" : "hover:border-[#ff6b35]/40 hover:bg-slate-50";

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Issue reported successfully. Our team will contact you shortly.");
    setIssueTitle("");
    setIssueDesc("");
  };

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${textColor}`}>
      
      {/* TABS HEADER */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md">
        {(["FAQ", "SUPPORT", "POLICIES"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-6 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab 
                ? "bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20" 
                : `text-slate-500 hover:text-[#ff6b35] ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`
            }`}
          >
            {tab === "SUPPORT" ? "Contact & Issues" : tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[400px]">
        
        {/* FAQ TAB */}
        {activeTab === "FAQ" && (
          <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-500">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`group overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    isOpen 
                      ? `${isDark ? 'bg-[#2A2A3A] border-[#ff6b35]' : 'bg-white border-[#ff6b35]'} shadow-md` 
                      : `${bgCard} ${bgHover}`
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className={`text-sm md:text-base font-black uppercase tracking-tight transition-colors ${
                      isOpen ? 'text-[#ff6b35]' : textColor
                    }`}>
                      {faq.question}
                    </span>
                    <div className={`flex shrink-0 ml-4 h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isOpen 
                        ? 'bg-[#ff6b35] border-[#ff6b35] text-white rotate-180' 
                        : `${isDark ? 'border-white/20' : 'border-black/10'} group-hover:border-[#ff6b35]/40`
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                      <p className={`text-sm font-medium leading-relaxed ${textMuted}`}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUPPORT TAB */}
        {activeTab === "SUPPORT" && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Contact Info */}
            <div className={`rounded-[2rem] border-2 ${isDark ? 'border-white/10 bg-[#1E1E2E]' : 'border-black bg-white'} p-8 shadow-lg`}>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Need Immediate Help?</h3>
              <p className={`text-sm font-medium mb-8 ${textMuted}`}>Our support team is available from 10 AM to 11 PM daily.</p>
              
              <div className="space-y-4">
                <div className={`rounded-2xl p-5 border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'}`}>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#ff6b35] font-black mb-1">Email Support</p>
                  <p className="text-sm font-black">support@jksarena.com</p>
                </div>
                <div className={`rounded-2xl p-5 border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'}`}>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#ff6b35] font-black mb-1">Phone / WhatsApp</p>
                  <p className="text-sm font-black">+91 98765 43210</p>
                </div>
                <div className={`rounded-2xl p-5 border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'}`}>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#ff6b35] font-black mb-1">Visit Us</p>
                  <p className="text-sm font-black">Ashok Nagar, Vikhroli East, Mumbai</p>
                </div>
              </div>
            </div>

            {/* Report Issue Form */}
            <div className={`rounded-[2rem] border ${isDark ? 'border-white/10 bg-[#1E1E2E]' : 'border-black/10 bg-white'} p-8 shadow-lg relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35]/10 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Report an Issue</h3>
                <p className={`text-sm font-medium mb-6 ${textMuted}`}>Having trouble with a booking or a rig? Let us know.</p>
                
                <form onSubmit={handleIssueSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1 ${textMuted}`}>Issue Topic</label>
                    <select required value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} className={`w-full rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ff6b35] border transition-all ${isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'}`}>
                      <option value="">Select Topic...</option>
                      <option value="Hardware">Hardware / Rig Issue</option>
                      <option value="Booking">Booking / Cancellation</option>
                      <option value="Payment">Payment / Refund</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1 ${textMuted}`}>Description</label>
                    <textarea required value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} rows={4} placeholder="Please describe the issue in detail..." className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6b35] border transition-all resize-none ${isDark ? 'bg-black/30 border-white/10 text-white placeholder:text-white/30' : 'bg-slate-50 border-black/10 text-black placeholder:text-black/30'}`}></textarea>
                  </div>
                  <button type="submit" className="w-full bg-[#ff6b35] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#e05a2b] transition-colors shadow-lg shadow-[#ff6b35]/20">
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === "POLICIES" && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Refund Policy */}
            <div className={`rounded-[2rem] border ${isDark ? 'border-white/10 bg-[#1E1E2E]' : 'border-black/10 bg-white'} p-8 shadow-lg`}>
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Refunds & Cancellations</h3>
              <div className={`text-sm font-medium space-y-3 leading-relaxed whitespace-pre-line ${textMuted}`}>
                {policies.refunds.split('\n').slice(1).join('\n')}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className={`rounded-[2rem] border ${isDark ? 'border-white/10 bg-[#1E1E2E]' : 'border-black/10 bg-white'} p-8 shadow-lg`}>
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Terms & Conditions</h3>
              <div className={`text-sm font-medium space-y-3 leading-relaxed whitespace-pre-line ${textMuted}`}>
                {policies.terms.split('\n').slice(1).join('\n')}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}