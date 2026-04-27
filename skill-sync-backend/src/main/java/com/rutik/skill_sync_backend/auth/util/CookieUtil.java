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

    private final boolean isProd = false; // change via env

    public void add(HttpServletResponse res, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite(isProd ? "None" : "Lax")
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public String extract(HttpServletRequest req) {

        if (req.getCookies() == null) {
            return null;
        }

        return Arrays.stream(req.getCookies())
                .filter(c -> c.getName().equals("refreshToken"))
                .findFirst()
                .map(c -> c.getValue())
                .orElse(null);
    }

    public void clear(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(0)
                .sameSite(isProd ? "None" : "Lax")
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}