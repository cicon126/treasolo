import request from '../utils/request'

export function getMemberList(keyword) {
  return request.get('/member/list', { params: { keyword } })
}

export function getMember(id) {
  return request.get(`/member/${id}`)
}

export function addMember(data) {
  return request.post('/member', data)
}

export function updateMember(data) {
  return request.put('/member', data)
}

export function deleteMember(id) {
  return request.delete(`/member/${id}`)
}
