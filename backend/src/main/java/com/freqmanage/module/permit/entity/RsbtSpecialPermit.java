package com.freqmanage.module.permit.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("RSBT_SPECIAL_PERMIT")
public class RsbtSpecialPermit {
    @TableId("GUID")
    private String guid;
    private String consent;
    private String interlocutor;
    private String category;
    private String legal;
    private String type;
    private LocalDate startdate;
    private LocalDate enddate;
    private String scope;
    private String process;
    private String status;
    private String code;
    private LocalDate decisiondate;
    private String decision;
    private String note;
    private String register;
    private String address;
    private String phone;
    private String email;
    private String administrativeinfo;
    private String directorname;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
