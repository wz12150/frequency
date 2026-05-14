package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class UserPasswordDTO {
    private String oldPassword;
    private String newPassword;
}