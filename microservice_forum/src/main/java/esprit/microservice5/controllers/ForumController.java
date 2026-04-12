package esprit.microservice5.controllers;

import esprit.microservice5.entities.Forum;
import esprit.microservice5.services.IForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forums")
@RequiredArgsConstructor
public class ForumController {

    private final IForumService forumService;

    @GetMapping
    public ResponseEntity<List<Forum>> getAllForums() {
        List<Forum> forums = forumService.findAll();
        return ResponseEntity.ok(forums);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Forum> getForumById(@PathVariable Long id) {
        try {
            Forum forum = forumService.findById(id);
            return ResponseEntity.ok(forum);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Forum> createForum(@RequestBody Forum forum) {
        Forum savedForum = forumService.save(forum);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedForum);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Forum> updateForum(@PathVariable Long id, @RequestBody Forum forum) {
        try {
            forumService.findById(id); // Vérifier si le forum existe
            forum.setId(id);
            Forum updatedForum = forumService.save(forum);
            return ResponseEntity.ok(updatedForum);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForum(@PathVariable Long id) {
        try {
            forumService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
