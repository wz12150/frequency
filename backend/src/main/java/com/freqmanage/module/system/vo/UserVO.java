package com.freqmanage.module.system.vo;

import lombok.Data;

@Data
public class UserVO {
    private String guid;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String roleId;
    private String roleName;
    private String orgId;
    private String orgName;
    private String status;
}