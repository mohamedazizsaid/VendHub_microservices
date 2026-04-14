package esprit.microservice5.services;

import esprit.microservice5.dto.MessageWithUserDTO;
import esprit.microservice5.entities.Message;

import java.util.List;

public interface IMessageService {

    public Message findById(Long id);

    public Message save(Message message);

    public void deleteById(Long id);

    public Message findbyIdForum(Long idForum);

    public Message sendMessage(Long forumId, Message message);

    /**
     * Get all messages with user info enriched via RabbitMQ.
     */
    public List<MessageWithUserDTO> getAllMessagesWithUsers();
}
