package com.freqmanage.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("RSBT_ROLE_PERMISSION")
public class RsbtRolePermission {
    @TableId("GUID")
    private String guid;
    private String roleId;
    private String permissionKey;
    private LocalDateTime createTime;
}