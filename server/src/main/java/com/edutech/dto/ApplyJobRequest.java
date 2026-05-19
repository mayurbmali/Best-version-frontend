package com.edutech.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.PositiveOrZero;

public class ApplyJobRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @PositiveOrZero(message = "Bid amount must be zero or positive")
    private Double bidAmount;

    public ApplyJobRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getBidAmount() { return bidAmount; }
    public void setBidAmount(Double bidAmount) { this.bidAmount = bidAmount; }
}
