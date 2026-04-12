package tn.esprit.microservice4.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.microservice4.dto.EventDTO;

import java.util.List;

@FeignClient(name = "MICROSERVICE3")
public interface EventClient {

    @GetMapping("/api/events")
    List<EventDTO> getAllEvents();

    @GetMapping("/api/events/{id}")
    EventDTO getEventById(@PathVariable("id") String id);
}
