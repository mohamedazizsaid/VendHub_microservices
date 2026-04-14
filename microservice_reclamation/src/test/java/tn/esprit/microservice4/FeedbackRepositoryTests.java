package tn.esprit.microservice4;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import tn.esprit.microservice4.entities.Feedback;
import tn.esprit.microservice4.repositories.FeedbackRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class FeedbackRepositoryTests {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Test
    void testSaveAndFindByEventId() {
        Feedback fb = new Feedback();
        fb.setEventId("event100");
        fb.setUserId(1L);
        fb.setRating(5);
        fb.setComment("Great event");

        Feedback saved = feedbackRepository.save(fb);

        List<Feedback> list = feedbackRepository.findByEventId("event100");
        assertThat(list).isNotEmpty();
        assertThat(list.get(0).getId()).isEqualTo(saved.getId());
    }
}
