package com.freqmanage.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("RSBT_ROLE")
public class RsbtRole {
    @TableId("GUID")
    private String guid;
    private String name;
    private String description;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}