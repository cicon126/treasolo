import { Request, Response } from 'express';
import * as bookingService from '../services/bookingService.js';
import {
  ApiResponse,
  Booking,
  CreateBookingRequest,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse
} from '../../../shared/types.js';

export async function getAllBookings(req: Request, res: Response<ApiResponse<Booking[]>>) {
  try {
    const { date, roomId } = req.query;
    const roomIdNum = roomId ? parseInt(roomId as string) : undefined;
    
    const bookings = bookingService.getAllBookings(
      date as string | undefined,
      roomIdNum
    );
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取预约列表失败'
    });
  }
}

export async function getBookingById(req: Request, res: Response<ApiResponse<Booking>>) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: '无效的预约ID'
      });
    }
    
    const booking = bookingService.getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: '预约不存在'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取预约详情失败'
    });
  }
}

export async function getBookingsByRoomAndDate(req: Request, res: Response<ApiResponse<Booking[]>>) {
  try {
    const { roomId, date } = req.query;
    
    if (!roomId || !date) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：roomId 和 date'
      });
    }
    
    const roomIdNum = parseInt(roomId as string);
    if (isNaN(roomIdNum)) {
      return res.status(400).json({
        success: false,
        error: '无效的会议室ID'
      });
    }
    
    const bookings = bookingService.getBookingsByRoomAndDate(roomIdNum, date as string);
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取预约列表失败'
    });
  }
}

export async function checkAvailability(
  req: Request<{}, {}, CheckAvailabilityRequest>,
  res: Response<ApiResponse<CheckAvailabilityResponse>>
) {
  try {
    const params = req.body;
    const result = bookingService.checkAvailability(params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '检查可用性失败'
    });
  }
}

export async function createBooking(
  req: Request<{}, {}, CreateBookingRequest>,
  res: Response<ApiResponse<Booking>>
) {
  try {
    const data = req.body;
    const booking = bookingService.createBooking(data);
    
    res.status(201).json({
      success: true,
      data: booking,
      message: '预约创建成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '创建预约失败'
    });
  }
}

export async function deleteBooking(req: Request, res: Response<ApiResponse<void>>) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: '无效的预约ID'
      });
    }
    
    const deleted = bookingService.deleteBooking(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '预约不存在'
      });
    }
    
    res.json({
      success: true,
      message: '预约取消成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '取消预约失败'
    });
  }
}
