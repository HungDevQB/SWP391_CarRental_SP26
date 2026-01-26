package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.ImageDTO;
import com.carrental.car_rental.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);
    private static final String UPLOAD_DIR = "uploads/";

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
        // Tạo thư mục uploads nếu chưa tồn tại
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            logger.error("Không thể tạo thư mục uploads: {}", e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<ImageDTO> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "carId", required = false) Integer carId,
            @RequestParam(value = "isMain", defaultValue = "false") boolean isMain) {
        logger.info("Yêu cầu upload hình ảnh: {}", description);
        try {
            if (file.isEmpty()) {
                logger.warn("File upload rỗng");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            // Lưu file
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.write(filePath, file.getBytes());
            String imageUrl = "/uploads/" + filename;

            // Tạo ImageDTO
            ImageDTO imageDTO = new ImageDTO();
            imageDTO.setImageUrl(imageUrl);
            imageDTO.setDescription(description);
            imageDTO.setCarId(carId);
            imageDTO.setIsMain(isMain);

            ImageDTO savedImage = imageService.save(imageDTO);
            logger.info("Upload hình ảnh thành công: {}", imageUrl);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
        } catch (IOException e) {
            logger.error("Lỗi khi lưu file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (Exception e) {
            logger.error("Lỗi khi upload hình ảnh: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<ImageDTO>> getAllImages() {
        logger.info("Yêu cầu lấy tất cả hình ảnh");
        return ResponseEntity.ok(imageService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageDTO> getImageById(@PathVariable Integer id) {
        logger.info("Yêu cầu lấy hình ảnh với ID: {}", id);
        return ResponseEntity.ok(imageService.findById(id));
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<ImageDTO>> getImagesByCarId(@PathVariable Integer carId) {
        logger.info("Yêu cầu lấy hình ảnh cho xe với ID: {}", carId);
        return ResponseEntity.ok(imageService.findByCarId(carId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer id) {
        logger.info("Yêu cầu xóa hình ảnh với ID: {}", id);
        imageService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/uploads/{filename:.+}", produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE})
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                logger.info("Phục vụ file: {}", filename);
                return ResponseEntity.ok().body(resource);
            } else {
                logger.warn("File không tồn tại hoặc không đọc được: {}", filename);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            logger.error("Lỗi khi phục vụ file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}