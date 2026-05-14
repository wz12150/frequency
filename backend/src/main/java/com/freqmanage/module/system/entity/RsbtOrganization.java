package com.freqmanage.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("RSBT_ORGANIZATION")
public class RsbtOrganization {
    @TableId("GUID")
    private String guid;
    private String parentId;
    private String name;
    private String code;
    private String type;
    private String region;
    private String address;
    private String contact;
    private String phone;
    private String email;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}