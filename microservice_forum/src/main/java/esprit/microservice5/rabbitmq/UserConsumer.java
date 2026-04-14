package esprit.microservice5.rabbitmq;

import esprit.microservice5.config.RabbitMQConfig;
import esprit.microservice5.dto.UserDTO;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Slf4j
public class UserConsumer {

    // In-memory cache of users received from Auth microservice
    @Getter
    private final Map<Long, UserDTO> usersCache = new ConcurrentHashMap<>();

    @Getter
    private volatile boolean usersReceived = false;

    /**
     * Listens for a list of users from the Auth microservice.
     */
    @RabbitListener(queues = RabbitMQConfig.USER_RESPONSE_QUEUE)
    public void handleUserResponse(List<UserDTO> users) {
        log.info(">>> [Forum] Received {} users from Auth microservice", users.size());

        usersCache.clear();
        for (UserDTO user : users) {
            usersCache.put(user.getId(), user);
            log.info(">>> [Forum] Cached user: {}", user);
        }
        usersReceived = true;
    }

    /**
     * Get a user from the cache by ID.
     */
    public UserDTO getUserById(Long userId) {
        return usersCache.get(userId);
    }

    /**
     * Reset the flag to wait for new data.
     */
    public void resetFlag() {
        usersReceived = false;
    }
}
