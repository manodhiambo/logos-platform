import Notification from './Notification.model';
import NotificationPreferences from './NotificationPreferences.model';
import User from '../../../database/models/user.model';

// Notification - User relationship
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
});

// NotificationPreferences - User relationship
NotificationPreferences.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasOne(NotificationPreferences, {
  foreignKey: 'userId',
  as: 'notificationPreferences',
});

export { Notification, NotificationPreferences, User };
