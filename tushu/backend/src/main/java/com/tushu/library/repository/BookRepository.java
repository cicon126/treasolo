package com.tushu.library.repository;

import com.tushu.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByBookNo(String bookNo);
    List<Book> findByTitleContainingOrAuthorContainingOrBookNoContaining(String title, String author, String bookNo);
    List<Book> findByCategoryId(Long categoryId);
}
