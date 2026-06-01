package com.tushu.library.controller;

import com.tushu.library.common.Result;
import com.tushu.library.entity.Member;
import com.tushu.library.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @GetMapping("/list")
    public Result<List<Member>> list(@RequestParam(required = false) String keyword) {
        return Result.success(memberService.search(keyword));
    }

    @GetMapping("/{id}")
    public Result<Member> getById(@PathVariable Long id) {
        return Result.success(memberService.findById(id));
    }

    @PostMapping
    public Result<Member> save(@RequestBody Member member) {
        try {
            return Result.success(memberService.save(member));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping
    public Result<Member> update(@RequestBody Member member) {
        try {
            return Result.success(memberService.update(member));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        memberService.deleteById(id);
        return Result.success();
    }
}
