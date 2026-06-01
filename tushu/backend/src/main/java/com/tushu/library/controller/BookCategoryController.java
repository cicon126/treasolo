package com.tushu.library.controller;

import com.tushu.library.common.Result;
import com.tushu.library.entity.BookCategory;
import com.tushu.library.service.BookCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class BookCategoryController {
    private final BookCategoryService categoryService;

    @GetMapping("/list")
    public Result<List<BookCategory>> list(@RequestParam(required = false) String name) {
        return Result.success(categoryService.search(name));
    }

    @GetMapping("/{id}")
    public Result<BookCategory> getById(@PathVariable Long id) {
        return Result.success(categoryService.findById(id));
    }

    @PostMapping
    public Result<BookCategory> save(@RequestBody BookCategory category) {
        try {
            return Result.success(categoryService.save(category));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping
    public Result<BookCategory> update(@RequestBody BookCategory category) {
        try {
            return Result.success(categoryService.update(category));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        categoryService.deleteById(id);
        return Result.success();
    }
}
