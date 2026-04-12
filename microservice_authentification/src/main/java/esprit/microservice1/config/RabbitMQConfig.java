package esprit.microservice1.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class RabbitMQConfig {

    // Queue where forum sends requests for user info
    public static final String USER_REQUEST_QUEUE = "user.request.queue";

    // Queue where auth sends back user info
    public static final String USER_RESPONSE_QUEUE = "user.response.queue";

    // Exchange
    public static final String EXCHANGE = "user.exchange";

    // Routing keys
    public static final String USER_REQUEST_ROUTING_KEY = "user.request";
    public static final String USER_RESPONSE_ROUTING_KEY = "user.response";

    @Bean
    public Queue userRequestQueue() {
        return new Queue(USER_REQUEST_QUEUE, true);
    }

    @Bean
    public Queue userResponseQueue() {
        return new Queue(USER_RESPONSE_QUEUE, true);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Binding userRequestBinding(Queue userRequestQueue, DirectExchange exchange) {
        return BindingBuilder.bind(userRequestQueue).to(exchange).with(USER_REQUEST_ROUTING_KEY);
    }

    @Bean
    public Binding userResponseBinding(Queue userResponseQueue, DirectExchange exchange) {
        return BindingBuilder.bind(userResponseQueue).to(exchange).with(USER_RESPONSE_ROUTING_KEY);
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
