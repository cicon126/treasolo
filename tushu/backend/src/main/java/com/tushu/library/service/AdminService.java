package com.tushu.library.service;

import com.tushu.library.entity.Admin;
import com.tushu.library.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;

    public Admin login(String username, String password) {
        return adminRepository.findByUsernameAndPassword(username, password)
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));
    }

    public Admin initAdmin() {
        if (!adminRepository.existsByUsername("admin")) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setName("系统管理员");
            return adminRepository.save(admin);
        }
        return adminRepository.findByUsernameAndPassword("admin", "admin123").orElse(null);
    }
}
