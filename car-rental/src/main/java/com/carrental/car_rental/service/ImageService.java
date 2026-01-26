package com.carrental.car_rental.service;
import com.carrental.car_rental.dto.ImageDTO;
import com.carrental.car_rental.entity.Image;
import com.carrental.car_rental.mapper.ImageMapper;
import com.carrental.car_rental.repository.ImageRepository;
import com.carrental.car_rental.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository repository;
    private final ImageMapper mapper;
    private final CarRepository carRepository;

    public ImageDTO findById(Integer id) {
        Image entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hình ảnh không tìm thấy với id: " + id));
        return mapper.toDTO(entity);
    }

    public List<ImageDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ImageDTO> findByCarId(Integer carId) {
        return repository.findByCarIdAndIsDeletedFalse(carId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public ImageDTO save(ImageDTO dto) {
        Image entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        if (dto.getCarId() != null) {
            entity.setCar(carRepository.findById(dto.getCarId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Car not found for image upload")));
        }
        return mapper.toDTO(repository.save(entity));
    }

    public ImageDTO update(Integer id, ImageDTO dto) {
        Image existing = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hình ảnh không tìm thấy với id: " + id));

        mapper.partialUpdate(existing, dto); // Create this method in your mapper
        existing.setIsDeleted(false); // Ensure it's not marked deleted
        return mapper.toDTO(repository.save(existing));
    }

    public void delete(Integer id) {
        Image entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hình ảnh không tìm thấy với id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }

    public void saveImage(Image image, MultipartFile file) throws IOException {
        // Lưu file vào thư mục uploads
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        // Lưu đường dẫn vào entity Image
        image.setImageUrl("/uploads/" + fileName);
        image.setIsDeleted(false);
        repository.save(image);
    }
}