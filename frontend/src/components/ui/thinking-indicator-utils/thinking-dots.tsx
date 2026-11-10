export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-[#67788A]" aria-hidden="true">
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-30"
        style={{ animation: "bowman-fade-dot 1.4s infinite ease-in-out" }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-30"
        style={{ animation: "bowman-fade-dot 1.4s infinite ease-in-out 0.2s" }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-30"
        style={{ animation: "bowman-fade-dot 1.4s infinite ease-in-out 0.4s" }}
      />
    </span>
  );
}