package com.freqmanage.module.permit.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PermitUpdateDTO {
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
}