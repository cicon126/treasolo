package com.tushu.library.controller;

import com.tushu.library.common.Result;
import com.tushu.library.entity.Admin;
import com.tushu.library.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/login")
    public Result<?> login(@RequestBody Map<String, String> params) {
        try {
            Admin admin = adminService.login(params.get("username"), params.get("password"));
            Map<String, Object> data = new HashMap<>();
            data.put("id", admin.getId());
            data.put("username", admin.getUsername());
            data.put("name", admin.getName());
            return Result.success(data);
        } catch (RuntimeException e) {
            return Result.error(401, e.getMessage());
        }
    }

    @PostMapping("/init")
    public Result<?> initAdmin() {
        return Result.success(adminService.initAdmin());
    }
}
