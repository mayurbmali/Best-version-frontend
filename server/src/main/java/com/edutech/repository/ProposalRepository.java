package com.edutech.repository;

import com.edutech.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    List<Proposal> findByFreelancerId(Long freelancerId);

    List<Proposal> findByJobId(Long jobId);

    boolean existsByJobIdAndFreelancerId(Long jobId, Long freelancerId);

    void deleteByJobId(Long jobId);

}
