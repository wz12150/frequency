package com.freqmanage.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("RSBT_USER")
public class RsbtUser {
    @TableId("GUID")
    private String guid;
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String roleId;
    private String orgId;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}