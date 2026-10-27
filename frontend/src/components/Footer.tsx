import React from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>&copy; {CURRENT_YEAR} Merkatara. All rights reserved.</p>
    </footer>
  );
};
