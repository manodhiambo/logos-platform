import PrayerRequest from './PrayerRequest.model';
import Prayer from './Prayer.model';
import User from '../../../database/models/user.model';

// PrayerRequest - User relationship
PrayerRequest.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

User.hasMany(PrayerRequest, {
  foreignKey: 'userId',
  as: 'prayerRequests',
});

// PrayerRequest - Prayer relationship
PrayerRequest.hasMany(Prayer, {
  foreignKey: 'prayerRequestId',
  as: 'prayers',
});

Prayer.belongsTo(PrayerRequest, {
  foreignKey: 'prayerRequestId',
  as: 'prayerRequest',
});

// Prayer - User relationship
Prayer.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Prayer, {
  foreignKey: 'userId',
  as: 'prayers',
});

export { PrayerRequest, Prayer, User };
