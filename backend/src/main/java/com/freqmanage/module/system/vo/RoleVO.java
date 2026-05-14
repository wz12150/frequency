package com.freqmanage.module.system.vo;

import lombok.Data;

import java.util.List;

@Data
public class RoleVO {
    private String guid;
    private String name;
    private String description;
    private String status;
    private List<String> permissions;
    private Integer userCount;
}