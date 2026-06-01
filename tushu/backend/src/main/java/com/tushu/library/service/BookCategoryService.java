package com.tushu.library.service;

import com.tushu.library.entity.BookCategory;
import com.tushu.library.repository.BookCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookCategoryService {
    private final BookCategoryRepository categoryRepository;

    public List<BookCategory> findAll() {
        return categoryRepository.findAll();
    }

    public List<BookCategory> search(String name) {
        if (name == null || name.trim().isEmpty()) {
            return categoryRepository.findAll();
        }
        return categoryRepository.findByNameContaining(name);
    }

    public BookCategory findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
    }

    public BookCategory save(BookCategory category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("分类名称已存在");
        }
        return categoryRepository.save(category);
    }

    public BookCategory update(BookCategory category) {
        BookCategory existing = findById(category.getId());
        if (!existing.getName().equals(category.getName())
                && categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("分类名称已存在");
        }
        return categoryRepository.save(category);
    }

    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }
}
