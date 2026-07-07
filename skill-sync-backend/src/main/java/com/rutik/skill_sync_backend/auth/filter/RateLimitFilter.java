package com.rutik.skill_sync_backend.auth.filter;

import com.rutik.skill_sync_backend.common.exception.TooManyRequestsException;
import com.rutik.skill_sync_backend.config.RateLimitProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitProperties properties;
    private final StringRedisTemplate redisTemplate;
    private final AntPathMatcher pathMatcher;
    private final HandlerExceptionResolver resolver;

    private static final String LUA_SCRIPT =
            "local key = KEYS[1]\n" +
            "local now = tonumber(ARGV[1])\n" +
            "local window = tonumber(ARGV[2])\n" +
            "local limit = tonumber(ARGV[3])\n" +
            "local member = ARGV[4]\n" +
            "redis.call('zremrangebyscore', key, 0, now - window)\n" +
            "local current_requests = redis.call('zcard', key)\n" +
            "if current_requests < limit then\n" +
            "    redis.call('zadd', key, now, member)\n" +
            "    redis.call('expire', key, math.ceil(window / 1000))\n" +
            "    return 1\n" +
            "else\n" +
            "    return 0\n" +
            "end";

    private final RedisScript<Long> rateLimitRedisScript;

    @Autowired
    public RateLimitFilter(
            RateLimitProperties properties,
            StringRedisTemplate redisTemplate,
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.properties = properties;
        this.redisTemplate = redisTemplate;
        this.resolver = resolver;
        this.pathMatcher = new AntPathMatcher();
        this.rateLimitRedisScript = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        
        // Find matching rule (ordered by path length descending to prioritize more specific paths)
        Optional<RateLimitProperties.RateLimitRule> matchingRule = properties.getRules().stream()
                .sorted((r1, r2) -> Integer.compare(r2.getPath().length(), r1.getPath().length()))
                .filter(rule -> pathMatcher.match(rule.getPath(), uri))
                .findFirst();

        if (matchingRule.isPresent()) {
            RateLimitProperties.RateLimitRule rule = matchingRule.get();
            String clientIp = getClientIp(request);
            String redisKey = "rate_limit:" + clientIp + ":" + rule.getPath();
            
            long now = System.currentTimeMillis();
            long windowMillis = rule.getWindowSeconds() * 1000L;
            long limit = rule.getLimit();
            String member = now + ":" + UUID.randomUUID().toString();

            try {
                Long result = redisTemplate.execute(
                        rateLimitRedisScript,
                        Collections.singletonList(redisKey),
                        String.valueOf(now),
                        String.valueOf(windowMillis),
                        String.valueOf(limit),
                        member
                );

                if (result == null || result == 0) {
                    log.warn("RATE LIMIT VIOLATION - Client IP: '{}', Path: '{}' matches Rule: '{}', Count exceeded limit of {} requests per {}s",
                            clientIp, uri, rule.getPath(), limit, rule.getWindowSeconds());
                    
                    resolver.resolveException(
                            request,
                            response,
                            null,
                            new TooManyRequestsException("Rate limit exceeded for " + rule.getPath() + ". Please try again later.")
                    );
                    return;
                }
            } catch (Exception e) {
                // Fail-safe: if Redis is unavailable, let the request proceed to avoid breaking APIs
                log.error(" Redis rate limiting check failed. Bypassing check.", e);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
