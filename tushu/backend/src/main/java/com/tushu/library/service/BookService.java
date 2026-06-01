package com.tushu.library.service;

import com.tushu.library.entity.Book;
import com.tushu.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public List<Book> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return bookRepository.findAll();
        }
        return bookRepository.findByTitleContainingOrAuthorContainingOrBookNoContaining(keyword, keyword, keyword);
    }

    public List<Book> findByCategoryId(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public Book findById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("图书不存在"));
    }

    public Book save(Book book) {
        if (book.getId() == null && bookRepository.existsByBookNo(book.getBookNo())) {
            throw new RuntimeException("图书编号已存在");
        }
        if (book.getAvailableStock() == null) {
            book.setAvailableStock(book.getTotalStock());
        }
        return bookRepository.save(book);
    }

    public Book update(Book book) {
        Book existing = findById(book.getId());
        if (!existing.getBookNo().equals(book.getBookNo())
                && bookRepository.existsByBookNo(book.getBookNo())) {
            throw new RuntimeException("图书编号已存在");
        }
        return bookRepository.save(book);
    }

    public void deleteById(Long id) {
        bookRepository.deleteById(id);
    }

    public void decreaseAvailableStock(Long bookId) {
        Book book = findById(bookId);
        if (book.getAvailableStock() <= 0) {
            throw new RuntimeException("库存不足，无法借出");
        }
        book.setAvailableStock(book.getAvailableStock() - 1);
        bookRepository.save(book);
    }

    public void increaseAvailableStock(Long bookId) {
        Book book = findById(bookId);
        book.setAvailableStock(book.getAvailableStock() + 1);
        bookRepository.save(book);
    }
}
