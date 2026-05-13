package com.freqmanage.module.statistics.vo;

import lombok.Data;

@Data
public class ExpiredStationVO {
    private String guid;
    private String name;           // sitename
    private String province;
    private String type;          // stationtype
    private Integer month;         // 过期月份（1-12）
    private Integer expiredCount;  // 该月过期数量（每条记录是1个站，所以固定为1）
    private String expireDate;     // expirationdate 字符串
    private String technicalStandard;  // technology
    private String bandwidthProcessingUnitModel;  // bbumodel
    private String ownerName;      // unit（设台单位）
    private String backhaulNetworkAccessMethod;  // backbone
    private String stationPurpose; // stationpurpose
    private String modulationType; // modulation
    private String stationType;    // stationtype
    private String transmitFrequency;  // frequencyt + " MHz"
    private String receiveFrequency;  // frequencyr + " MHz"
    private String bandwidth;      // bandwidth
    private String equipmentNameAndModel;  // devicemodel
    private String equipmentCount;  // devicequantity
    private String equipmentPower;  // outputpower + " W"
    private String antennaType;     // anttype
    private String antennaCount;    // antquantity
    private String region;          // province
    private String detailedLocation;  // location
    private String longitude;
    private String latitude;
    private String openDate;        // startdate
}