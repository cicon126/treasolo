package com.tushu.library.repository;

import com.tushu.library.entity.BookCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookCategoryRepository extends JpaRepository<BookCategory, Long> {
    boolean existsByName(String name);
    List<BookCategory> findByNameContaining(String name);
}
