package com.edutech.controller;

import com.edutech.dto.VerifyPaymentRequest;
import com.edutech.entity.User;
import com.edutech.service.SubscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionController.class);

    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping("/create-order/{userId}")
    public ResponseEntity<?> createOrder(@PathVariable Long userId) {
        log.info("Create subscription order request: userId={}", userId);
        Map<String, Object> order = subscriptionService.createOrder(userId);
        log.info("Subscription order created: userId={}, orderId={}", userId, order.get("orderId"));
        return ResponseEntity.ok(order);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody VerifyPaymentRequest req) {
        log.info("Verify payment request: userId={}, orderId={}", req.getUserId(), req.getOrderId());
        User user = subscriptionService.verifyAndActivate(req);
        log.info("Subscription activated: userId={}", user.getId());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "role", user.getRole().name(),
                "isSubscribed", user.isSubscribed(),
                "paymentId", user.getPaymentId(),
                "message", "Subscription activated successfully"));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable Long userId) {
        log.debug("Subscription status request: userId={}", userId);
        com.edutech.entity.User user = subscriptionService.getUserForStatus(userId);
        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "isSubscribed", user.isSubscribed(),
                "role", user.getRole().name()));
    }

}
