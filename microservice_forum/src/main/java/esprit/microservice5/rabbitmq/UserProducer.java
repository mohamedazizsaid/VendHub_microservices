package esprit.microservice5.rabbitmq;

import esprit.microservice5.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserProducer {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Send a request to the Auth microservice to get all user info.
     */
    public void requestAllUsers() {
        Map<String, Object> request = new HashMap<>();
        request.put("action", "GET_ALL_USERS");

        log.info(">>> [Forum] Sending request for all users to Auth microservice");
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.USER_REQUEST_ROUTING_KEY,
                request);
    }

    /**
     * Send a request to the Auth microservice to get a specific user by ID.
     */
    public void requestUserById(Long userId) {
        Map<String, Object> request = new HashMap<>();
        request.put("action", "GET_USER_BY_ID");
        request.put("userId", userId);

        log.info(">>> [Forum] Sending request for user ID {} to Auth microservice", userId);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.USER_REQUEST_ROUTING_KEY,
                request);
    }
}
