type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandMark({
  compact = false,
  className = "",
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/intiseva-logo.png"
        alt="IntiSeva"
        className={`${compact ? "h-10 w-10" : "h-14 w-14"} shrink-0 object-contain`}
      />
      {!compact && (
        <div className="leading-none">
          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-slate-500">
            IntiSeva Admin
          </p>
        </div>
      )}
    </div>
  );
}
