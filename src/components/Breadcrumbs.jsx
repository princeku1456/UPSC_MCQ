import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="container mt-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-transparent p-0 m-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={`${item.label}-${index}`}
                className={`breadcrumb-item ${isLast ? 'active text-truncate' : ''}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {isLast ? item.label : <Link to={item.to}>{item.label}</Link>}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
