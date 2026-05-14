package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class UserCreateDTO {
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String roleId;
    private String orgId;
    private String status;
}