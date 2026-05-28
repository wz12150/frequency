package com.freqmanage.module.system.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DictDataVO {
    private String guid;
    private String typeId;
    private String typeName;
    private String label;
    private String value;
    private Integer sort;
    private String status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
