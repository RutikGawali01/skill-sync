package com.rutik.skill_sync_backend.auth.util;

import com.rutik.skill_sync_backend.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class CookieUtil {

    @Value("${cookie.secure:false}")
    private boolean secure;

    public void add(HttpServletResponse res, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite(secure ? "None" : "Lax")
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
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite(secure ? "None" : "Lax")
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}