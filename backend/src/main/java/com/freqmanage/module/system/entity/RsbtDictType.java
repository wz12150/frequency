package com.freqmanage.module.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_dict_type")
public class RsbtDictType {

    @TableId(type = IdType.ASSIGN_UUID)
    private String guid;

    private String name;

    private String code;

    private String description;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
