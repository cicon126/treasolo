import * as roomRepository from '../repositories/roomRepository.js';
import { Room, CreateRoomRequest, UpdateRoomRequest } from '../../../shared/types.js';

export function getAllRooms(): Room[] {
  return roomRepository.findAll();
}

export function getRoomById(id: number): Room | null {
  return roomRepository.findById(id);
}

export function createRoom(data: CreateRoomRequest): Room {
  if (!data.name || !data.name.trim()) {
    throw new Error('会议室名称不能为空');
  }
  
  if (!data.capacity || data.capacity <= 0) {
    throw new Error('容纳人数必须大于0');
  }
  
  if (!data.location || !data.location.trim()) {
    throw new Error('会议室位置不能为空');
  }
  
  if (roomRepository.existsByName(data.name.trim())) {
    throw new Error('会议室名称已存在');
  }
  
  return roomRepository.create({
    ...data,
    name: data.name.trim(),
    location: data.location.trim(),
    equipment: data.equipment || []
  });
}

export function updateRoom(id: number, data: UpdateRoomRequest): Room | null {
  const existingRoom = roomRepository.findById(id);
  if (!existingRoom) {
    return null;
  }
  
  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error('会议室名称不能为空');
    }
    if (roomRepository.existsByName(trimmedName, id)) {
      throw new Error('会议室名称已存在');
    }
    data.name = trimmedName;
  }
  
  if (data.capacity !== undefined && data.capacity <= 0) {
    throw new Error('容纳人数必须大于0');
  }
  
  if (data.location !== undefined) {
    const trimmedLocation = data.location.trim();
    if (!trimmedLocation) {
      throw new Error('会议室位置不能为空');
    }
    data.location = trimmedLocation;
  }
  
  return roomRepository.update(id, data);
}

export function deleteRoom(id: number): boolean {
  return roomRepository.remove(id);
}
