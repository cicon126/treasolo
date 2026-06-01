import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Monitor,
  X,
  Check,
  Loader2,
  Search
} from 'lucide-react';
import Modal from '../components/Modal.js';
import { useRoomStore } from '../store/useRoomStore.js';
import { Room, CreateRoomRequest, UpdateRoomRequest } from '../../shared/types.js';

const equipmentOptions = [
  '投影仪',
  '白板',
  '视频会议系统',
  '音响系统',
  '电视屏幕',
  '专业音响',
  '录音设备',
  '电话会议系统'
];

export default function Admin() {
  const { rooms, fetchRooms, createRoom, updateRoom, deleteRoom, loading } = useRoomStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<CreateRoomRequest>({
    name: '',
    capacity: 10,
    location: '',
    equipment: [],
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      capacity: 10,
      location: '',
      equipment: [],
      description: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      equipment: [...room.equipment],
      description: room.description || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入会议室名称';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = '请输入会议室位置';
    }
    
    if (formData.capacity < 1) {
      newErrors.capacity = '容纳人数必须大于0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData as UpdateRoomRequest);
        toast.success('会议室更新成功');
      } else {
        await createRoom(formData);
        toast.success('会议室创建成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('操作失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRoom(id);
      toast.success('会议室删除成功');
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('删除失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      });
    }
  };

  const toggleEquipment = (eq: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter(e => e !== eq)
        : [...prev.equipment, eq]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">会议室管理</h2>
            <p className="text-slate-600">管理所有会议室信息</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索会议室..."
                className="bg-transparent border-none outline-none text-slate-700 w-48"
              />
            </div>
            
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              添加会议室
            </button>
          </div>
        </div>

        {loading && filteredRooms.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Monitor className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {searchQuery ? '未找到匹配的会议室' : '暂无会议室'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery ? '请尝试其他搜索关键词' : '点击上方按钮添加第一个会议室'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">会议室名称</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">位置</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">容纳人数</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">设备</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room, index) => (
                  <tr
                    key={room.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-slate-800">{room.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {room.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        {room.capacity} 人
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {room.equipment.slice(0, 3).map(eq => (
                          <span
                            key={eq}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg"
                          >
                            {eq}
                          </span>
                        ))}
                        {room.equipment.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                            +{room.equipment.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {deleteConfirmId === room.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(room.id)}
                              className="p-2 text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                              title="确认删除"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-2 text-white bg-slate-400 hover:bg-slate-500 rounded-lg transition-colors"
                              title="取消"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(room.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          共 {filteredRooms.length} 个会议室
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? '编辑会议室' : '添加会议室'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                会议室名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入会议室名称"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                  ${errors.name
                    ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                    : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/50'
                  }
                  focus:outline-none
                `}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-rose-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                位置 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="例如：A座3楼301"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                  ${errors.location
                    ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                    : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/50'
                  }
                  focus:outline-none
                `}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-rose-500">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                容纳人数 <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                min={1}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                  ${errors.capacity
                    ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                    : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/50'
                  }
                  focus:outline-none
                `}
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-rose-500">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                描述
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="会议室描述（可选）"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:bg-blue-50/50 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              配备设备
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {equipmentOptions.map(eq => {
                const selected = formData.equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300
                      ${selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }
                    `}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">{eq}</span>
                    {selected && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {editingRoom ? '更新' : '创建'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
