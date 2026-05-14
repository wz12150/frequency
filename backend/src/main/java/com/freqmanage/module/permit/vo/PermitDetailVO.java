package com.freqmanage.module.permit.vo;

import lombok.Data;

import java.util.List;

@Data
public class PermitDetailVO {
    private PermitVO permit;
    private List<FrequencyVO> frequencies;
    private List<StationPermitVO> stations;
}