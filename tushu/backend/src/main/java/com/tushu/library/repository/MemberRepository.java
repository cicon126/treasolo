package com.tushu.library.repository;

import com.tushu.library.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByMemberNo(String memberNo);
    boolean existsByMemberNo(String memberNo);
    List<Member> findByNameContainingOrMemberNoContainingOrPhoneContaining(String name, String memberNo, String phone);
}
