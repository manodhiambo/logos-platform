import VideoCall, { CallType, CallStatus, CallPurpose } from '../models/VideoCall.model';
import CallParticipant, { ParticipantRole } from '../models/CallParticipant.model';
import User from '../../../database/models/user.model';
import agoraTokenService from './agora-token.service';
import { Op } from 'sequelize';
import crypto from 'crypto';

class VideoCallService {
  /**
   * Create a new video call
   */
  async createCall(
    hostId: string,
    data: {
      title: string;
      description?: string;
      type: CallType;
      purpose: CallPurpose;
      scheduledAt?: Date;
      maxParticipants?: number;
      relatedTo?: string;
      relatedType?: string;
    }
  ) {
    // Generate unique channel name
    const channelName = `logos_${crypto.randomBytes(16).toString('hex')}`;

    const call = await VideoCall.create({
      channelName,
      hostId,
      title: data.title,
      description: data.description,
      type: data.type,
      purpose: data.purpose,
      scheduledAt: data.scheduledAt,
      maxParticipants: data.maxParticipants || 50,
      relatedTo: data.relatedTo,
      relatedType: data.relatedType,
      status: data.scheduledAt ? CallStatus.SCHEDULED : CallStatus.ONGOING,
      isRecording: false,
    });

    // Add host as participant
    await CallParticipant.create({
      callId: call.id,
      userId: hostId,
      role: ParticipantRole.HOST,
      isMuted: false,
      isVideoOff: false,
    });

    return call;
  }

  /**
   * Join a call
   */
  async joinCall(callId: string, userId: string) {
    const call = await VideoCall.findByPk(callId);

    if (!call) {
      throw new Error('Call not found');
    }

    if (call.status === CallStatus.ENDED) {
      throw new Error('This call has ended');
    }

    if (call.status === CallStatus.CANCELLED) {
      throw new Error('This call has been cancelled');
    }

    // Check if already a participant
    let participant = await CallParticipant.findOne({
      where: { callId, userId },
    });

    if (!participant) {
      // Check max participants
      const participantCount = await CallParticipant.count({
        where: { callId },
      });

      if (participantCount >= call.maxParticipants) {
        throw new Error('Call has reached maximum participants');
      }

      // Add as new participant
      participant = await CallParticipant.create({
        callId,
        userId,
        role: ParticipantRole.PARTICIPANT,
        joinedAt: new Date(),
        isMuted: false,
        isVideoOff: false,
      });
    } else {
      // Update join time - use undefined instead of null
      await participant.update({
        joinedAt: new Date(),
        leftAt: undefined,
      });
    }

    // Update call status if scheduled
    if (call.status === CallStatus.SCHEDULED && !call.startedAt) {
      await call.update({
        status: CallStatus.ONGOING,
        startedAt: new Date(),
      });
    }

    // Generate Agora token
    const uid = parseInt(userId.replace(/-/g, '').substring(0, 10), 16);
    const token = agoraTokenService.generateRtcToken(call.channelName, uid, 'publisher');
    const appId = agoraTokenService.getAppId();

    return {
      call,
      participant,
      token,
      appId,
      channelName: call.channelName,
      uid,
    };
  }

  /**
   * Leave a call
   */
  async leaveCall(callId: string, userId: string) {
    const participant = await CallParticipant.findOne({
      where: { callId, userId },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    const leftAt = new Date();
    const joinedAt = participant.joinedAt || participant.createdAt;
    const duration = Math.floor((leftAt.getTime() - joinedAt.getTime()) / 1000);

    await participant.update({
      leftAt,
      duration,
    });

    // Check if host left
    const call = await VideoCall.findByPk(callId);
    if (call && call.hostId === userId) {
      // End the call if host leaves
      await this.endCall(callId, userId);
    }

    return participant;
  }

  /**
   * End a call
   */
  async endCall(callId: string, userId: string) {
    const call = await VideoCall.findByPk(callId);

    if (!call) {
      throw new Error('Call not found');
    }

    if (call.hostId !== userId) {
      throw new Error('Only the host can end the call');
    }

    await call.update({
      status: CallStatus.ENDED,
      endedAt: new Date(),
    });

    return call;
  }

  /**
   * Get call details
   */
  async getCallById(callId: string) {
    const call = await VideoCall.findByPk(callId, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'fullName', 'username', 'avatarUrl'],
        },
      ],
    });

    if (!call) {
      throw new Error('Call not found');
    }

    const participants = await CallParticipant.findAll({
      where: { callId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'username', 'avatarUrl'],
        },
      ],
    });

    return {
      call,
      participants,
    };
  }

  /**
   * Get active calls
   */
  async getActiveCalls(filters?: {
    purpose?: CallPurpose;
    relatedTo?: string;
    relatedType?: string;
  }) {
    const where: any = {
      status: CallStatus.ONGOING,
    };

    if (filters?.purpose) {
      where.purpose = filters.purpose;
    }

    if (filters?.relatedTo) {
      where.relatedTo = filters.relatedTo;
    }

    if (filters?.relatedType) {
      where.relatedType = filters.relatedType;
    }

    const calls = await VideoCall.findAll({
      where,
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'fullName', 'username', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return calls;
  }

  /**
   * Get scheduled calls
   */
  async getScheduledCalls(userId?: string) {
    const where: any = {
      status: CallStatus.SCHEDULED,
      scheduledAt: { [Op.gte]: new Date() },
    };

    if (userId) {
      // Get calls where user is host or participant
      const participantCalls = await CallParticipant.findAll({
        where: { userId },
        attributes: ['callId'],
      });

      const callIds = participantCalls.map((p) => p.callId);

      where[Op.or] = [{ hostId: userId }, { id: { [Op.in]: callIds } }];
    }

    const calls = await VideoCall.findAll({
      where,
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'fullName', 'username', 'avatarUrl'],
        },
      ],
      order: [['scheduledAt', 'ASC']],
    });

    return calls;
  }

  /**
   * Get user's call history
   */
  async getUserCallHistory(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const participantCalls = await CallParticipant.findAll({
      where: { userId },
      attributes: ['callId'],
    });

    const callIds = participantCalls.map((p) => p.callId);

    const { rows: calls, count } = await VideoCall.findAndCountAll({
      where: {
        [Op.or]: [{ hostId: userId }, { id: { [Op.in]: callIds } }],
        status: { [Op.in]: [CallStatus.ENDED, CallStatus.CANCELLED] },
      },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'fullName', 'username', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      calls,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update participant status (mute/video)
   */
  async updateParticipantStatus(callId: string, userId: string, updates: any) {
    const participant = await CallParticipant.findOne({
      where: { callId, userId },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    await participant.update(updates);
    return participant;
  }
}

export default new VideoCallService();
