import { Request, Response } from 'express';
import * as roomService from '../services/roomService.js';
import { ApiResponse, Room, CreateRoomRequest, UpdateRoomRequest } from '../../../shared/types.js';

export async function getAllRooms(req: Request, res: Response<ApiResponse<Room[]>>) {
  try {
    const rooms = roomService.getAllRooms();
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取会议室列表失败'
    });
  }
}

export async function getRoomById(req: Request, res: Response<ApiResponse<Room>>) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: '无效的会议室ID'
      });
    }
    
    const room = roomService.getRoomById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: '会议室不存在'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取会议室详情失败'
    });
  }
}

export async function createRoom(req: Request<{}, {}, CreateRoomRequest>, res: Response<ApiResponse<Room>>) {
  try {
    const data = req.body;
    const room = roomService.createRoom(data);
    
    res.status(201).json({
      success: true,
      data: room,
      message: '会议室创建成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '创建会议室失败'
    });
  }
}

export async function updateRoom(req: Request<{ id: string }, {}, UpdateRoomRequest>, res: Response<ApiResponse<Room>>) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: '无效的会议室ID'
      });
    }
    
    const data = req.body;
    const room = roomService.updateRoom(id, data);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: '会议室不存在'
      });
    }
    
    res.json({
      success: true,
      data: room,
      message: '会议室更新成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '更新会议室失败'
    });
  }
}

export async function deleteRoom(req: Request, res: Response<ApiResponse<void>>) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: '无效的会议室ID'
      });
    }
    
    const deleted = roomService.deleteRoom(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '会议室不存在'
      });
    }
    
    res.json({
      success: true,
      message: '会议室删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除会议室失败'
    });
  }
}
