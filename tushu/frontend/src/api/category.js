import request from '../utils/request'

export function getCategoryList(name) {
  return request.get('/category/list', { params: { name } })
}

export function getCategory(id) {
  return request.get(`/category/${id}`)
}

export function addCategory(data) {
  return request.post('/category', data)
}

export function updateCategory(data) {
  return request.put('/category', data)
}

export function deleteCategory(id) {
  return request.delete(`/category/${id}`)
}
