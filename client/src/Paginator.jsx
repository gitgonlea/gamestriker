import React from 'react';

const Paginator = ({ totalPages, currentPage, handlePageChange }) => (
  <div className="paginator">
    {totalPages > 1 && (
      <>
        {currentPage - 1 !== 1 && currentPage - 2 !== 1 && currentPage !== 1 && (
          <div className="page-btn" onClick={() => handlePageChange(1)}>1</div>
        )}
        {currentPage > 4 && <div className="separator">...</div>}
        {Array.from({ length: totalPages }, (_, i) => {
          if (
            i + 1 === currentPage || 
            i + 1 === currentPage - 1 || 
            i + 1 === currentPage + 1 ||
            i + 1 === currentPage - 2 ||
            i + 1 === currentPage + 2
          ) {
            return (
              <div
                className={`page-btn ${i + 1 === currentPage ? 'active' : ''}`}
                key={i}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </div>
            );
          } else {
            return null;
          }
        })}
        {currentPage < totalPages && (
          <>
            {currentPage < totalPages - 1 && currentPage < totalPages - 2 && (
              <>
                { totalPages > 4 &&
                  <div className="separator">...</div>
                }
                
                <div className="page-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</div>
              </>
            )}
          </>
        )}
      </>
    )}
  </div>
);

export default Paginator;
