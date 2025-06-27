export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
      <div className="h-12 w-12 animate-spin text-[#214b7b]">
        <svg className="w-full h-full" viewBox="0 0 50 50">
          <circle
            className="opacity-25"
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 0 0-15-15V5z"
          />
        </svg>
      </div>
      <p className="text-lg font-semibold text-[#214b7b] tracking-wide flex items-center gap-1">
        Sales Protrac
        <span className="dot-animate w-4 text-[#214b7b]">...</span>
      </p>
      <style>{`
        .dot-animate::after {
          content: '.';
          animation: dots 1.5s steps(3, end) infinite;
        }
        @keyframes dots {
          0% { content: '.'; }
          33% { content: '..'; }
          66% { content: '...'; }
          100% { content: '.'; }
        }
      `}</style>
    </div>
  );
}
