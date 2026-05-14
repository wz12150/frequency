package com.freqmanage.module.system.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class OrganizationQueryDTO extends com.freqmanage.common.QueryParam {
    private String name;
    private String code;
    private String type;
    private String region;
}