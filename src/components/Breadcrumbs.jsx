import { useApp } from '../context/AppContext.jsx';

export default function Breadcrumbs() {
  const { breadcrumbs } = useApp();

  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <div className="container mt-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-transparent p-0 m-0">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={index} className={`breadcrumb-item${isLast ? ' active text-truncate' : ''}`} aria-current={isLast ? 'page' : undefined}>
                {isLast ? (
                  item.label
                ) : (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.action) item.action();
                    }}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
