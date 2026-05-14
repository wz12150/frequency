package com.freqmanage.module.system.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserQueryDTO extends com.freqmanage.common.QueryParam {
    private String username;
    private String name;
    private String roleId;
    private String orgId;
    private String status;
}