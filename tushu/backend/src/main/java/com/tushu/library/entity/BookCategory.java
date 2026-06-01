package com.tushu.library.entity;

import lombok.Data;
import javax.persistence.*;

@Data
@Entity
@Table(name = "book_category")
public class BookCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String remark;
}
