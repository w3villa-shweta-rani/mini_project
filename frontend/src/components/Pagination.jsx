const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit, hasNext, hasPrev } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Count info */}
      <p className="text-sm text-gray-400">
        Showing <span className="text-white font-medium">{start}–{end}</span> of{' '}
        <span className="text-white font-medium">{total}</span> users
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            hasPrev
              ? 'text-gray-300 border-white/10 hover:bg-white/5 hover:text-white'
              : 'text-gray-600 border-white/5 cursor-not-allowed'
          }`}
        >
          ← Prev
        </button>

        {/* First page if not in range */}
        {getPageNumbers()[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-gray-300 hover:bg-white/5">
              1
            </button>
            {getPageNumbers()[0] > 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Page numbers */}
        {getPageNumbers().map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium ${
              p === page
                ? 'text-white border-primary/50'
                : 'text-gray-300 border-white/10 hover:bg-white/5 hover:text-white'
            }`}
            style={p === page ? { background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(245,0,87,0.2))' } : {}}
          >
            {p}
          </button>
        ))}

        {/* Last page if not in range */}
        {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
          <>
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button onClick={() => onPageChange(totalPages)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-gray-300 hover:bg-white/5">
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            hasNext
              ? 'text-gray-300 border-white/10 hover:bg-white/5 hover:text-white'
              : 'text-gray-600 border-white/5 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
