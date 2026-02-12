import React from 'react';

interface Props { size?: number }

const Spinner: React.FC<Props> = ({ size = 20 }) => {
  const dim = `${size}px`;
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-transparent"
      style={{ width: dim, height: dim }}
      aria-label="Loading"
    />
  );
};

export default Spinner;
