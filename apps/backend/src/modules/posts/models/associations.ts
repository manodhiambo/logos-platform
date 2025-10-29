import Post from './Post.model';
import Comment from './Comment.model';
import PostLike from './PostLike.model';
import CommentLike from './CommentLike.model';
import User from '../../../database/models/user.model';
import Community from '../../community/models/Community.model';

// Post - User (Author) relationship
Post.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author',
});

User.hasMany(Post, {
  foreignKey: 'author_id',
  as: 'posts',
});

// Post - Community relationship
Post.belongsTo(Community, {
  foreignKey: 'community_id',
  as: 'community',
});

Community.hasMany(Post, {
  foreignKey: 'community_id',
  as: 'posts',
});

// Comment - User (Author) relationship
Comment.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author',
});

User.hasMany(Comment, {
  foreignKey: 'author_id',
  as: 'comments',
});

// Comment - Post relationship
Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post',
});

Post.hasMany(Comment, {
  foreignKey: 'post_id',
  as: 'comments',
});

// Comment - Comment (replies) relationship
Comment.hasMany(Comment, {
  foreignKey: 'parent_comment_id',
  as: 'replies',
});

Comment.belongsTo(Comment, {
  foreignKey: 'parent_comment_id',
  as: 'parentComment',
});

// PostLike relationships
PostLike.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

PostLike.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post',
});

// CommentLike relationships
CommentLike.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

CommentLike.belongsTo(Comment, {
  foreignKey: 'comment_id',
  as: 'comment',
});

export { Post, Comment, PostLike, CommentLike, User, Community };
