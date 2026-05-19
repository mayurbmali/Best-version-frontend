package com.edutech.dto;

import javax.validation.constraints.NotBlank;

public class GoogleCompleteRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;

    @NotBlank(message = "Role is required")
    private String role;

    private String username;

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
