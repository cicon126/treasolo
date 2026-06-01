package com.tushu.library.service;

import com.tushu.library.entity.Member;
import com.tushu.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;

    public List<Member> findAll() {
        return memberRepository.findAll();
    }

    public List<Member> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return memberRepository.findAll();
        }
        return memberRepository.findByNameContainingOrMemberNoContainingOrPhoneContaining(keyword, keyword, keyword);
    }

    public Member findById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("会员不存在"));
    }

    public Member save(Member member) {
        if (member.getId() == null && memberRepository.existsByMemberNo(member.getMemberNo())) {
            throw new RuntimeException("会员编号已存在");
        }
        if (member.getRegisterDate() == null) {
            member.setRegisterDate(new Date());
        }
        return memberRepository.save(member);
    }

    public Member update(Member member) {
        Member existing = findById(member.getId());
        if (!existing.getMemberNo().equals(member.getMemberNo())
                && memberRepository.existsByMemberNo(member.getMemberNo())) {
            throw new RuntimeException("会员编号已存在");
        }
        return memberRepository.save(member);
    }

    public void deleteById(Long id) {
        memberRepository.deleteById(id);
    }
}
