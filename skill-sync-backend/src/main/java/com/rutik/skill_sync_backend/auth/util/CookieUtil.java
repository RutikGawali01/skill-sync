package com.rutik.skill_sync_backend.auth.util;

import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;
@Component
public class CookieUtil {

    public void add(HttpServletResponse res, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(true) // 🔥 prod
                .path("/api/auth")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public String extract(HttpServletRequest req) {

        if (req.getCookies() == null) {
            throw new UnauthorizedException("No cookies present");
        }

        return Arrays.stream(req.getCookies())
                .filter(c -> c.getName().equals("refreshToken"))
                .findFirst()
                .orElseThrow(() -> new UnauthorizedException("No token"))
                .getValue();
    }

    public void clear(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .path("/api/auth")
                .maxAge(0)
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}