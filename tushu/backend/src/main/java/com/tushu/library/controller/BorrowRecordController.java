package com.tushu.library.controller;

import com.tushu.library.common.Result;
import com.tushu.library.entity.BorrowRecord;
import com.tushu.library.service.BorrowRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowRecordController {
    private final BorrowRecordService borrowRecordService;

    @GetMapping("/list")
    public Result<List<BorrowRecord>> list(@RequestParam(required = false) Integer status) {
        if (status != null) {
            return Result.success(borrowRecordService.findByStatus(status));
        }
        return Result.success(borrowRecordService.findAll());
    }

    @GetMapping("/member/{memberId}")
    public Result<List<BorrowRecord>> listByMember(@PathVariable Long memberId) {
        return Result.success(borrowRecordService.findByMemberId(memberId));
    }

    @GetMapping("/member/{memberId}/borrowing")
    public Result<List<BorrowRecord>> borrowingByMember(@PathVariable Long memberId) {
        return Result.success(borrowRecordService.findBorrowingByMemberId(memberId));
    }

    @GetMapping("/{id}")
    public Result<BorrowRecord> getById(@PathVariable Long id) {
        return Result.success(borrowRecordService.findById(id));
    }

    @PostMapping
    public Result<BorrowRecord> borrow(@RequestBody Map<String, Object> params) {
        try {
            Long memberId = Long.valueOf(params.get("memberId").toString());
            Long bookId = Long.valueOf(params.get("bookId").toString());
            Integer days = params.get("days") != null ? Integer.valueOf(params.get("days").toString()) : 30;
            String remark = params.get("remark") != null ? params.get("remark").toString() : null;
            return Result.success(borrowRecordService.borrow(memberId, bookId, days, remark));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/return/{id}")
    public Result<BorrowRecord> returnBook(@PathVariable Long id) {
        try {
            return Result.success(borrowRecordService.returnBook(id));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
