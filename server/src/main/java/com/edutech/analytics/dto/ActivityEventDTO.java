package com.edutech.analytics.dto;

public class ActivityEventDTO {

    private String type;       // USER_JOINED | JOB_POSTED | PROPOSAL | HIRED | SUBSCRIBED
    private String description;
    private String actorName;
    private String timestamp;
    private String badge;

    public ActivityEventDTO() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
}
