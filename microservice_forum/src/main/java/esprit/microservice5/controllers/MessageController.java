package esprit.microservice5.controllers;

import esprit.microservice5.dto.MessageWithUserDTO;
import esprit.microservice5.entities.Message;
import esprit.microservice5.services.IMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final IMessageService messageService;

    /**
     * GET /api/messages/with-users
     * Returns all messages enriched with user info from Auth microservice via
     * RabbitMQ.
     * Each message will contain the full user details of its author.
     */
    @GetMapping("/with-users")
    public ResponseEntity<List<MessageWithUserDTO>> getMessagesWithUsers() {
        List<MessageWithUserDTO> messages = messageService.getAllMessagesWithUsers();
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id) {
        try {
            Message message = messageService.findById(id);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/forum/{idForum}")
    public ResponseEntity<Message> getMessageByForumId(@PathVariable Long idForum) {
        Message message = messageService.findbyIdForum(idForum);
        if (message != null) {
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Message> createMessage(@RequestBody Message message) {
        Message savedMessage = messageService.save(message);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMessage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @RequestBody Message message) {
        try {
            messageService.findById(id);
            message.setId(id);
            Message updatedMessage = messageService.save(message);
            return ResponseEntity.ok(updatedMessage);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        try {
            messageService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{forumId}/messages")
    public ResponseEntity<Message> sendMessage(@PathVariable Long forumId, @RequestBody Message message) {
        try {
            Message savedMessage = messageService.sendMessage(forumId, message);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMessage);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
