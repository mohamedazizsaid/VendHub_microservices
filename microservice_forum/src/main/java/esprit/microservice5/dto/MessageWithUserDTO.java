package esprit.microservice5.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MessageWithUserDTO {
    private Long id;
    private String content;
    private String author;
    private Long iduser;
    private LocalDateTime createdAt;
    private Long forumId;

    // User info from Auth microservice via RabbitMQ
    private UserDTO user;
}
