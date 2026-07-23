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
        className={`${
          compact ? "h-12 w-12" : "h-20 w-28"
        } shrink-0 object-contain`}
      />
      {!compact && (
        <div className="leading-none">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Admin Panel
          </p>
        </div>
      )}
    </div>
  );
}
