package co.edu.uan.fraudguard.alertquery.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
