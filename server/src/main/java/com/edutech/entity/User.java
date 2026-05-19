package com.edutech.entity;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "user")
public class User {

   public enum Role {
      ADMIN,
      CLIENT,
      FREELANCER
   }

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @NotBlank
   @Column(unique = true, nullable = false)
   private String username;

   @NotBlank
   @Column(nullable = false)
   private String password;

   @NotBlank
   @Email
   @Column(unique = true, nullable = false)
   private String email;

   private Long contactNumber;

   private String skills;

   private String bio;

   @NotNull
   @Enumerated(EnumType.STRING)
   @Column(nullable = false)
   private Role role = Role.FREELANCER;

   @Column(nullable = false)
   private boolean emailVerified = false;

   @Column(nullable = false)
   private String authProvider = "LOCAL";

   @Column(nullable = false)
   private boolean isSubscribed = false;

   private String paymentId;

   @JsonIgnore
   @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
   private List<Proposal> proposals;

   public User() {
   }

   public User(String username, String password, String email, Long contactNumber, String skills, String bio,
         Role role) {
      this.username = username;
      this.password = password;
      this.email = email;
      this.contactNumber = contactNumber;
      this.skills = skills;
      this.bio = bio;
      this.role = role;
   }

   public Long getId() { return id; }
   public void setId(Long id) { this.id = id; }
   public String getUsername() { return username; }
   public void setUsername(String username) { this.username = username; }
   public String getPassword() { return password; }
   public void setPassword(String password) { this.password = password; }
   public String getEmail() { return email; }
   public void setEmail(String email) { this.email = email; }
   public Long getContactNumber() { return contactNumber; }
   public void setContactNumber(Long contactNumber) { this.contactNumber = contactNumber; }
   public String getSkills() { return skills; }
   public void setSkills(String skills) { this.skills = skills; }
   public String getBio() { return bio; }
   public void setBio(String bio) { this.bio = bio; }
   public Role getRole() { return role; }
   public void setRole(Role role) { this.role = role; }
   public boolean isEmailVerified() { return emailVerified; }
   public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
   public String getAuthProvider() { return authProvider; }
   public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
   public boolean isSubscribed() { return isSubscribed; }
   public void setSubscribed(boolean isSubscribed) { this.isSubscribed = isSubscribed; }
   public String getPaymentId() { return paymentId; }
   public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
   public List<Proposal> getProposals() { return proposals; }
   public void setProposals(List<Proposal> proposals) { this.proposals = proposals; }
}
