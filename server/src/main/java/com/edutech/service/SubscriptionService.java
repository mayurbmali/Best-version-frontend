package com.edutech.service;

import com.edutech.dto.VerifyPaymentRequest;
import com.edutech.entity.User;
import com.edutech.exception.BadRequestException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionService.class);

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private UserService userService;

    private static final long SUBSCRIPTION_AMOUNT_PAISE = 49900L; // ₹499 in paise

    public Map<String, Object> createOrder(Long userId) {
        log.info("Creating Razorpay order: userId={}, amount={}", userId, SUBSCRIPTION_AMOUNT_PAISE);
        try {
            com.razorpay.RazorpayClient client = new com.razorpay.RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", SUBSCRIPTION_AMOUNT_PAISE);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "sub_" + userId);
            orderRequest.put("notes", new JSONObject().put("userId", userId));

            com.razorpay.Order order = client.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id").toString());
            response.put("amount", SUBSCRIPTION_AMOUNT_PAISE);
            response.put("currency", "INR");
            response.put("keyId", keyId);
            log.info("Razorpay order created: userId={}, orderId={}", userId, order.get("id"));
            return response;
        } catch (Exception e) {
            log.error("Failed to create Razorpay order: userId={}, error={}", userId, e.getMessage());
            throw new BadRequestException("Failed to create payment order: " + e.getMessage());
        }
    }

    public User verifyAndActivate(VerifyPaymentRequest req) {
        log.info("Verifying payment: userId={}, orderId={}", req.getUserId(), req.getOrderId());
        if (!verifySignature(req.getOrderId(), req.getPaymentId(), req.getSignature())) {
            log.warn("Payment signature verification failed: userId={}, orderId={}", req.getUserId(), req.getOrderId());
            throw new AccessDeniedException("Invalid payment signature");
        }
        User user = userService.updateSubscription(req.getUserId(), req.getPaymentId());
        log.info("Subscription activated: userId={}", req.getUserId());
        return user;
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    public com.edutech.entity.User getUserForStatus(Long userId) {
        return userService.getUserProfile(userId);
    }

}
