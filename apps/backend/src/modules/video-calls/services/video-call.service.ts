import { VideoCall, CallParticipant } from '../models';
import User from '../../../database/models/user.model';
import { CallStatus, CallType, CallPurpose } from '../models/VideoCall.model';
import { ParticipantRole } from '../models/CallParticipant.model';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../../../config/database.config';

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
    const privilegeExpireTime = currentTime + 3600;
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
      const channelName = `logos_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const call = await VideoCall.create({
        channelName,
        createdBy: hostId,
        type: callData.type || CallType.GROUP,
        purpose: callData.purpose || CallPurpose.GENERAL,
        status: callData.scheduledAt ? CallStatus.SCHEDULED : CallStatus.ONGOING,
        title: callData.title,
        description: callData.description,
        scheduledAt: callData.scheduledAt,
        maxParticipants: callData.maxParticipants || 50,
        isRecording: false,
        relatedTo: callData.relatedTo,
        relatedType: callData.relatedType,
      });

      // Add host as participant
      const participant = await CallParticipant.create({
        callId: call.id,
        userId: hostId,
        role: ParticipantRole.HOST,
        joinedAt: new Date(),
        isMuted: false,
        isVideoOff: false,
      });

      // Generate token and uid for host
      const uid = parseInt(hostId.replace(/-/g, '').substring(0, 8), 16);
      const token = this.generateAgoraToken(channelName, uid);

      return {
        call: await this.getCallById(call.id, hostId),
        participant,
        token,
        appId: this.appId,
        channelName,
        uid,
      };
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  async getCallById(callId: string, userId?: string) {
    const call = await VideoCall.findByPk(callId, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
        {
          model: CallParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'avatarUrl'],
            },
          ],
        },
      ],
    });

    if (!call) {
      throw new Error('Call not found');
    }

    return call;
  }

  async joinCall(callId: string, userId: string) {
    const call = await VideoCall.findByPk(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    // Check if user already joined
    let participant = await CallParticipant.findOne({
      where: { callId, userId },
    });

    if (!participant) {
      participant = await CallParticipant.create({
        callId,
        userId,
        role: ParticipantRole.PARTICIPANT,
        joinedAt: new Date(),
        isMuted: false,
        isVideoOff: false,
      });
    }

    // Generate token and uid
    const uid = parseInt(userId.replace(/-/g, '').substring(0, 8), 16);
    const token = this.generateAgoraToken(call.channelName, uid);

    return {
      call: await this.getCallById(callId, userId),
      participant,
      token,
      appId: this.appId,
      channelName: call.channelName,
      uid,
    };
  }

  async leaveCall(callId: string, userId: string) {
    const participant = await CallParticipant.findOne({
      where: { callId, userId },
    });

    if (participant && !participant.leftAt) {
      const joinedAt = participant.joinedAt || new Date();
      const duration = Math.floor((Date.now() - joinedAt.getTime()) / 1000);

      await participant.update({
        leftAt: new Date(),
        duration,
      });
    }

    // Check if host left
    const call = await VideoCall.findByPk(callId);
    if (call && call.createdBy === userId) {
      await call.update({ status: CallStatus.ENDED, endedAt: new Date() });
    }
  }

  async getActiveCalls(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: calls, count: total } = await VideoCall.findAndCountAll({
      where: {
        status: CallStatus.ONGOING,
      },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
        {
          model: CallParticipant,
          as: 'participants',
        },
      ],
      order: [['startedAt', 'DESC']],
      limit,
      offset,
    });

    return {
      calls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getScheduledCalls(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: calls, count: total } = await VideoCall.findAndCountAll({
      where: {
        status: CallStatus.SCHEDULED,
        scheduledAt: {
          [Op.gte]: new Date(),
        },
      },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
      order: [['scheduledAt', 'ASC']],
      limit,
      offset,
    });

    return {
      calls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCallHistory(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: participants, count: total } = await CallParticipant.findAndCountAll({
      where: { userId },
      include: [
        {
          model: VideoCall,
          as: 'call',
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'fullName', 'avatarUrl'],
            },
          ],
        },
      ],
      order: [['joinedAt', 'DESC']],
      limit,
      offset,
    });

    return {
      history: participants.map((p: any) => ({
        ...p.toJSON(),
        call: p.get('call'),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async startCall(callId: string, hostId: string) {
    const call = await VideoCall.findByPk(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    if (call.createdBy !== hostId) {
      throw new Error('Only the host can start the call');
    }

    await call.update({
      status: CallStatus.ONGOING,
      startedAt: new Date(),
    });

    return this.getCallById(callId, hostId);
  }

  async endCall(callId: string, hostId: string) {
    const call = await VideoCall.findByPk(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    if (call.createdBy !== hostId) {
      throw new Error('Only the host can end the call');
    }

    await call.update({
      status: CallStatus.ENDED,
      endedAt: new Date(),
    });

    // Update all participants who haven't left
    await CallParticipant.update(
      {
        leftAt: new Date(),
      },
      {
        where: {
          callId,
          leftAt: null,
        },
      }
    );

    return this.getCallById(callId, hostId);
  }
}

export default new VideoCallService();
