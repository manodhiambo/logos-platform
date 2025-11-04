import VideoCall from '../models/VideoCall.model';
import CallParticipant from '../models/CallParticipant.model';
import User from '../../../database/models/user.model';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

class VideoCallService {
  private appId: string;
  private appCertificate: string;

  constructor() {
    this.appId = process.env.AGORA_APP_ID || '';
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE || '';
  }

  generateAgoraToken(channelName: string, uid: number, role: 'publisher' | 'subscriber' = 'publisher') {
    if (!this.appId || !this.appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + 3600; // 1 hour

    const tokenRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      tokenRole,
      privilegeExpireTime
    );

    return token;
  }

  async createCall(hostId: string, callData: any) {
    try {
      // Generate unique channel name
      const channelName = `logos_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const call = await VideoCall.create({
        channelName,
        hostId,
        type: callData.type || 'group',
        purpose: callData.purpose || 'general',
        status: callData.scheduledAt ? 'scheduled' : 'ongoing',
        title: callData.title,
        description: callData.description,
        scheduledAt: callData.scheduledAt,
        maxParticipants: callData.maxParticipants || 50,
        isRecording: false,
        relatedTo: callData.relatedTo,
        relatedType: callData.relatedType,
      });

      // Add host as participant
      await CallParticipant.create({
        callId: call.id,
        userId: hostId,
        role: 'host',
        joinedAt: callData.scheduledAt ? null : new Date(),
      });

      return call;
    } catch (error) {
      throw error;
    }
  }

  async joinCall(callId: string, userId: string) {
    try {
      const call = await VideoCall.findByPk(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      if (call.status === 'ended') {
        throw new Error('Call has ended');
      }

      // Check if already in call
      let participant = await CallParticipant.findOne({
        where: { callId, userId }
      });

      if (!participant) {
        // Check max participants
        const participantCount = await CallParticipant.count({
          where: { callId }
        });

        if (participantCount >= call.maxParticipants) {
          throw new Error('Call is full');
        }

        // Add participant
        participant = await CallParticipant.create({
          callId,
          userId,
          role: 'participant',
          joinedAt: new Date(),
        });
      }

      // Update call status to ongoing if it was scheduled
      if (call.status === 'scheduled') {
        await call.update({ 
          status: 'ongoing',
          startedAt: new Date()
        });
      }

      // Generate Agora token
      const uid = Math.floor(Math.random() * 1000000000);
      const token = this.generateAgoraToken(call.channelName, uid, 'publisher');

      return {
        call,
        participant,
        token,
        channelName: call.channelName,
        uid,
        appId: this.appId,
      };
    } catch (error) {
      throw error;
    }
  }

  async leaveCall(callId: string, userId: string) {
    try {
      const participant = await CallParticipant.findOne({
        where: { callId, userId }
      });

      if (!participant) {
        throw new Error('Participant not found');
      }

      const leftAt = new Date();
      const duration = participant.joinedAt 
        ? Math.floor((leftAt.getTime() - participant.joinedAt.getTime()) / 1000)
        : 0;

      await participant.update({
        leftAt,
        duration,
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getActiveCalls(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: calls, count } = await VideoCall.findAndCountAll({
      where: { status: 'ongoing' },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }
      ],
      limit,
      offset,
      order: [['startedAt', 'DESC']],
    });

    // Get participant count for each call
    for (const call of calls) {
      const participantCount = await CallParticipant.count({
        where: { callId: call.id, leftAt: null }
      });
      (call as any).dataValues.participantCount = participantCount;
    }

    return {
      calls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalCalls: count,
        limit,
      },
    };
  }

  async getScheduledCalls(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: calls, count } = await VideoCall.findAndCountAll({
      where: { status: 'scheduled' },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }
      ],
      limit,
      offset,
      order: [['scheduledAt', 'ASC']],
    });

    return {
      calls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalCalls: count,
        limit,
      },
    };
  }

  async getCallHistory(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: participants, count } = await CallParticipant.findAndCountAll({
      where: { userId },
      include: [
        {
          model: VideoCall,
          as: 'call',
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'username', 'fullName'],
            }
          ],
        }
      ],
      limit,
      offset,
      order: [['joinedAt', 'DESC']],
    });

    return {
      calls: participants.map(p => p.dataValues.call),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalCalls: count,
        limit,
      },
    };
  }
}

export default new VideoCallService();
