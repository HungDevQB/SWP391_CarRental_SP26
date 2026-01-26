package com.carrental.car_rental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Table(name = "car")
@Entity
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "car_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "supplier_id", nullable = false)
    private User supplier;

    @Size(max = 20)
    @NotNull
    @Column(name = "license_plate", nullable = false, length = 20)
    private String licensePlate;

    @Size(max = 50)
    @NotNull
    @Nationalized
    @Column(name = "model", nullable = false, length = 50)
    private String model;

    @NotNull
    @Column(name = "\"year\"", nullable = false)
    private Short year;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @Column(name = "color", length = 20)
    private String color;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;

    @Column(name = "num_of_seats", columnDefinition = "tinyint not null")
    private Short numOfSeats;

    @NotNull
    @Column(name = "daily_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private CarBrand brand;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fuel_type_id", nullable = false)
    private FuelType fuelType;

    @Size(max = 500)
    @Nationalized
    @Column(name = "features", length = 500)
    private String features;

    // Thêm thuộc tính transmission
    @Size(max = 20)
    @Nationalized
    @Column(name = "transmission", length = 20)
    private String transmission;

    // Thêm thuộc tính describe
    @Size(max = 500)
    @Nationalized
    @Column(name = "describe", length = 500)
    private String describe;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("getdate()")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @OneToMany(mappedBy = "car", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Image> images;

    // Thêm getter tính toán cho image (hình ảnh chính)
    @Transient // Đánh dấu không ánh xạ trực tiếp với cột trong bảng
    public String getImage() {
        try {
        if (images != null && !images.isEmpty()) {
            return images.stream()
                    .filter(Image::getIsMain)
                    .findFirst()
                    .map(Image::getImageUrl)
                    .orElse(images.get(0).getImageUrl()); // Lấy hình đầu tiên nếu không có is_main
            }
        } catch (org.hibernate.LazyInitializationException e) {
            // Nếu images chưa được load (lazy loading), trả về null
            return null;
        }
        return null; // Trả về null nếu không có hình ảnh
    }
}