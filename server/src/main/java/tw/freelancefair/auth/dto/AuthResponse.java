package tw.freelancefair.auth.dto;

public record AuthResponse(String token, UserResponse user) {}
