import VideoCall from './VideoCall.model';
import CallParticipant from './CallParticipant.model';
import User from '../../../database/models/user.model';

// VideoCall associations
VideoCall.belongsTo(User, { foreignKey: 'hostId', as: 'host' });
VideoCall.hasMany(CallParticipant, { foreignKey: 'callId', as: 'participants' });

// CallParticipant associations
CallParticipant.belongsTo(VideoCall, { foreignKey: 'callId', as: 'call' });
CallParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { VideoCall, CallParticipant };
