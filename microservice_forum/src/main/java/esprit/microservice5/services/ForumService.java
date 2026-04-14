package esprit.microservice5.services;

import esprit.microservice5.entities.Forum;
import esprit.microservice5.repositories.ForumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumService implements IForumService {

    private final ForumRepository forumRepository;

    @Override
    public List<Forum> findAll() {
        return forumRepository.findAll();
    }

    @Override
    public Forum findById(Long id) {
        return forumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forum not found with id: " + id));
    }

    @Override
    public Forum save(Forum forum) {
        return forumRepository.save(forum);
    }

    @Override
    public void deleteById(Long id) {
        if (!forumRepository.existsById(id)) {
            throw new RuntimeException("Forum not found with id: " + id);
        }
        forumRepository.deleteById(id);
    }
}
