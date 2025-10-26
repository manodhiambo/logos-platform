import AIConversation from './AIConversation.model';
import AIMessage from './AIMessage.model';
import User from '../../../database/models/user.model';

// AIConversation - User relationship
AIConversation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(AIConversation, {
  foreignKey: 'userId',
  as: 'aiConversations',
});

// AIConversation - AIMessage relationship
AIConversation.hasMany(AIMessage, {
  foreignKey: 'conversationId',
  as: 'messages',
});

AIMessage.belongsTo(AIConversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

export { AIConversation, AIMessage, User };
