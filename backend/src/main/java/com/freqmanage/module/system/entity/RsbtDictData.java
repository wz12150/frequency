package com.freqmanage.module.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_dict_data")
public class RsbtDictData {

    @TableId(type = IdType.ASSIGN_UUID)
    private String guid;

    private String typeId;

    private String label;

    private String value;

    private Integer sort;

    private String status;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
