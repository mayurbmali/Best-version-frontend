package com.edutech.dto;

public class JobDTO {

    private Long id;
    private String title;
    private String description;
    private Double budget;
    private String status;
    private Long clientId;
    private String clientUsername;

    public JobDTO() {}

    public JobDTO(Long id, String title, String description, Double budget, String status,
                  Long clientId, String clientUsername) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.status = status;
        this.clientId = clientId;
        this.clientUsername = clientUsername;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public String getClientUsername() { return clientUsername; }
    public void setClientUsername(String clientUsername) { this.clientUsername = clientUsername; }
}