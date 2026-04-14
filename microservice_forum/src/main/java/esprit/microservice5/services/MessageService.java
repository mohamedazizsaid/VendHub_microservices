package esprit.microservice5.services;

import esprit.microservice5.dto.MessageWithUserDTO;
import esprit.microservice5.dto.UserDTO;
import esprit.microservice5.entities.Forum;
import esprit.microservice5.entities.Message;
import esprit.microservice5.rabbitmq.UserConsumer;
import esprit.microservice5.rabbitmq.UserProducer;
import esprit.microservice5.repositories.ForumRepository;
import esprit.microservice5.repositories.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService implements IMessageService {

    private final MessageRepository messageRepository;
    private final ForumRepository forumRepository;
    private final UserProducer userProducer;
    private final UserConsumer userConsumer;

    @Override
    public Message findById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
    }

    @Override
    public Message save(Message message) {
        return messageRepository.save(message);
    }

    @Override
    public void deleteById(Long id) {
        if (!messageRepository.existsById(id)) {
            throw new RuntimeException("Message not found with id: " + id);
        }
        messageRepository.deleteById(id);
    }

    @Override
    public Message findbyIdForum(Long idForum) {
        return null;
    }

    @Override
    public Message sendMessage(Long forumId, Message message) {
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found with id: " + forumId));
        message.setForum(forum);
        message.setCreatedAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    @Override
    public List<MessageWithUserDTO> getAllMessagesWithUsers() {
        log.info(">>> [Forum] Getting all messages with users via RabbitMQ...");

        // Step 1: Request all users from Auth microservice via RabbitMQ
        userConsumer.resetFlag();
        userProducer.requestAllUsers();

        // Step 2: Wait for the response (with timeout)
        int maxWait = 10; // seconds
        int waited = 0;
        while (!userConsumer.isUsersReceived() && waited < maxWait) {
            try {
                Thread.sleep(1000);
                waited++;
                log.info(">>> [Forum] Waiting for user data... ({}/{}s)", waited, maxWait);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        if (!userConsumer.isUsersReceived()) {
            log.warn(">>> [Forum] Timeout waiting for user data from Auth microservice");
        }

        // Step 3: Get all messages and enrich with user data
        List<Message> messages = messageRepository.findAll();
        List<MessageWithUserDTO> result = new ArrayList<>();

        for (Message message : messages) {
            MessageWithUserDTO dto = new MessageWithUserDTO();
            dto.setId(message.getId());
            dto.setContent(message.getContent());
            dto.setAuthor(message.getAuthor());
            dto.setIduser(message.getIduser());
            dto.setCreatedAt(message.getCreatedAt());
            dto.setForumId(message.getForum() != null ? message.getForum().getId() : null);

            // Enrich with user data from RabbitMQ cache
            if (message.getIduser() != null) {
                UserDTO userDTO = userConsumer.getUserById(message.getIduser());
                if (userDTO != null) {
                    dto.setUser(userDTO);
                    log.info(">>> [Forum] Enriched message {} with user: {}", message.getId(), userDTO.getUsername());
                } else {
                    log.warn(">>> [Forum] No user found for iduser: {}", message.getIduser());
                }
            }

            result.add(dto);
        }

        log.info(">>> [Forum] Returning {} messages with user info", result.size());
        return result;
    }
}
