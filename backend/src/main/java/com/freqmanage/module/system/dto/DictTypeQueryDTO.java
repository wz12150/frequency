package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class DictTypeQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private String name;
    private String code;
}
