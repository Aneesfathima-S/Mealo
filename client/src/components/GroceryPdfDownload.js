import React from 'react';

const GroceryPdfDownload = () => {
  const handleDownload = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('User not authenticated!');
      return;
    }

    try {
      const response = await fetch(`/api/meal/grocery-pdf?token=${token}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'grocery-list.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Failed to download PDF:', error);
      alert('Failed to download PDF.');
    }
  };

  return (
    <button className="btn btn-secondary mb-3" onClick={handleDownload}>
      📥 Download Grocery List (PDF)
    </button>
  );
};

export default GroceryPdfDownload;
