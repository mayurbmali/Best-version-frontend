package com.edutech.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Email(message = "Must be a valid email address")
    private String email;

    private Long contactNumber;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @Size(max = 500, message = "Skills must not exceed 500 characters")
    private String skills;

    public ProfileUpdateRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getContactNumber() { return contactNumber; }
    public void setContactNumber(Long contactNumber) { this.contactNumber = contactNumber; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
}
