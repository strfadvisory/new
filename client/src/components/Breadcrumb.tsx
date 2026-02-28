import React from 'react';

interface BreadcrumbItem {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="breadcrumb-wrapper">
      <div className="breadcrumb">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <span 
              className={item.active ? 'active' : item.onClick ? 'clickable' : ''}
              onClick={item.onClick}
              style={item.onClick ? { cursor: 'pointer' } : undefined}
            >
              {item.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;
