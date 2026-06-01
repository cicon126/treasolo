import request from '../utils/request'

export function login(data) {
  return request.post('/admin/login', data)
}

export function initAdmin() {
  return request.post('/admin/init')
}
