import Community from './Community.model';
import CommunityMember from './CommunityMember.model';
import User from '../../../database/models/user.model';

// Community - User (Creator) relationship
Community.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

User.hasMany(Community, {
  foreignKey: 'createdBy',
  as: 'createdCommunities',
});

// Community - CommunityMember relationship
Community.hasMany(CommunityMember, {
  foreignKey: 'communityId',
  as: 'members',
});

CommunityMember.belongsTo(Community, {
  foreignKey: 'communityId',
  as: 'community',
});

// User - CommunityMember relationship
User.hasMany(CommunityMember, {
  foreignKey: 'userId',
  as: 'communityMemberships',
});

CommunityMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export { Community, CommunityMember, User };
