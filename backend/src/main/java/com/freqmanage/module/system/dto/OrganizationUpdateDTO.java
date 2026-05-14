package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class OrganizationUpdateDTO {
    private String parentId;
    private String name;
    private String code;
    private String type;
    private String region;
    private String address;
    private String contact;
    private String phone;
    private String email;
    private String status;
}