package com.tushu.library.controller;

import com.tushu.library.common.Result;
import com.tushu.library.entity.Book;
import com.tushu.library.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping("/list")
    public Result<List<Book>> list(@RequestParam(required = false) String keyword) {
        return Result.success(bookService.search(keyword));
    }

    @GetMapping("/category/{categoryId}")
    public Result<List<Book>> listByCategory(@PathVariable Long categoryId) {
        return Result.success(bookService.findByCategoryId(categoryId));
    }

    @GetMapping("/{id}")
    public Result<Book> getById(@PathVariable Long id) {
        return Result.success(bookService.findById(id));
    }

    @PostMapping
    public Result<Book> save(@RequestBody Book book) {
        try {
            return Result.success(bookService.save(book));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping
    public Result<Book> update(@RequestBody Book book) {
        try {
            return Result.success(bookService.update(book));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        bookService.deleteById(id);
        return Result.success();
    }
}
