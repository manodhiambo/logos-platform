import Post from './Post.model';
import Comment from './Comment.model';
import PostLike from './PostLike.model';
import CommentLike from './CommentLike.model';
import User from '../../../database/models/user.model';
import Community from '../../community/models/Community.model';

// Post - User (Author) relationship
Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts',
});

// Post - Community relationship (already defined in community associations)

// Comment - User (Author) relationship
Comment.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

User.hasMany(Comment, {
  foreignKey: 'authorId',
  as: 'comments',
});

// Comment - Post relationship
Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
});

Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments',
});

// Comment - Comment (replies) relationship
Comment.hasMany(Comment, {
  foreignKey: 'parentCommentId',
  as: 'replies',
});

Comment.belongsTo(Comment, {
  foreignKey: 'parentCommentId',
  as: 'parentComment',
});

// PostLike relationships
PostLike.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

PostLike.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
});

// CommentLike relationships
CommentLike.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

CommentLike.belongsTo(Comment, {
  foreignKey: 'commentId',
  as: 'comment',
});

export { Post, Comment, PostLike, CommentLike, User, Community };
