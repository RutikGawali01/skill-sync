package com.rutik.skill_sync_backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
@EnableCaching
public class RedisConfig implements CachingConfigurer {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.data.redis.timeout:2000ms}")
    private String redisTimeout;

    @Value("${spring.data.redis.ssl.enabled:false}")
    private boolean redisSsl;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        log.info("Initializing LettuceConnectionFactory pointing to Redis at {}:{}", redisHost, redisPort);
        
        RedisStandaloneConfiguration redisStandaloneConfig = new RedisStandaloneConfiguration();
        redisStandaloneConfig.setHostName(redisHost);
        redisStandaloneConfig.setPort(redisPort);
        if (redisPassword != null && !redisPassword.isBlank()) {
            redisStandaloneConfig.setPassword(redisPassword);
        }

        Duration commandTimeout = parseTimeout(redisTimeout);
        log.info("Redis Command Timeout configured as: {} ms", commandTimeout.toMillis());

        LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder = LettuceClientConfiguration.builder()
                .commandTimeout(commandTimeout);

        if (redisSsl || (redisHost != null && redisHost.contains("upstash.io")) || redisPort == 6380) {
            log.info("Enabling SSL for Redis connection to {}", redisHost);
            clientConfigBuilder.useSsl();
        }

        LettuceClientConfiguration clientConfig = clientConfigBuilder.build();

        return new LettuceConnectionFactory(redisStandaloneConfig, clientConfig);
    }

    private Duration parseTimeout(String timeoutStr) {
        if (timeoutStr == null || timeoutStr.isBlank()) {
            return Duration.ofMillis(2000);
        }
        String clean = timeoutStr.trim().toLowerCase();
        try {
            if (clean.endsWith("ms")) {
                return Duration.ofMillis(Long.parseLong(clean.substring(0, clean.length() - 2).trim()));
            } else if (clean.endsWith("s")) {
                return Duration.ofSeconds(Long.parseLong(clean.substring(0, clean.length() - 1).trim()));
            } else {
                return Duration.ofMillis(Long.parseLong(clean));
            }
        } catch (NumberFormatException e) {
            log.warn("️ Failed to parse Redis timeout: '{}'. Using default of 2000ms.", timeoutStr, e);
            return Duration.ofMillis(2000);
        }
    }


    public ObjectMapper redisObjectMapper() {
        log.info("Creating custom ObjectMapper for Redis serialization");
        ObjectMapper mapper = new ObjectMapper();
        
        // Support Java 8 Time API
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Configure default typing to preserve type information in JSON.
        // BasicPolymorphicTypeValidator allows Object.class as base type securely.
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType(Object.class)
                .build();
        mapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.EVERYTHING, JsonTypeInfo.As.PROPERTY);

        // Fail-safe deserialization
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        return mapper;
    }


    @Bean
    public GenericJackson2JsonRedisSerializer genericJackson2JsonRedisSerializer() {
        return new GenericJackson2JsonRedisSerializer(redisObjectMapper());
    }


    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory,
            GenericJackson2JsonRedisSerializer serializer) {
        
        log.info("Creating RedisTemplate bean with String key serializer and GenericJackson2JsonRedisSerializer value serializer");
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();

        // Keys are serialized as strings
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Values are serialized as JSON
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }


    @Bean
    public CacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            GenericJackson2JsonRedisSerializer serializer,
            RedisCacheProperties cacheProperties) {

        log.info("Initializing CacheManager. Cache Defaults: TTL = {} seconds, Null Caching = disabled", cacheProperties.getDefaultTtl());

        // Default configuration: JSON serialization, custom TTL, disable null caching
        RedisCacheConfiguration defaultCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(cacheProperties.getDefaultTtl()))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .disableCachingNullValues();

        // Individual cache TTL configurations
        Map<String, RedisCacheConfiguration> initialCacheConfigurations = new HashMap<>();
        if (cacheProperties.getTtls() != null) {
            cacheProperties.getTtls().forEach((cacheName, ttlSeconds) -> {
                log.info("Configuring Cache: '{}' with TTL: {} seconds", cacheName, ttlSeconds);
                RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofSeconds(ttlSeconds))
                        .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                        .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                        .disableCachingNullValues();
                initialCacheConfigurations.put(cacheName, cacheConfig);
            });
        }

        RedisCacheManager redisCacheManager = RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultCacheConfig)
                .withInitialCacheConfigurations(initialCacheConfigurations)
                .transactionAware()
                .build();

        return new LoggingCacheManager(redisCacheManager);
    }


    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis Cache GET failed for key: '{}' in cache: '{}'. Falling back to database: {}",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Redis Cache PUT failed for key: '{}' in cache: '{}'. Skipping cache write: {}",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis Cache EVICT failed for key: '{}' in cache: '{}': {}",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Redis Cache CLEAR failed for cache: '{}': {}",
                        cache != null ? cache.getName() : "unknown", exception.getMessage());
            }
        };
    }

    @Bean
    public CommandLineRunner verifyRedisConnection(RedisConnectionFactory connectionFactory) {
        return args -> {
            try {
                log.info("Testing connection to Redis host: {} and port: {}...", redisHost, redisPort);
                String pingResult = connectionFactory.getConnection().ping();
                log.info("Successfully connected to Redis! PING Response: {}", pingResult);
            } catch (Exception e) {
                log.error(" ERROR: Failed to connect to Redis during startup at {}:{}. Caching will fail if Redis is offline.",
                        redisHost, redisPort, e);
            }
        };
    }
}
