package tn.esprit.microservice4.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {

    private String _id;
    private String name;
    private String description;
    private String image;
    private List<Long> participant;
    private Integer capacity;
    private String location;
    private String date;
    private String createdAt;
}
