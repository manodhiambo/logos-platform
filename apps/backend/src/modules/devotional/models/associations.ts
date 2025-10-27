import Devotional from './Devotional.model';
import UserDevotionalProgress from './UserDevotionalProgress.model';
import User from '../../../database/models/user.model';

// Devotional - User (Author) relationship
Devotional.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

User.hasMany(Devotional, {
  foreignKey: 'authorId',
  as: 'devotionals',
});

// UserDevotionalProgress - User relationship
UserDevotionalProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(UserDevotionalProgress, {
  foreignKey: 'userId',
  as: 'devotionalProgress',
});

// UserDevotionalProgress - Devotional relationship
UserDevotionalProgress.belongsTo(Devotional, {
  foreignKey: 'devotionalId',
  as: 'devotional',
});

Devotional.hasMany(UserDevotionalProgress, {
  foreignKey: 'devotionalId',
  as: 'userProgress',
});

export { Devotional, UserDevotionalProgress, User };
