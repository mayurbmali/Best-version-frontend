package com.edutech.dto;

import javax.validation.constraints.NotBlank;

public class GoogleAuthRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}
