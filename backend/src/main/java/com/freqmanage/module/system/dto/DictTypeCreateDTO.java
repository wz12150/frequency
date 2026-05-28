package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class DictTypeCreateDTO {
    private String name;
    private String code;
    private String description;
    private String status;
}
