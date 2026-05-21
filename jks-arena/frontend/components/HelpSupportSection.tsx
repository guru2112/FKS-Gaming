"use client";

import { useState } from "react";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I book a gaming slot?",
    answer: "Go to the 'Book Slot' section in your dashboard. Select your preferred date, check rig availability, choose your duration, and confirm your players. Once you submit, your slot is instantly reserved!"
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes, you can cancel any upcoming session directly from your 'Upcoming Session' card or the 'Booking History' table. Currently, we allow cancellations up to 2 hours before the start time."
  },
  {
    question: "What hardware/consoles are available?",
    answer: "We feature high-end PS5 Digital Edition consoles (PS1-PS3) and a professional Racing Simulator (SIM1) equipped with a Logitech G29 wheel for the ultimate experience."
  },
  {
    question: "How many players can I bring with me?",
    answer: "Each PS5 slot allows for up to 2 players (Host + 1 Companion) for multiplayer titles. For Racing Simulators, it is strictly 1 player per rig to ensure safety and performance."
  },
  {
    question: "Do you offer food and drinks in the Arena?",
    answer: "Yes! We have a dedicated cafe area serving snacks and beverages. Note that food and open drinks are not allowed near the gaming rigs to protect the hardware."
  },
  {
    question: "What should I do if my rig isn't working?",
    answer: "Immediately notify the Arena manager on duty. We will either resolve the issue on the spot or move your session to an available rig of equal caliber."
  }
];

export default function HelpSupportSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER AREA */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-black uppercase tracking-widest text-[#ff6b35]">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Quick answers to the most common questions about JKS Arena.
        </p>
      </div>

      {/* FAQ GRID/ACCORDION */}
      <div className="grid gap-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className={`group overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                isOpen 
                  ? 'bg-white border-black shadow-md' 
                  : 'bg-[#FDF8F5] border-black/10 hover:border-[#ff6b35]/40'
              }`}
            >
              {/* Question Trigger */}
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className={`text-sm md:text-base font-black uppercase tracking-tight transition-colors ${
                  isOpen ? 'text-[#ff6b35]' : 'text-[#1A1A1A]'
                }`}>
                  {faq.question}
                </span>
                
                {/* Icon Wrapper */}
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isOpen 
                    ? 'bg-[#ff6b35] border-[#ff6b35] text-white rotate-180' 
                    : 'bg-white border-black/10 text-[#1A1A1A] group-hover:border-[#ff6b35]/40'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Answer Content */}
              <div 
                className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${
                  isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pt-2 border-t border-black/5">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTACT REDIRECT CARD */}
      <div className="bg-[#1A1A1A] rounded-[2rem] p-8 text-center shadow-xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35]/20 blur-3xl rounded-full"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
            Still need help?
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">
            Our support team is available 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@jksarena.com"
              className="bg-[#ff6b35] text-white px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#e05a2b] transition-all shadow-lg"
            >
              Email Support
            </a>
            <button
              onClick={() => toast.info("Live chat coming soon! Use email for now.", { duration: 3000 })}
              className="bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
            >
              Live Chat
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}