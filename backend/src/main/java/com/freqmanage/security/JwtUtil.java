package com.freqmanage.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String SECRET = "frequency-management-system-secret-key-2026-very-long";
    private static final long EXPIRE = 24 * 60 * 60 * 1000L;
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String generate(String username) {
        Date now = new Date();
        return Jwts.builder().subject(username).issuedAt(now).expiration(new Date(now.getTime() + EXPIRE)).signWith(key).compact();
    }

    public String parseUsername(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return claims.getSubject();
    }
}
