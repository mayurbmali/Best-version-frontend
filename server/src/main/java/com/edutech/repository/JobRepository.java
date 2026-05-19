package com.edutech.repository;

import com.edutech.entity.Job;
import com.edutech.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // Newest first
    List<Job> findAllByOrderByCreatedAtDesc();
    List<Job> findByClientOrderByCreatedAtDesc(User client);
    List<Job> findByClientUsernameOrderByCreatedAtDesc(String username);

    // Legacy (kept for backward compat)
    List<Job> findByClient(User client);
    List<Job> findByClientUsername(String username);
}
