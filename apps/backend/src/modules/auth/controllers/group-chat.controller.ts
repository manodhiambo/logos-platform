import { Request, Response } from 'express';
import GroupChatService from '../services/group-chat.service';

export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const group = await GroupChatService.createGroup(userId, req.body);
    res.status(201).json({
      message: 'Group created successfully',
      data: group,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await GroupChatService.getUserGroups(userId, page, limit);
    res.json({
      message: 'Groups retrieved successfully',
      data: result.groups,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    const group = await GroupChatService.getGroupById(groupId, userId);
    res.json({
      message: 'Group retrieved successfully',
      data: group,
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const { userId: newMemberId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const member = await GroupChatService.addMember(groupId, newMemberId, userId);
    res.status(201).json({
      message: 'Member added successfully',
      data: member,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId, memberId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await GroupChatService.removeMember(groupId, memberId, userId);
    res.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getGroupMembers = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await GroupChatService.getGroupMembers(groupId, page, limit);
    res.json({
      message: 'Members retrieved successfully',
      data: result.members,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getGroupMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await GroupChatService.getGroupMessages(groupId, userId, page, limit);
    res.json({
      message: 'Messages retrieved successfully',
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const group = await GroupChatService.updateGroup(groupId, userId, req.body);
    res.json({
      message: 'Group updated successfully',
      data: group,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await GroupChatService.deleteGroup(groupId, userId);
    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
