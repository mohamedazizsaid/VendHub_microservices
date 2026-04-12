package esprit.microservice1.rabbitmq;

import esprit.microservice1.config.RabbitMQConfig;
import esprit.microservice1.dto.UserDTO;
import esprit.microservice1.entities.User;
import esprit.microservice1.repositories.UserRespository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserConsumer {

    private final UserRespository userRepository;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Listens for user info requests from the Forum microservice.
     * When it receives a list of user IDs, it fetches the user details
     * and sends them back via the response queue.
     */
    @RabbitListener(queues = RabbitMQConfig.USER_REQUEST_QUEUE)
    public void handleUserInfoRequest(Map<String, Object> request) {
        log.info(">>> [Auth] Received user info request: {}", request);

        try {
            String action = (String) request.get("action");

            if ("GET_ALL_USERS".equals(action)) {
                // Fetch all users and send back
                List<User> users = userRepository.findAll();
                List<UserDTO> userDTOs = users.stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());

                log.info(">>> [Auth] Sending {} users to forum", userDTOs.size());

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE,
                        RabbitMQConfig.USER_RESPONSE_ROUTING_KEY,
                        userDTOs);

            } else if ("GET_USER_BY_ID".equals(action)) {
                // Fetch a single user by ID
                Long userId = Long.valueOf(request.get("userId").toString());
                User user = userRepository.findById(userId).orElse(null);

                if (user != null) {
                    UserDTO dto = convertToDTO(user);
                    log.info(">>> [Auth] Sending user info for ID {}: {}", userId, dto);
                    rabbitTemplate.convertAndSend(
                            RabbitMQConfig.EXCHANGE,
                            RabbitMQConfig.USER_RESPONSE_ROUTING_KEY,
                            dto);
                } else {
                    log.warn(">>> [Auth] User not found with ID: {}", userId);
                }
            }
        } catch (Exception e) {
            log.error(">>> [Auth] Error processing user request: {}", e.getMessage(), e);
        }
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setImageUrl(user.getImageUrl());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        return dto;
    }
}
