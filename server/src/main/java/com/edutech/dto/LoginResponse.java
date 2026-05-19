package com.edutech.dto;

public class LoginResponse {

    private Long userId;
    private String token;
    private String username;
    private String email;
    private String role;
    private boolean isSubscribed;

    public LoginResponse() {}

    public LoginResponse(Long userId, String token, String username, String email, String role, boolean isSubscribed) {
        this.userId = userId;
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.isSubscribed = isSubscribed;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isSubscribed() { return isSubscribed; }
    public void setSubscribed(boolean isSubscribed) { this.isSubscribed = isSubscribed; }
}