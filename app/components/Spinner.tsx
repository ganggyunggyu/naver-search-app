export default function Spinner({ size = 20 }: { size?: number }) {
  const dim = `${size}px`;
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-transparent"
      style={{ width: dim, height: dim }}
      aria-label="Loading"
    />
  );
}

