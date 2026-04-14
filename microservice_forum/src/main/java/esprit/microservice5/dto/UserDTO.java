package esprit.microservice5.dto;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDTO implements Serializable {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String imageUrl;
    private String role;
}
