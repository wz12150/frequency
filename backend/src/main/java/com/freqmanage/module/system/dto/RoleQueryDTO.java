package com.freqmanage.module.system.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class RoleQueryDTO extends com.freqmanage.common.QueryParam {
    private String name;
    private String status;
}