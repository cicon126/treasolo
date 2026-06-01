import request from '../utils/request'

export function getBookList(keyword) {
  return request.get('/book/list', { params: { keyword } })
}

export function getBooksByCategory(categoryId) {
  return request.get(`/book/category/${categoryId}`)
}

export function getBook(id) {
  return request.get(`/book/${id}`)
}

export function addBook(data) {
  return request.post('/book', data)
}

export function updateBook(data) {
  return request.put('/book', data)
}

export function deleteBook(id) {
  return request.delete(`/book/${id}`)
}
