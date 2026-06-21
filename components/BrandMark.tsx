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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brandRed text-lg font-black text-white">
        S
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="text-lg font-black uppercase tracking-tight text-white">
            Super<span className="text-brandRed">bucket</span>
          </p>
          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            Admin Dashboard
          </p>
        </div>
      )}
    </div>
  );
}
