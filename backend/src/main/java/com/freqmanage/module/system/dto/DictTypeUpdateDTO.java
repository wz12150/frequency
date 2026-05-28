package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class DictTypeUpdateDTO {
    private String name;
    private String code;
    private String description;
    private String status;
}
