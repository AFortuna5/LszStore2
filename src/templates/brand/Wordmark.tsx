type WordmarkProps = {
  className?: string;
};

export default function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      aria-label="LSZ Store"
      className={`inline-flex items-baseline whitespace-nowrap font-montserrat font-black not-italic tracking-[-0.08em] text-black ${className}`}
    >
      <span aria-hidden="true">
        LSZ <span className="text-neon-blue">STORE.</span>
      </span>
    </span>
  );
}
