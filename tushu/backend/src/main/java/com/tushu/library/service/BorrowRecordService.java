package com.tushu.library.service;

import com.tushu.library.entity.BorrowRecord;
import com.tushu.library.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowRecordService {
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookService bookService;

    public List<BorrowRecord> findAll() {
        return borrowRecordRepository.findAll();
    }

    public List<BorrowRecord> findByMemberId(Long memberId) {
        return borrowRecordRepository.findByMemberIdOrderByBorrowDateDesc(memberId);
    }

    public List<BorrowRecord> findByStatus(Integer status) {
        return borrowRecordRepository.findByStatusOrderByBorrowDateDesc(status);
    }

    public List<BorrowRecord> findBorrowingByMemberId(Long memberId) {
        return borrowRecordRepository.findByMemberIdAndStatus(memberId, 1);
    }

    public BorrowRecord findById(Long id) {
        return borrowRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("借阅记录不存在"));
    }

    @Transactional
    public BorrowRecord borrow(Long memberId, Long bookId, Integer days, String remark) {
        bookService.decreaseAvailableStock(bookId);

        BorrowRecord record = new BorrowRecord();
        record.setMember(new com.tushu.library.entity.Member());
        record.getMember().setId(memberId);
        record.setBook(new com.tushu.library.entity.Book());
        record.getBook().setId(bookId);
        record.setBorrowDate(new Date());

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, days != null ? days : 30);
        record.setDueDate(cal.getTime());

        record.setStatus(1);
        record.setRemark(remark);
        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord returnBook(Long recordId) {
        BorrowRecord record = findById(recordId);
        if (record.getStatus() != 1) {
            throw new RuntimeException("该记录已归还");
        }
        record.setStatus(2);
        record.setReturnDate(new Date());
        bookService.increaseAvailableStock(record.getBook().getId());
        return borrowRecordRepository.save(record);
    }

    public List<BorrowRecord> search(String keyword) {
        return borrowRecordRepository.findAll();
    }
}
