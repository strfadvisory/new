import React from 'react';

const Notifications: React.FC = () => {
  const notifications = [
    { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance on Jan 20, 2024', type: 'info', time: '2 hours ago', read: false },
    { id: 2, title: 'New User Registration', message: 'Sarah Johnson has joined your organization', type: 'success', time: '4 hours ago', read: false },
    { id: 3, title: 'Budget Alert', message: 'Reserve fund budget threshold reached', type: 'warning', time: '1 day ago', read: true },
    { id: 4, title: 'Report Generated', message: 'Monthly financial report is ready', type: 'info', time: '2 days ago', read: true },
    { id: 5, title: 'Security Alert', message: 'Failed login attempt detected', type: 'danger', time: '3 days ago', read: true }
  ];

  const getTypeClass = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'info': 'text-info',
      'success': 'text-success',
      'warning': 'text-warning',
      'danger': 'text-danger'
    };
    return typeMap[type] || 'text-secondary';
  };

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'info': 'fas fa-info-circle',
      'success': 'fas fa-check-circle',
      'warning': 'fas fa-exclamation-triangle',
      'danger': 'fas fa-exclamation-circle'
    };
    return iconMap[type] || 'fas fa-bell';
  };

  return (
    <div className="p-4">
      <h1>Notifications</h1>
      <p>Stay updated with system alerts and important messages.</p>
      
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Recent Notifications</h2>
          <div>
            <button className="btn btn-outline-secondary me-2">Mark All Read</button>
            <button className="btn btn-outline-danger">Clear All</button>
          </div>
        </div>
        
        <div className="list-group">
          {notifications.map(notification => (
            <div key={notification.id} className={`list-group-item ${!notification.read ? 'list-group-item-light border-start border-primary border-3' : ''}`}>
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="d-flex align-items-start">
                  <i className={`${getTypeIcon(notification.type)} ${getTypeClass(notification.type)} me-3 mt-1`}></i>
                  <div>
                    <h5 className="mb-1">{notification.title}</h5>
                    <p className="mb-1">{notification.message}</p>
                  </div>
                </div>
                <div className="text-end">
                  <small className="text-muted">{notification.time}</small>
                  {!notification.read && (
                    <div>
                      <span className="badge bg-primary rounded-pill mt-1">New</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <button className="btn btn-sm btn-outline-primary me-2">View Details</button>
                {!notification.read && (
                  <button className="btn btn-sm btn-outline-secondary">Mark as Read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;