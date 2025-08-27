// --- client/src/components/Header.js ---
import React from 'react';

const Header = ({ title }) => {
  return (
    <h2 style={{ marginTop: '30px', fontWeight: 'bold', color: '#333' }}>
      {title}
    </h2>
  );
};

export default Header;
