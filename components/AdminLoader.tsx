import BrandMark from "./BrandMark";

export default function AdminLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  const content = (
    <div className={fullScreen ? "sb-admin-loading-center" : "sb-inline-loader"}>
      <div className={fullScreen ? "sb-admin-loading-absolute text-center" : "text-center"}>
        <div className="sb-loader">
          <div className="sb-loader-spin" />
        </div>
        <div className="mt-8 flex justify-center rounded-md border border-blue-100 bg-white px-4 py-3">
          <BrandMark />
        </div>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
          Loading admin
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return <div className="sb-admin-loading">{content}</div>;
  }

  return content;
}
