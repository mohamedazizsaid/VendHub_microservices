package esprit.microservice5.services;

import esprit.microservice5.entities.Forum;

import java.util.List;

public interface IForumService {

    public List<Forum> findAll();
    public Forum findById(Long id);
    public Forum save(Forum forum);
    public void deleteById(Long id);

}
