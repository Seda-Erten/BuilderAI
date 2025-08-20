export function BackgroundEffects() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-slate-900/50 to-[#0F172A]" />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute top-40 right-20 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-20 left-40 w-96 h-96 bg-[#F59E0B]/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "4s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/3 w-72 h-72 bg-[#06B6D4]/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "6s" }}
      ></div>
      <div className="absolute top-32 left-32 w-2 h-2 bg-[#6366F1] rounded-full animate-ping" />
      <div
        className="absolute top-60 right-40 w-1 h-1 bg-[#06B6D4] rounded-full animate-ping"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-40 left-60 w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-ping"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}