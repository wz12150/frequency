package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class DictDataQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String typeId;
    private String keyword;
    private String label;
    private String value;
}
