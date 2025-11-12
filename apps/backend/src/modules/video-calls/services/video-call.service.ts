import VideoCall from '../models/VideoCall.model';
import CallParticipant from '../models/CallParticipant.model';
import User from '../../../database/models/user.model';
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
        createdBy: hostId, // Changed from hostId
        type: callData.type || 'group',
        purpose: callData.purpose || 'general',
        status: callData.scheduledAt ? 'scheduled' as any : 'active' as any,
        title: callData.title,
        description: callData.description,
        scheduledAt: callData.scheduledAt,
        maxParticipants: callData.maxParticipants || 50,
        isRecording: false,
        relatedTo: callData.relatedTo,
        relatedType: callData.relatedType,
      });

      await CallParticipant.create({
        callId: call.id,
        userId: hostId,
        role: 'host' as any,
        joinedAt: callData.scheduledAt ? undefined : new Date(),
        isMuted: false,
        isVideoOff: false,
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

      let participant = await CallParticipant.findOne({
        where: { callId, userId }
      });

      if (!participant) {
        const participantCount = await CallParticipant.count({
          where: { callId }
        });

        if (participantCount >= call.maxParticipants) {
          throw new Error('Call is full');
        }

        participant = await CallParticipant.create({
          callId,
          userId,
          role: 'participant' as any,
          joinedAt: new Date(),
          isMuted: false,
          isVideoOff: false,
        });
      }

      if (call.status === 'scheduled') {
        await call.update({
          status: 'active' as any,
          startedAt: new Date()
        });
      }

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

  async getActiveParticipantCount(callId: string): Promise<number> {
    try {
      const result = await sequelize.query(
        `SELECT COUNT(*) as count FROM call_participants
         WHERE call_id = :callId AND left_at IS NULL`,
        {
          replacements: { callId },
          type: QueryTypes.SELECT
        }
      ) as any[];

      return parseInt(result[0]?.count || '0');
    } catch (error) {
      console.error('Error counting active participants:', error);
      return 0;
    }
  }

  async getActiveCalls(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: calls, count } = await VideoCall.findAndCountAll({
      where: { status: 'active' as any },
      include: [
        {
          model: User,
          as: 'creator', // Changed from 'host'
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }
      ],
      limit,
      offset,
      order: [['startedAt', 'DESC']],
    });

    for (const call of calls) {
      const participantCount = await this.getActiveParticipantCount(call.id);
      (call as any).participantCount = participantCount;
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
      where: { status: 'scheduled' as any },
      include: [
        {
          model: User,
          as: 'creator', // Changed from 'host'
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
              as: 'creator', // Changed from 'host'
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
      calls: participants.map(p => (p as any).call),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalCalls: count,
        limit,
      },
    };
  }

  async getCallById(callId: string) {
    const call = await VideoCall.findByPk(callId, {
      include: [
        {
          model: User,
          as: 'creator', // Changed from 'host'
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }
      ]
    });

    if (call) {
      const participantCount = await this.getActiveParticipantCount(call.id);
      (call as any).participantCount = participantCount;

      const participants = await CallParticipant.findAll({
        where: {
          callId: call.id,
          leftAt: { [Op.is]: null } as any
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName', 'avatarUrl'],
          }
        ]
      });
      (call as any).participants = participants;
    }

    return call;
  }

  async endCall(callId: string, userId: string) {
    const call = await VideoCall.findByPk(callId);
    if (!call) throw new Error('Call not found');
    if (call.createdBy !== userId) throw new Error('Only host can end call'); // Changed from hostId

    await call.update({ status: 'ended' as any, endedAt: new Date() });

    await CallParticipant.update(
      {
        leftAt: new Date(),
        duration: sequelize.literal('EXTRACT(EPOCH FROM (NOW() - joined_at))::INTEGER')
      },
      {
        where: {
          callId,
          leftAt: { [Op.is]: null } as any
        } as any
      }
    );

    return call;
  }

  async updateParticipantStatus(callId: string, userId: string, updates: { isMuted?: boolean; isVideoOff?: boolean }) {
    const participant = await CallParticipant.findOne({
      where: { callId, userId }
    });

    if (!participant) {
      throw new Error('Participant not found in call');
    }

    await participant.update(updates);
    return participant;
  }

  async getCallParticipants(callId: string) {
    const participants = await CallParticipant.findAll({
      where: {
        callId,
        leftAt: { [Op.is]: null } as any
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }
      ],
      order: [['joinedAt', 'ASC']]
    });

    return participants;
  }
}

export default new VideoCallService();
