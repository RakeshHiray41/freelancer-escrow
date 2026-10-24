package com.freelance.chat_service.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ModerationService {
    private static final Pattern EMAIL =
            Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
    private static final Pattern PHONE =
            Pattern.compile("(\\+?\\d[\\s-]?){10,}");
    private static final List<String> WORDS = List.of(
            "whatsapp", "telegram", "paytm", "gpay", "google pay", "phonepe", "upi",
            "bank account", "pay me directly", "direct payment", "outside the platform",
            "outside platform");

    public static final String WARNING =
            "Warning: sharing contact details or paying outside the platform is not allowed. "
                    + "Escrow protection works only for payments made on this platform.";

    /** Returns a warning text, or null if the message looks fine. */
    public String check(String text) {
        String lower = text.toLowerCase();
        if (EMAIL.matcher(text).find() || PHONE.matcher(text).find()) return WARNING;
        for (String w : WORDS) {
            if (lower.contains(w)) return WARNING;
        }
        return null;
    }
}