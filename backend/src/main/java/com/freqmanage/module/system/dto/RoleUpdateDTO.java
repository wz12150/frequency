package com.freqmanage.module.system.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoleUpdateDTO {
    private String name;
    private String description;
    private String status;
    private List<String> permissions;
}