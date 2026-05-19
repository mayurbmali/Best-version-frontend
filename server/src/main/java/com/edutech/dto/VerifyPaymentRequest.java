package com.edutech.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class VerifyPaymentRequest {

    @NotBlank(message = "Payment ID is required")
    private String paymentId;

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "Signature is required")
    private String signature;

    @NotNull(message = "User ID is required")
    private Long userId;

    public VerifyPaymentRequest() {}

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
