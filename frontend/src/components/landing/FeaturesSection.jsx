import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '🛂',
    title: 'AI Visa Processing',
    description: 'Chat with our AI advisor to search, compare, and apply for visas to 190+ countries. No more paperwork or embassy queues.',
    highlights: ['Smart document checklist', 'Real-time status tracking', 'Multiple visa types'],
    accent: 'from-[#4F6EF7] to-[#0A1628]',
    accentBg: 'bg-[#4F6EF7]/5',
    accentText: 'text-[#4F6EF7]',
    accentBorder: 'border-[#4F6EF7]/20',
    cta: 'Apply for Visa',
  },
  {
    icon: '📱',
    title: 'Instant eSIM Data',
    description: 'Get a local data plan before you land. eSIM plans for 100+ countries with instant activation — no physical SIM needed.',
    highlights: ['4G/5G speeds', 'Instant QR activation', 'No roaming fees'],
    accent: 'from-[#818CF8] to-[#0F172A]',
    accentBg: 'bg-[#818CF8]/5',
    accentText: 'text-[#818CF8]',
    accentBorder: 'border-[#818CF8]/20',
    cta: 'Get eSIM Plan',
  },
  {
    icon: '⚡',
    title: 'All-in-One Chat',
    description: 'One AI assistant handles everything — from visa search to eSIM purchase. Just chat naturally and get things done.',
    highlights: ['Natural language AI', 'Proactive suggestions', 'Instant responses'],
    accent: 'from-[#10B981] to-[#0A1628]',
    accentBg: 'bg-[#10B981]/5',
    accentText: 'text-[#10B981]',
    accentBorder: 'border-[#10B981]/20',
    cta: 'Start Chatting',
  },
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-28 px-4 md:px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4F6EF7]/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#818CF8]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-6">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#6B7280]">Everything You Need to Travel</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-semibold text-[#0A1628] leading-tight mb-4 tracking-tight">
            Two Services,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F6EF7] to-[#818CF8]">One Platform</span>
          </h2>
          <p className="text-base md:text-lg text-[#6B7280] font-medium max-w-xl mx-auto leading-relaxed">
            Get your visa and data plan sorted before takeoff — all through a single AI conversation.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 rounded-3xl`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${feature.accentBg} border ${feature.accentBorder} flex items-center justify-center text-2xl md:text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-serif font-semibold text-[#0A1628] mb-3 tracking-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#6B7280] font-medium leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2.5 mb-8">
                  {feature.highlights.map((item, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${feature.accentText.replace('text-', 'bg-')}`} />
                      <span className="text-xs font-bold text-[#0A1628]/70">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/chat')}
                  className={`w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest ${feature.accentBg} ${feature.accentText} border ${feature.accentBorder} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
                >
                  {feature.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-sm text-[#6B7280] font-medium mb-4">Ready to simplify your travel?</p>
          <button
            onClick={() => navigate('/chat')}
            className="px-8 py-4 rounded-full bg-[#0A1628] text-white text-sm font-bold shadow-xl shadow-[#0A1628]/20 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Chat with AI Advisor →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
