import request from '../utils/request'

export function getBorrowList(status) {
  return request.get('/borrow/list', { params: { status } })
}

export function getBorrowByMember(memberId) {
  return request.get(`/borrow/member/${memberId}`)
}

export function getBorrowingByMember(memberId) {
  return request.get(`/borrow/member/${memberId}/borrowing`)
}

export function borrowBook(data) {
  return request.post('/borrow', data)
}

export function returnBook(id) {
  return request.put(`/borrow/return/${id}`)
}
