package com.freqmanage.module.system.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DictTypeVO {
    private String guid;
    private String name;
    private String code;
    private String description;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
