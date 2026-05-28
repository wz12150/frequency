package com.freqmanage.module.system.dto;

import lombok.Data;

@Data
public class DictDataCreateDTO {
    private String typeId;
    private String label;
    private String value;
    private Integer sort;
    private String status;
    private String remark;
}
