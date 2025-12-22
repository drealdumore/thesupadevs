
export default function Loading() {
  return (
    <div className="initial-loader h-dvh select-none flex items-center justify-center">
      <div className="relative">
        {/* Base text with low opacity */}
        <div
          className="relative z-10 text-[2.5rem] md:text-5xl font-bold tracking-wider opacity-30 select-none"
          style={{
            color: "var(--text)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-20 w-20"
          >
            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
          </svg>
        </div>

        <div className="imgloading-container absolute inset-0 bottom-0 z-30 overflow-hidden">
          <div
            className="absolute bottom-0 text-[2.5rem] md:text-5xl font-bold tracking-wider select-none"
            style={{
              color: "var(--text)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-20 w-20"
            >
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
