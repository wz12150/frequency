package com.freqmanage.module.system.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoleCreateDTO {
    private String name;
    private String description;
    private String status;
    private List<String> permissions;
}