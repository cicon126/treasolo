package com.tushu.library.repository;

import com.tushu.library.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByMemberIdOrderByBorrowDateDesc(Long memberId);
    List<BorrowRecord> findByStatusOrderByBorrowDateDesc(Integer status);
    List<BorrowRecord> findByMemberIdAndStatus(Long memberId, Integer status);
    List<BorrowRecord> findByBookIdAndStatus(Long bookId, Integer status);
}
