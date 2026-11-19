import React from 'react';

export default function KpiCard({
  title,
  value,
  subvalue,
  icon: Icon,
  badge,
  badgeType = 'default',
  accentColor = '#2563EB',
}) {
  const badgeStyles = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2.5">
        <span className="text-2xl lg:text-3xl font-extrabold text-[#172033] tracking-tight font-sans">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeStyles[badgeType] || badgeStyles.default}`}>
            {badge}
          </span>
        )}
      </div>

      {subvalue && (
        <p className="mt-1.5 text-xs text-[#94A3B8] font-normal leading-relaxed">
          {subvalue}
        </p>
      )}
    </div>
  );
}
