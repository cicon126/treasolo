package com.tushu.library.entity;

import lombok.Data;
import javax.persistence.*;

@Data
@Entity
@Table(name = "book")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookNo;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String publisher;

    private String isbn;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private BookCategory category;

    @Column(nullable = false)
    private Integer totalStock = 1;

    @Column(nullable = false)
    private Integer availableStock = 1;

    private String remark;

    @Column(nullable = false)
    private Integer status = 1;
}
