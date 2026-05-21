package kr.co.iei.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CloudinaryImageService {
  private final Cloudinary cloudinary;

  @Value("${cloudinary.meeting-folder:image/meetings}")
  private String meetingFolder;

  public String uploadMeetingThumbnail(MultipartFile image) {
    if (image == null || image.isEmpty()) {
      return null;
    }

    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> uploadResult =
          cloudinary
              .uploader()
              .upload(
                  image.getBytes(),
                  ObjectUtils.asMap(
                      "folder", meetingFolder,
                      "resource_type", "image"));

      Object secureUrl = uploadResult.get("secure_url");
      return secureUrl == null ? null : secureUrl.toString();
    } catch (IOException exception) {
      throw new IllegalStateException("Failed to upload image to Cloudinary.", exception);
    }
  }
}
