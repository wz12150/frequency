/*
 Navicat Premium Data Transfer

 Source Server         : MySQL8.0.43
 Source Server Type    : MySQL
 Source Server Version : 80043
 Source Host           : localhost:3306
 Source Schema         : freqmanage

 Target Server Type    : MySQL
 Target Server Version : 80043
 File Encoding         : 65001

 Date: 28/05/2026 01:15:31
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for rsbt_organization
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_organization`;
CREATE TABLE `rsbt_organization`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `PARENT_ID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '父组织ID',
  `NAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '组织名称',
  `CODE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '组织代码',
  `TYPE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类型',
  `REGION` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '区域',
  `ADDRESS` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '地址',
  `CONTACT` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '联系人',
  `PHONE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '电话',
  `EMAIL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `STATUS` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'active' COMMENT '状态: active-激活, inactive-禁用',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE,
  UNIQUE INDEX `idx_code`(`CODE`) USING BTREE,
  INDEX `idx_parent_id`(`PARENT_ID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '组织表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rsbt_organization
-- ----------------------------
INSERT INTO `rsbt_organization` VALUES ('org-001', NULL, '蒙古通信委员会', 'CRC', 'Hub', 'Ulaanbaatar', 'Government Building, Ulaanbaatar', 'John Smith', '+976-11-123111', 'info@crc.mn', 'active', '2026-05-07 16:12:57', '2026-05-07 16:32:45', 0);

-- ----------------------------
-- Table structure for rsbt_plannning
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_plannning`;
CREATE TABLE `rsbt_plannning`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `RADIOSERVICES` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '无线业务',
  `SUBSERVICES` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '子业务',
  `LEVEL` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '等级',
  `SEGMENTNAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '频段名称',
  `STARTFREQUENCY` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `STOPFREQUENCY` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `STEP` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `BANDWIDTH` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `REMARK` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '频率规划表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rsbt_plannning
-- ----------------------------
INSERT INTO `rsbt_plannning` VALUES ('1', '5.53 5.54', NULL, '2-p', 'Below 8.3 kHz', NULL, NULL, NULL, NULL, '(Allocation not made)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('10', 'RADIONAVIGATION', NULL, '1-p', '84-86 kHz', '84kHz', '86kHz', NULL, NULL, 'Used for radionavigation services operating in the LF band.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('100', 'AERONAUTICAL MOBILE(OR)', NULL, '1-p', '8965-9040 kHz', '8965kHz', '9040kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for regulating flight movements performed outside of international and national air transport flight routes.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('101', 'FIXED', NULL, '1-p', '9040-9305 kHz', '9040kHz', '9305kHz', NULL, NULL, 'Used for long-distance radio communication in Fixed format on HF bands.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('102', 'Radiolocation 5.145A', NULL, '2-p', '9305-9355 kHz', '9305kHz', '9355kHz', NULL, NULL, '5.145B', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('103', 'FIXED', NULL, '1-p', '9355-9400 kHz', '9355kHz', '9400kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('104', '5.146', NULL, '2-p', '9400-9500 kHz', '9400kHz', '9500kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('105', '5.147', NULL, '2-p', '9500-9900 kHz', '9500kHz', '9900kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('106', 'FIXED', NULL, '1-p', '9900-9995 kHz', '9900kHz', '9995kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('107', '5.111', NULL, '2-p', '9995-10003 kHz', '9995kHz', '10003kHz', NULL, NULL, 'STANDARD FREQUENCY AND TIME SIGNAL (10000 kHz)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('108', 'Space research', NULL, '2-p', '10003-10005 kHz', '10003kHz', '10005kHz', NULL, NULL, '5.111', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('109', '5.111', NULL, '2-p', '10005-10100 kHz', '10005kHz', '10100kHz', NULL, NULL, 'AERONAUTICAL MOBILE (R)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('11', 'MARITIME MOBILE 5.57', NULL, '1-p', '86-90 kHz', '86kHz', '90kHz', NULL, NULL, 'RADIONAVIGATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('110', 'Amateur', NULL, '2-p', '10100-10150 kHz', '10100kHz', '10150kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('111', 'Mobile except aeronautical mobile (R)', NULL, '2-p', '10150-11175 kHz', '10150kHz', '11175kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('112', 'AERONAUTICAL MOBILE(OR)', NULL, '1-p', '11175-11275 kHz', '11175kHz', '11275kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for regulating flight movements performed outside of international and national air transport flight routes.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('113', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '11275-11400 kHz', '11275kHz', '11400kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for the regularity and safety of international and national air transport flights.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('114', 'FIXED', NULL, '1-p', '11400-11600 kHz', '11400kHz', '11600kHz', NULL, NULL, 'Used for long-distance radio communication in Fixed format on HF bands.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('115', '5.146', NULL, '2-p', '11600-11650 kHz', '11600kHz', '11650kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('116', '5.147', NULL, '2-p', '11650-12050 kHz', '11650kHz', '12050kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('117', '5.146', NULL, '2-p', '12050-12100 kHz', '12050kHz', '12100kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('118', 'FIXED', NULL, '1-p', '12100-12230 kHz', '12100kHz', '12230kHz', NULL, NULL, 'Used for long-distance radio communication in Fixed format on HF bands.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('119', 'MOBILE', NULL, '1-p', '12230-13200 kHz', '12230kHz', '13200kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('12', 'Fixed', NULL, '2-p', '90-110 kHz', '90kHz', '110kHz', NULL, NULL, '5.64', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('120', 'AERONAUTICAL MOBILE(OR)', NULL, '1-p', '13200-13260 kHz', '13200kHz', '13260kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for regulating flight movements performed outside of international and national air transport flight routes.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('121', 'AERONAUTICAL MOBILE(R)', NULL, '1-p', '13260-13360 kHz', '13260kHz', '13360kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for the regularity and safety of international and national air transport flights.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('122', 'RADIO ASTRONOMY', NULL, '1-p', '13360-13410 kHz', '13360kHz', '13410kHz', NULL, NULL, '5.149', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('123', 'FIXED', NULL, '1-p', '13410-13450 kHz', '13410kHz', '13450kHz', NULL, NULL, 'Mobile except aeronautical mobile (R)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('124', 'Mobile except aeronautical mobile (R)', NULL, '2-p', '13450-13550 kHz', '13450kHz', '13550kHz', NULL, NULL, 'Radiolocation 5.132A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('125', 'Mobile except aeronautical mobile (R)', NULL, '2-p', '13550-13570 kHz', '13550kHz', '13570kHz', NULL, NULL, '5.150', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('126', '5.151', NULL, '2-p', '13570-13600 kHz', '13570kHz', '13600kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('127', 'BROADCASTING', NULL, '1-p', '13600-13800 kHz', '13600kHz', '13800kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('128', '5.151', NULL, '2-p', '13800-13870 kHz', '13800kHz', '13870kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('129', 'Mobile except aeronautical mobile (R)', NULL, '2-p', '13870-14000 kHz', '13870kHz', '14000kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('13', 'MARITIME MOBILE', NULL, '1-p', '110-112 kHz', '110kHz', '112kHz', NULL, NULL, 'RADIONAVIGATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('130', 'AMATEUR-SATELLITE', NULL, '1-p', '14000-14250 kHz', '14000kHz', '14250kHz', NULL, NULL, 'AMATEUR', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('131', '5.152', NULL, '2-p', '14250-14350 kHz', '14250kHz', '14350kHz', NULL, NULL, 'AMATEUR', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('132', 'Mobile except aeronautical mobile (R)', NULL, '2-p', '14350-14990 kHz', '14350kHz', '14990kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('133', '5.111', NULL, '2-p', '14990-15005 kHz', '14990kHz', '15005kHz', NULL, NULL, 'STANDARD FREQUENCY AND TIME SIGNAL (15000 kHz)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('134', 'Space research', NULL, '2-p', '15005-15010 kHz', '15005kHz', '15010kHz', NULL, NULL, 'STANDARD FREQUENCY AND TIME SIGNAL', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('135', 'AERONAUTICAL MOBILE(OR)', NULL, '1-p', '15010-15100 kHz', '15010kHz', '15100kHz', NULL, NULL, 'Used in accordance with the National Allocation.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('136', 'BROADCASTING', NULL, '1-p', '15100-15600 kHz', '15100kHz', '15600kHz', NULL, NULL, 'DRM radio technology can be used.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('137', '5.146', NULL, '2-p', '15600-15800 kHz', '15600kHz', '15800kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('138', '5.153', NULL, '2-p', '15800-1600 kHz', '15800kHz', '1600kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('139', 'Radiolocation 5.145A', NULL, '2-p', '16100-16200 kHz', '16100kHz', '16200kHz', NULL, NULL, '5.145B', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('14', 'RADIONAVIGATION 5.60', NULL, '1-p', '112-115 kHz', '112kHz', '115kHz', NULL, NULL, 'RADIONAVIGATION 5.60', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('140', 'FIXED', NULL, '1-p', '16200-16360 kHz', '16200kHz', '16360kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('141', 'FIXED', NULL, '1-p', '16360-17410 kHz', '16360kHz', '17410kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('142', 'FIXED', NULL, '1-p', '17410-17480 kHz', '17410kHz', '17480kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('143', '5.146', NULL, '2-p', '17480-17550 kHz', '17480kHz', '17550kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('144', 'BROADCASTING', NULL, '1-p', '17550-17900 kHz', '17550kHz', '17900kHz', NULL, NULL, '-', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('145', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '17900-17970 kHz', '17900kHz', '17970kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for the regularity and safety of international and national air transport flights.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('146', 'AERONAUTICAL MOBILE(OR)', NULL, '1-p', '17970-18030 kHz', '17970kHz', '18030kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for regulating flight movements performed outside of international and national air transport flight routes.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('147', 'FIXED', NULL, '1-p', '18030-18052 kHz', '18030kHz', '18052kHz', NULL, NULL, 'Used for long-distance radio communication in Fixed format on HF bands.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('148', 'FIXED', NULL, '1-p', '18052-18068 kHz', '18052kHz', '18068kHz', NULL, NULL, 'Space research', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('149', 'AMATEUR-SATELLITE', NULL, '1-p', '18068-18168 kHz', '18068kHz', '18168kHz', NULL, NULL, '5.154', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('15', 'Fixed', NULL, '2-p', '115-117.6 kHz', '115kHz', '117.6kHz', NULL, NULL, 'Maritime mobile', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('150', 'Mobile except aeronautical mobile', NULL, '2-p', '18168-18780 kHz', '18168kHz', '18780kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('151', 'FIXED', NULL, '1-p', '18780-18900 kHz', '18780kHz', '18900kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('152', '5.146', NULL, '2-p', '18900-19020 kHz', '18900kHz', '19020kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('153', 'FIXED', NULL, '1-p', '19020-19680 kHz', '19020kHz', '19680kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('154', NULL, NULL, '2-p', '19680-19800 kHz', '19680kHz', '19800kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('155', 'FIXED', NULL, '1-p', '19800-19990 kHz', '19800kHz', '19990kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('156', 'Space research', NULL, '2-p', '19990-19995 kHz', '19990kHz', '19995kHz', NULL, NULL, '5.111', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('157', NULL, NULL, '2-p', '19995-20010 kHz', '19995kHz', '20010kHz', NULL, NULL, '5.111', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('158', 'Mobile', NULL, '2-p', '20010-21000 kHz', '20010kHz', '21000kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('159', 'AMATEUR-SATELLITE', NULL, '1-p', '21000-21450 kHz', '21000kHz', '21450kHz', NULL, NULL, 'AMATEUR', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('16', 'MARITIME MOBILE', NULL, '1-p', '117.6-126 kHz', '117.6kHz', '126kHz', NULL, NULL, 'RADIONAVIGATION 5.60', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('160', 'BROADCASTING', NULL, '1-p', '21450-21850 kHz', '21450kHz', '21850kHz', NULL, NULL, 'DRM digital radio technology can be used.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('161', '5.155', NULL, '2-p', '21850-21870 kHz', '21850kHz', '21870kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('162', 'FIXED', NULL, '1-p', '21870-21924 kHz', '21870kHz', '21924kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('163', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '21924-22000 kHz', '21924kHz', '22000kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for the regularity and safety of international and national air transport flights.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('164', '5.156', NULL, '2-p', '22000-22855 kHz', '22000kHz', '22855kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('165', '5.156', NULL, '2-p', '22855-23000 kHz', '22855kHz', '23000kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('166', 'Mobile except aeronautical mobile (R)', NULL, '2-p', '23000-23200 kHz', '23000kHz', '23200kHz', NULL, NULL, '5.156', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('167', 'AERONAUTICAL MOBILE (OR)', NULL, '1-p', '23200-23350 kHz', '23200kHz', '23350kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('168', 'MOBILE', 'except aeronautical mobile', '2-p', '23350-24000 kHz', '23350kHz', '24000kHz', NULL, NULL, '5.157', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('169', 'FIXED', NULL, '1-p', '24000-24450 kHz', '24000kHz', '24450kHz', NULL, NULL, 'LAND MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('17', 'RADIONAVIGATION', NULL, '1-p', '126-129 kHz', '126kHz', '129kHz', NULL, NULL, 'Used for radionavigation services operating in the LF band.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('170', 'LAND MOBILE', NULL, '1-p', '24450-24600 kHz', '24450kHz', '24600kHz', NULL, NULL, 'Radiolocation 5.132A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('171', 'LAND MOBILE', NULL, '1-p', '24600-24890 kHz', '24600kHz', '24890kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('172', 'AMATEUR-SATELLITE', NULL, '1-p', '24890-24990 kHz', '24890kHz', '24990kHz', NULL, NULL, 'AMATEUR 5.120', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('173', 'STANDARD FREQUENCY AND TIME SIGNAL (25000kHz)', NULL, '2-p', '24990-25005 kHz', '24990kHz', '25005kHz', NULL, NULL, 'Used for carrier frequency 25000 kHz to transmit signals for global time system coordination.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('174', 'Space research', NULL, '2-p', '25005-25010 kHz', '25005kHz', '25010kHz', NULL, NULL, 'STANDARD FREQUENCY AND TIME SIGNAL', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('175', 'MOBILE', 'except aeronautical mobile', '2-p', '25010-25070 kHz', '25010kHz', '25070kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('176', 'FIXED', NULL, '1-p', '25070-25210 kHz', '25070kHz', '25210kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('177', 'MOBILE', 'except aeronautical mobile', '2-p', '25210-25550 kHz', '25210kHz', '25550kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('178', '5.149', NULL, '2-p', '25550-25670 kHz', '25550kHz', '25670kHz', NULL, NULL, 'RADIO ASTRONOMY', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('179', 'BROADCASTING', NULL, '1-p', '25670-26100 kHz', '25670kHz', '26100kHz', NULL, NULL, 'DRM radio technology can be used.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('18', 'MARITIME MOBILE', NULL, '1-p', '129-130 kHz', '129kHz', '130kHz', NULL, NULL, 'RADIONAVIGATION 5.60', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('180', NULL, NULL, '2-p', '26100-26175 kHz', '26100kHz', '26175kHz', NULL, NULL, '5.132', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('181', 'MOBILE', 'except aeronautical mobile', '2-p', '26175-26200 kHz', '26175kHz', '26200kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('182', 'MOBILE', 'except aeronautical mobile', '2-p', '26200-26350 kHz', '26200kHz', '26350kHz', NULL, NULL, 'Radiolocation 5.132A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('183', 'MOBILE', 'except aeronautical mobile', '2-p', '26350-27500 kHz', '26350kHz', '27500kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('184', 'FIXED', NULL, '1-p', '27.5-28 MHz', '27.5MHz', '28MHz', NULL, NULL, 'MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('185', 'AMATEUR-SATELLITE', NULL, '1-p', '28-29.7 MHz', '28MHz', '29.7MHz', NULL, NULL, 'AMATEUR', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('186', 'MOBILE', NULL, '1-p', '29.7-30.005 MHz', '29.7MHz', '30.005MHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('187', 'FIXED', NULL, '1-p', '30.005-30.01 MHz', '30.005MHz', '30.01MHz', NULL, NULL, 'MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('188', 'MOBILE', NULL, '1-p', '30.01-37.5 MHz', '30.01MHz', '37.5MHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('189', 'MOBILE', NULL, '1-p', '37.5-38.25 MHz', '37.5MHz', '38.25MHz', NULL, NULL, 'Radio astronomy 5.149', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('19', 'MARITIME MOBILE', NULL, '1-p', '130-135.7 kHz', '130kHz', '135.7kHz', NULL, NULL, '5.64 5.67', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('190', 'MOBILE', NULL, '1-p', '38.25-39 MHz', '38.25MHz', '39MHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('191', 'MOBILE', NULL, '1-p', '39-39.5 MHz', '39MHz', '39.5MHz', NULL, NULL, 'Radiolocation 5.132A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('192', 'MOBILE', NULL, '1-p', '39.5-39.986 MHz', '39.5MHz', '39.986MHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('193', 'MOBILE', NULL, '1-p', '39.986- 40 MHz', '39.986MHz', '40MHz', NULL, NULL, 'Space research', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('194', 'MOBILE', NULL, '1-p', '40-40.02 MHz', '40MHz', '40.02MHz', NULL, NULL, 'Earth exploration-satellite (active) 5.159A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('195', 'MOBILE 5.159A', NULL, '1-p', '40.02-40.98 MHz', '40.02MHz', '40.98MHz', NULL, NULL, '5.150', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('196', 'MOBILE', NULL, '1-p', '41.015-42 MHz', '41.015MHz', '42MHz', NULL, NULL, 'Earth exploration-satellite (active) 5.159A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('197', 'MOBILE', NULL, '1-p', '42-42.5 MHz', '42MHz', '42.5MHz', NULL, NULL, 'Earth exploration-satellite (active) 5.159A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('198', 'MOBILE', NULL, '1-p', '42.5-44 MHz', '42.5MHz', '44MHz', NULL, NULL, 'Earth exploration-satellite (active) 5.159A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('199', 'MOBILE', NULL, '1-p', '44-47 MHz', '44MHz', '47MHz', NULL, NULL, 'Earth exploration-satellite (active) 5.159A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('2', '5.54B 5.54C', NULL, '1-p', '8.3-9 kHz', '8.3kHz', '9kHz', NULL, NULL, 'METEOROLOGICAL AIDS SERVICE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('20', 'MARITIME MOBILE', NULL, '1-p', '135.7-137.8 kHz', '135.7kHz', '137.8kHz', NULL, NULL, 'Amateur 5.67A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('200', 'Earth exploration-satellite (active) 5.159A', NULL, '2-p', '47-50 MHz', '47MHz', '50MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('201', 'Amateur 5.166B 5.166C 5.166D 5.166E 5.169B', NULL, '2-p', '50-52 MHz', '50MHz', '52MHz', NULL, NULL, '5.162A 5.164 5.165 5.166A 5.169 5.169A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('202', NULL, NULL, '2-p', '52-68 MHz', '52MHz', '68MHz', NULL, NULL, '5.162A 5.163 5.164 5.165', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('203', 'MOBILE', 'except aeronautical mobile', '2-p', '68-74.8 MHz', '68MHz', '74.8MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('204', '5.180 5.181', NULL, '2-p', '74.8-75.2 MHz', '74.8MHz', '75.2MHz', NULL, NULL, 'AERONAUTICAL RADIONAVIGATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('205', 'FIXED', NULL, '1-p', '75.2-87.5 MHz', '75.2MHz', '87.5MHz', NULL, NULL, 'MOBILE except aeronautical mobile', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('206', 'BROADCASTING', NULL, '1-p', '87.5 -100 MHz', '87.5MHz', '100MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('207', 'BROADCASTING', NULL, '1-p', '100-108 MHz', '100MHz', '108MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('208', 'AERONAUTICAL RADIONAVIGATION', NULL, '1-p', '108-117.975 MHz', '108MHz', '117.975MHz', NULL, NULL, '5.197 5.197A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('209', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '117.975-137 MHz', '117.975MHz', '137MHz', NULL, NULL, 'AERONAUTICAL MOBILE-SATELLITE (R) 5.198A 5.198B', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('21', 'MARITIME MOBILE', NULL, '1-p', '137.8-148.5 kHz', '137.8kHz', '148.5kHz', NULL, NULL, '5.64 5.67', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('210', 'METEOROLOGICAL-SATELLITE', 'space-to-Earth', '2-p', '137-137.025 MHz', '137MHz', '137.025MHz', NULL, NULL, 'MOBILE-SATELLITE (space-to-Earth) 5.208A 5.208B 5.209', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('211', 'METEOROLOGICAL-SATELLITE', 'space-to-Earth', '2-p', '137.025-137.175 MHz', '137.025MHz', '137.175MHz', NULL, NULL, 'SPACE RESEARCH (space-to-Earth)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('212', 'METEOROLOGICAL-SATELLITE', '460793', '1-p', '137.175-137.825 MHz', '137.175MHz', '137.825MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('213', 'METEOROLOGICAL-SATELLITE', 'space-to-Earth', '2-p', '137.825-138 MHz', '137.825MHz', '138MHz', NULL, NULL, 'SPACE RESEARCH (space-to-Earth)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('214', NULL, NULL, '2-p', '138-143.5 MHz', '138MHz', '143.5MHz', NULL, NULL, '5.210 5.211 5.212 5.214', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('215', 'SPACE RESEARCH (', 'space-to-Earth', '2-p', '143.5-143.65 MHz', '143.5MHz', '143.65MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('216', NULL, NULL, '2-p', '143.65-144 MHz', '143.65MHz', '144MHz', NULL, NULL, '5.210 5.211 5.212 5.214', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('217', 'AMATEUR-SATELLITE', NULL, '1-p', '144-146 MHz', '144MHz', '146MHz', NULL, NULL, '5.126', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('218', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '146-148 MHz', '146MHz', '148MHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('219', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '148-149.9 MHz', '148MHz', '149.9MHz', NULL, NULL, 'MOBILE-SATELLITE (Earth-to-space) 5.209', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('22', NULL, NULL, '2-p', '148.5-255 kHz', '148.5kHz', '255kHz', NULL, NULL, '5.68 5.69 5.70', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('220', 'MOBILE-SATELLITE (E', 'arth-to-space)', '2-p', '149.9-150.05 MHz', '149.9MHz', '150.05MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('221', 'MOBILE', 'except aeronautical mobile', '2-p', '150.05-153 MHz', '150.05MHz', '153MHz', NULL, NULL, 'RADIO ASTRONOMY', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('222', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '153-154 MHz', '153MHz', '154MHz', NULL, NULL, 'Meteorological aids', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('223', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '154-156.4875 MHz', '154MHz', '156.4875MHz', NULL, NULL, '5.225A 5.226', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('224', '5.111 5.226 5.227', NULL, '2-p', '156.4875-156.5625 MHz', '156.4875MHz', '156.5625MHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('225', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '156.5625-156.7625 MHz', '156.5625MHz', '156.7625MHz', NULL, NULL, '5.226', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('226', 'Mobile-satellite (Earth-to-space)', NULL, '2-p', '156.7625-156.7875 MHz', '156.7625MHz', '156.7875MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('227', NULL, NULL, '2-p', '156.7875-156.8125 MHz', '156.7875MHz', '156.8125MHz', NULL, NULL, '5.111 5.226', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('228', 'Mobile-satellite (Earth-to-space)', NULL, '2-p', '156.8125-156.8375 MHz', '156.8125MHz', '156.8375MHz', NULL, NULL, '5.111 5.226 5.228', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('229', 'MOBILE', 'except aeronautical mobile', '2-p', '156.8375-157.1875 MHz', '156.8375MHz', '157.1875MHz', NULL, NULL, '5.226', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('23', 'AERONAUTICAL RADIONAVIGATION', NULL, '1-p', '255-283.5 kHz', '255kHz', '283.5kHz', NULL, NULL, '5.70', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('230', 'MOBILE', 'except aeronautical mobile', '2-p', '157.1875-157.3375 MHz', '157.1875MHz', '157.3375MHz', NULL, NULL, 'Maritime mobile-satellite 5.208A 5.208B 5.228AB 5.228AC', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('231', 'MOBILE', 'except aeronautical mobile', '2-p', '157.3375-161.7875 MHz', '157.3375MHz', '161.7875MHz', NULL, NULL, '5.226', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('232', 'MOBILE', 'except aeronautical Mobile', '2-p', '161.7875-161.9375 MHz', '161.7875MHz', '161.9375MHz', NULL, NULL, 'Maritime mobile-satellite 5.208A 5.208B 5.228AB 5.228AC', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('233', 'MOBILE', 'except aeronautical mobile', '2-p', '161.9375-161.9625 MHz', '161.9375MHz', '161.9625MHz', NULL, NULL, 'Maritime mobile-satellite (Earth-to-space) 5.228AA', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('234', 'MOBILE', 'exc[...]', '2-p', '161.9625-161.9875 MHz', '161.9625MHz', '161.9875MHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('24', 'AERONAUTICAL RADIONAVIGATION', NULL, '1-p', '283.5-315 kHz', '283.5kHz', '315kHz', NULL, NULL, 'MARITIME RADIONAVIGATION (radiobeacons) 5.73', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('25', 'Maritime radionavigation (radiobeacons) 5.73', NULL, '2-p', '315-325 kHz', '315kHz', '325kHz', NULL, NULL, '5.75', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('26', NULL, NULL, '2-p', '325-405 kHz', '325kHz', '405kHz', NULL, NULL, 'AERONAUTICAL RADIONAVIGATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('27', NULL, NULL, '2-p', '405-415 kHz', '405kHz', '415kHz', NULL, NULL, 'RADIONAVIGATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('28', 'AERONAUTICAL RADIONAVIGATION', NULL, '1-p', '415-435 kHz', '415kHz', '435kHz', NULL, NULL, 'AERONAUTICAL RADIONAVIGATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('29', 'MARITIME MOBILE 5.79', NULL, '1-p', '435-472 kHz', '435kHz', '472kHz', NULL, NULL, 'Aeronautical radionavigation 5.77', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('3', 'RADIONAVIGATION', NULL, '1-p', '9-11.3 kHz', '9kHz', '11.3kHz', NULL, NULL, 'METEOROLOGICAL AIDS SERVICE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('30', 'Amateur 5.80A', NULL, '2-p', '472-479 kHz', '472kHz', '479kHz', NULL, NULL, 'Aeronautical radionavigation 5.77 5.80', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('31', 'Aeronautical radionavigation 5.77', NULL, '2-p', '479-495 kHz', '479kHz', '495kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('32', NULL, NULL, '2-p', '495-505 kHz', '495kHz', '505kHz', NULL, NULL, 'MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('33', 'MARITIME MOBILE 5.79 5.79A 5.84', NULL, '1-p', '505-526.5 kHz', '505kHz', '526.5kHz', NULL, NULL, 'AERONAUTICAL RADIONAVIGATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('34', NULL, NULL, '2-p', '526.5-1606.5 kHz', '526.5kHz', '1606.5kHz', NULL, NULL, '5.87 5.87A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('35', 'MARITIME MOBILE 5.90', NULL, '1-p', '1606.5-1 625 kHz', NULL, NULL, NULL, NULL, 'LAND MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('36', NULL, NULL, '2-p', '1625-1635 kHz', '1625kHz', '1635kHz', NULL, NULL, '5.93', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('37', 'MARITIME MOBILE 5.90', NULL, '1-p', '1635-1800 kHz', '1635kHz', '1800kHz', NULL, NULL, 'LAND MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('38', '5.93', NULL, '2-p', '1800-1810 kHz', '1800kHz', '1810kHz', NULL, NULL, 'RADIOLOCATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('39', 'AMATEUR', NULL, '1-p', '1810-1850 kHz', '1810kHz', '1850kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('4', 'RADIONAVIGATION', NULL, '1-p', '11.3-14 kHz', '11.3kHz', '14kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('40', 'MOBILE', 'except aeronautical mobile', '2-p', '1850-2000 kHz', '1850kHz', '2000kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('41', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '2000-2025 kHz', '2000kHz', '2025kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('42', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '2025-2045 kHz', '2025kHz', '2045kHz', NULL, NULL, 'Meteorological aids 5.104', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('43', 'MARITIME MOBILE', NULL, '1-p', '2045-2160 kHz', '2045kHz', '2160kHz', NULL, NULL, 'LAND MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('44', '5.93 5.107', NULL, '2-p', '2160-2170 kHz', '2160kHz', '2170kHz', NULL, NULL, 'RADIOLOCATION', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('45', 'FIXED', NULL, '1-p', '2170-2173.5 kHz', '2170kHz', '2173.5kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('46', NULL, NULL, '2-p', '2173.5-2190.5 kHz', '2173.5kHz', '2190.5kHz', NULL, NULL, '5.108 5.109 5.110 5.111', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('47', 'FIXED', NULL, '1-p', '2190.5-2194 kHz', '2190.5kHz', '2194kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('48', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '2194-2300 kHz', '2194kHz', '2300kHz', NULL, NULL, '5.92 5.103 5.112', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('49', 'FIXED', NULL, '1-p', '2300-2498 kHz', '2300kHz', '2498kHz', NULL, NULL, 'MOBILE except aeronautical mobile (R)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('5', 'MARITIME MOBILE 5.57', NULL, '1-p', '14-19.95 kHz', '14kHz', '19.95kHz', NULL, NULL, '5.55 5.56', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('50', 'STANDARD FREQUENCY AND TIME SIGNAL (2 500kHz)', NULL, '2-p', '2498-2501 kHz', '2498kHz', '2501kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('51', 'Space Research', NULL, '2-p', '2501-2502 kHz', '2501kHz', '2502kHz', NULL, NULL, 'STANDARD FREQUENCY AND TIME SIGNAL', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('52', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '2502-2625 kHz', '2502kHz', '2625kHz', NULL, NULL, '5.92 5.103 5.114', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('53', 'MARITIME RADIONAVIGATION', NULL, '1-p', '2625-2650 kHz', '2625kHz', '2650kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('54', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '2650-2850 kHz', '2650kHz', '2850kHz', NULL, NULL, '5.92 5.103', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('55', NULL, NULL, '2-p', '2850-3025 kHz', '2850kHz', '3025kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('56', NULL, NULL, '2-p', '3025-3155 kHz', '3025kHz', '3155kHz', NULL, NULL, 'AERONAUTICAL MOBILE (OR)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('57', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '3155-3200 kHz', '3155kHz', '3200kHz', NULL, NULL, '5.116 5.117', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('58', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '3200-3230 kHz', '3200kHz', '3230kHz', NULL, NULL, 'BROADCASTING 5.113', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('59', 'MOBILE', 'except aeronautical mobile', '2-p', '3230-3400 kHz', '3230kHz', '3400kHz', NULL, NULL, 'BROADCASTING 5.113', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('6', 'STANDARD FREQUENCY AND TIME SIGNAL (20kHz)', NULL, '2-p', '19.95-20.05 kHz', '19.95kHz', '20.05kHz', NULL, NULL, 'Used for carrier frequency 20 kHz to transmit time signals for global time system coordination.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('60', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '3400-3500 kHz', '3400kHz', '3500kHz', NULL, NULL, 'AERONAUTICAL MOBILE (R)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('61', 'FIXED', NULL, '1-p', '3500-3800 kHz', '3500kHz', '3800kHz', NULL, NULL, 'MOBILE except aeronautical mobile', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('62', 'AERONAUTICAL MOBILE (OR)', NULL, '1-p', '3800-3900 kHz', '3800kHz', '3900kHz', NULL, NULL, 'LAND MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('63', '5.123', NULL, '2-p', '3900-3950 kHz', '3900kHz', '3950kHz', NULL, NULL, 'AERONAUTICAL MOBILE (OR)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('64', 'BROADCASTING', NULL, '1-p', '3950-4000 kHz', '3950kHz', '4000kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('65', 'MARITIME MOBILE 5.127', NULL, '1-p', '4000-4063 kHz', '4000kHz', '4063kHz', NULL, NULL, '5.126', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('66', '5.128', NULL, '2-p', '4063-4438 kHz', '4063kHz', '4438kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('67', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '4438-4488 kHz', '4438kHz', '4488kHz', NULL, NULL, 'Radiolocation 5.132A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('68', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '4488-4650 kHz', '4488kHz', '4650kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('69', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '4650-4700 kHz', '4650kHz', '4700kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for the regularity and safety of international and national air transport flights.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('7', 'MARITIME MOBILE 5.57', NULL, '1-p', '20.05-70 kHz', '20.05kHz', '70kHz', NULL, NULL, '5.56 5.58', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('70', 'AERONAUTICAL MOBILE(OR)', NULL, '1-p', '4700-4750 kHz', '4700kHz', '4750kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for regulating flight movements performed outside of international and national air transport flight routes.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('71', 'AERONAUTICAL MOBILE (OR)', NULL, '1-p', '4750-4850 kHz', '4750kHz', '4850kHz', NULL, NULL, 'LAND MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('72', 'LAND MOBILE', NULL, '1-p', '4850-4995 kHz', '4850kHz', '4995kHz', NULL, NULL, 'BROADCASTING 5.113', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('73', 'STANDARD FREQUENCY AND TIME SIGNAL (5000kHz)', NULL, '2-p', '4995-5003 kHz', '4995kHz', '5003kHz', NULL, NULL, 'Used for carrier frequency 5000 kHz to transmit time signals for time system.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('74', 'Space research', NULL, '2-p', '5003-5005 kHz', '5003kHz', '5005kHz', NULL, NULL, 'STANDARD FREQUENCY AND TIME SIGNAL', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('75', 'FIXED', NULL, '1-p', '5005-5060 kHz', '5005kHz', '5060kHz', NULL, NULL, 'BROADCASTING 5.113', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('76', 'Mobile except aeronautical mobile 5.133', NULL, '2-p', '5060-5250 kHz', '5060kHz', '5250kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('77', 'MOBILE', 'except aeronautical mobile', '2-p', '5250-5275 kHz', '5250kHz', '5275kHz', NULL, NULL, 'Radiolocation 5.132A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('78', 'MOBILE', 'except aeronautical mobile', '2-p', '5275-5351.5 kHz', '5275kHz', '5351.5kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('79', 'MOBILE', 'except aeronautical mobile', '2-p', '5351.5-5366.5 kHz', '5351.5kHz', '5366.5kHz', NULL, NULL, 'Amateur 5.133B', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('8', 'RADIONAVIGATION', NULL, '1-p', '70-72 kHz', '70kHz', '72kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('80', 'MOBILE', 'except aeronautical mobile', '2-p', '5366.5-5450 kHz', '5366.5kHz', '5450kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('81', 'AERONAUTICAL MOBILE (OR)', NULL, '1-p', '5450-5480 kHz', '5450kHz', '5480kHz', NULL, NULL, 'LAND MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('82', NULL, NULL, '2-p', '5480-5680 kHz', '5480kHz', '5680kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('83', NULL, NULL, '2-p', '5680-5730 kHz', '5680kHz', '5730kHz', NULL, NULL, 'AERONAUTICAL MOBILE (OR)', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('84', 'LAND MOBILE', NULL, '1-p', '5730-5900 kHz', '5730kHz', '5900kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('85', '5.136', NULL, '2-p', '5900-5950 kHz', '5900kHz', '5950kHz', NULL, NULL, 'BROADCASTING', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('86', 'BROADCASTING', NULL, '1-p', '5950-6200 kHz', '5950kHz', '6200kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('87', NULL, NULL, '2-p', '6200-6525 kHz', '6200kHz', '6525kHz', NULL, NULL, NULL, '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('88', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '6525-6685 kHz', '6525kHz', '6685kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for the regularity and safety of international and national air transport flights.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('89', 'AERONAUTICAL MOBILE (OR)', NULL, '1-p', '6685-6765 kHz', '6685kHz', '6765kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for regulating flight movements performed outside of international and national air transport flight routes.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('9', 'MARITIME MOBILE 5.57', NULL, '1-p', '72-84 kHz', '72kHz', '84kHz', NULL, NULL, 'RADIONAVIGATION 5.60', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('90', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '6765-7000 kHz', '6765kHz', '7000kHz', NULL, NULL, '5.138', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('91', 'AMATEUR-SATELLITE', NULL, '1-p', '7000-7100 kHz', '7000kHz', '7100kHz', NULL, NULL, '5.140 5.141 5.141A', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('92', 'AMATEUR', NULL, '1-p', '7100-7200 kHz', '7100kHz', '7200kHz', NULL, NULL, '5.141A 5.141B', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('93', 'BROADCASTING', NULL, '1-p', '7200-7300 kHz', '7200kHz', '7300kHz', NULL, NULL, 'DRM digital radio can be used.', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('94', NULL, NULL, '2-p', '7300-7400 kHz', '7300kHz', '7400kHz', NULL, NULL, '5.143 5.143A 5.413B 4.143C 5.143D', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('95', NULL, NULL, '2-p', '7400-7450 kHz', '7400kHz', '7450kHz', NULL, NULL, '5.143B 5.143C', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('96', 'MOBILE', 'except aeronautical mobile (R)', '2-p', '7450-8100 kHz', '7450kHz', '8100kHz', NULL, NULL, '5.144', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('97', 'FIXED', NULL, '1-p', '8100-8195 kHz', '8100kHz', '8195kHz', NULL, NULL, 'MARITIME MOBILE', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('98', '5.111', NULL, '2-p', '8195-8815 kHz', '8195kHz', '8815kHz', NULL, NULL, 'FIXED', '2026-05-12 11:59:22', NULL, 0);
INSERT INTO `rsbt_plannning` VALUES ('99', 'AERONAUTICAL MOBILE (R)', NULL, '1-p', '8815-8965 kHz', '8815kHz', '8965kHz', NULL, NULL, 'Used for aeronautical mobile communication service designated for the regularity and safety of international and national air transport flights.', '2026-05-12 11:59:22', NULL, 0);

-- ----------------------------
-- Table structure for rsbt_role
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_role`;
CREATE TABLE `rsbt_role`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色名称',
  `DESCRIPTION` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '描述',
  `STATUS` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'active' COMMENT '状态: active-激活, inactive-禁用',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE,
  UNIQUE INDEX `idx_name`(`NAME`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rsbt_role
-- ----------------------------
INSERT INTO `rsbt_role` VALUES ('role-admin', 'ADMIN', '系统管理员', 'active', '2026-05-07 16:12:57', NULL, 0);
INSERT INTO `rsbt_role` VALUES ('role-user', 'USER', '普通用户', 'active', '2026-05-07 16:12:57', NULL, 0);

-- ----------------------------
-- Table structure for rsbt_role_permission
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_role_permission`;
CREATE TABLE `rsbt_role_permission`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `ROLE_ID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色ID',
  `PERMISSION_KEY` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限标识',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`GUID`) USING BTREE,
  UNIQUE INDEX `idx_role_permission`(`ROLE_ID`, `PERMISSION_KEY`) USING BTREE,
  INDEX `idx_role_id`(`ROLE_ID`) USING BTREE,
  INDEX `idx_permission_key`(`PERMISSION_KEY`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rsbt_role_permission
-- ----------------------------
INSERT INTO `rsbt_role_permission` VALUES ('09fe43eb-dc81-4f6a-8c5c-356adc2b266d', 'role-user', 'planning', '2026-05-09 08:30:15');
INSERT INTO `rsbt_role_permission` VALUES ('23717589-6a1b-465e-a62e-3b317f01b179', 'role-user', 'stations', '2026-05-09 08:30:15');
INSERT INTO `rsbt_role_permission` VALUES ('434445ee-ebef-4c66-bfb0-53a52938d235', 'role-user', 'dashboard', '2026-05-09 08:30:15');
INSERT INTO `rsbt_role_permission` VALUES ('4c6ad2b4-9dbf-419c-8676-3b4e4175b25c', 'role-admin', 'stations', '2026-05-09 08:25:02');
INSERT INTO `rsbt_role_permission` VALUES ('67c3a126-ff3c-4a95-9f0e-ffc0471faee7', 'role-admin', 'dashboard', '2026-05-09 08:25:02');
INSERT INTO `rsbt_role_permission` VALUES ('badf2573-5552-4150-b5b4-3345eae8d1df', 'role-admin', 'reports', '2026-05-09 08:25:02');
INSERT INTO `rsbt_role_permission` VALUES ('cf9dc9d4-345f-419f-b195-c6afd37b4edc', 'role-user', 'licenses', '2026-05-09 08:30:15');
INSERT INTO `rsbt_role_permission` VALUES ('df951da8-cc51-452d-8745-19be06a9bd3d', 'role-admin', 'planning', '2026-05-09 08:25:02');
INSERT INTO `rsbt_role_permission` VALUES ('e7714ab6-6c0f-436c-91be-14174f69a8a1', 'role-user', 'reports', '2026-05-09 08:30:15');
INSERT INTO `rsbt_role_permission` VALUES ('f4a1c04f-b016-4b7b-93c1-8f978acdccff', 'role-admin', 'system', '2026-05-09 08:25:02');
INSERT INTO `rsbt_role_permission` VALUES ('fb578555-094f-42bd-99f7-bcf4773a5dcb', 'role-admin', 'licenses', '2026-05-09 08:25:02');

-- ----------------------------
-- Table structure for rsbt_special_permit
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_special_permit`;
CREATE TABLE `rsbt_special_permit`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `CONSENT` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '许可决定',
  `INTERLOCUTOR` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '对话者',
  `CATEGORY` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类别',
  `LEGAL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '法律依据',
  `TYPE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类型',
  `STARTDATE` date NULL DEFAULT NULL COMMENT '开始日期',
  `ENDDATE` date NULL DEFAULT NULL COMMENT '结束日期',
  `SCOPE` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '范围',
  `PROCESS` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流程',
  `STATUS` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '状态: active-有效, expired-过期, revoked-撤销',
  `CODE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '许可证号',
  `DECISIONDATE` date NULL DEFAULT NULL COMMENT '决定日期',
  `DECISION` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '决定',
  `NOTE` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `REGISTER` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '登记人',
  `ADDRESS` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '地址',
  `PHONE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '电话',
  `EMAIL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `ADMINISTRATIVEINFO` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '行政信息',
  `DIRECTORNAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '负责人姓名',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '频率授权主表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rsbt_special_permit
-- ----------------------------
INSERT INTO `rsbt_special_permit` VALUES ('LIC-001', 'Approved', 'Ministry of Digital Affairs', 'Commercial', 'Radio Law Article 25', 'Broadcasting', '2025-01-15', '2028-01-14', 'Ulaanbaatar Central Area', 'Standard', 'active', 'LIC2025-001', '2025-01-10', 'Grant permission', 'Standard broadcasting license', 'Bat Erdene', 'Peace Avenue 12, Ulaanbaatar', '+976-11-321456', 'bat.erdene@mda.gov.mn', 'Commercial Broadcasting', 'Dorligjav', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-002', 'Approved', 'Communications Authority', 'Telecommunications', 'Telecom Law Section 18', 'Mobile', '2025-02-01', '2027-02-01', 'Nationwide coverage', 'Express', 'active', 'LIC2025-002', '2025-01-28', 'Grant permission', '4G mobile network license', 'Saruul', 'Olympic Street 45, Ulaanbaatar', '+976-11-654321', 'saruul@ca.gov.mn', 'Mobile Services', 'Tsend', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-003', 'Approved', 'Spectrum Commission', 'Satellite', 'Space Act Article 12', 'Satellite', '2024-06-01', '2029-06-01', 'National territory', 'Complex', 'active', 'LIC2024-003', '2024-05-25', 'Grant permission', 'Satellite communication license', 'Ariunaa', ' Government House 8, Ulaanbaatar', '+976-11-789012', 'ariunaa@sc.gov.mn', 'Satellite Services', 'Gantulga', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-004', 'Approved', 'Radio Authority', 'Amateur', 'Radio Regulations Article 8', 'Amateur', '2025-03-10', '2028-03-09', 'Nationwide', 'Simple', 'active', 'LIC2025-004', '2025-03-05', 'Grant permission', 'Amateur radio license', 'Zoloo', 'Bayan Tower 22, Ulaanbaatar', '+976-11-456789', 'zoloo@ra.gov.mn', 'Amateur Services', 'MGL', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-005', 'Approved', 'Ministry of Digital Affairs', 'Commercial', 'Radio Law Article 26', 'TV Broadcasting', '2024-09-01', '2027-09-01', 'Khovd province', 'Standard', 'active', 'LIC2024-005', '2024-08-25', 'Grant permission', 'Regional TV license', 'Nomin', 'Khovd Main Street 15', '+976-94-234567', 'nomin@khovd.tv', 'Regional TV Broadcasting', 'Tseren', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-006', 'Approved', 'Communications Authority', 'Data Services', 'Telecom Law Section 20', 'ISP', '2025-01-20', '2028-01-20', 'Ulaanbaatar area', 'Standard', 'active', 'LIC2025-006', '2025-01-15', 'Grant permission', 'Internet service provider license', 'Enkhtaivan', 'Seoul Street 100, Ulaanbaatar', '+976-11-876543', 'enkhtai@isp.mn', 'ISP Services', 'Ariuka', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-007', 'Expired', 'Spectrum Commission', 'Microwave', 'Microwave Regulations Article 5', 'Point to Point', '2023-05-01', '2025-05-01', 'Ulaanbaatar to Darkhan', 'Complex', 'expired', 'LIC2023-007', '2023-04-25', 'Grant permission', 'Microwave link license expired', 'Mongol', 'Central Tower 33, Ulaanbaatar', '+976-11-234567', 'mongol@microwave.mn', 'Microwave Links', 'Sengoo', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-008', 'Approved', 'Radio Authority', 'Public Safety', 'Public Safety Act Article 15', 'Emergency', '2025-02-15', '2028-02-15', 'Nationwide', 'Priority', 'active', 'LIC2025-008', '2025-02-10', 'Grant permission', 'Emergency services license', 'Ganzorig', 'Emergency Center 5, Ulaanbaatar', '+976-11-112233', 'ganzorig@emergency.mn', 'Emergency Communications', 'Tuvdendorj', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-009', 'Approved', 'Ministry of Digital Affairs', 'Commercial', 'Radio Law Article 27', 'FM Radio', '2024-11-01', '2027-11-01', 'Darhan city', 'Standard', 'active', 'LIC2024-009', '2024-10-25', 'Grant permission', 'FM radio broadcasting license', 'Otgon', 'Darhan Industrial Street 88', '+976-97-345678', 'otgon@fm.mn', 'FM Broadcasting', 'Batsaikhan', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-010', 'Approved', 'Communications Authority', 'Wireless Broadband', 'Broadband Law Article 10', 'WBB', '2025-01-05', '2030-01-05', 'Nationwide', 'Complex', 'active', 'LIC2025-010', '2025-01-01', 'Grant permission', 'Wireless broadband license', 'Sarantsetseg', 'Innovation Park 12, Ulaanbaatar', '+976-11-567890', 'sarantsetseg@wbb.mn', 'Wireless Broadband', 'Enkhbayar', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-011', 'Approved', 'Spectrum Commission', 'Aviation', 'Aviation Law Article 30', 'Aeronautical', '2025-03-01', '2028-03-01', 'All airports', 'Standard', 'active', 'LIC2025-011', '2025-02-25', 'Grant permission', 'Aeronautical communication license', 'Tsetseg', 'Chinggis Khaan Airport', '+976-11-998877', 'tsetseg@airport.mn', 'Aviation Services', 'Jargal', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-012', 'Revoked', 'Radio Authority', 'Commercial', 'Radio Law Article 28', 'Radio', '2024-01-01', '2026-01-01', 'Selenge province', 'Standard', 'revoked', 'LIC2024-012', '2023-12-20', 'Revoke permission', 'License revoked due to non-compliance', 'Baatar', 'Selenge Office 4', '+976-98-123456', 'baatar@radio.mn', 'Radio Broadcasting', 'Namjil', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-013', 'Approved', 'Ministry of Digital Affairs', 'Maritime', 'Maritime Law Article 22', 'Maritime', '2025-02-20', '2028-02-20', 'Mongolia coastal', 'Standard', 'active', 'LIC2025-013', '2025-02-15', 'Grant permission', 'Maritime communication license', 'Oyun', 'Lake Khovd Resort 77', '+976-94-876543', 'oyun@maritime.mn', 'Maritime Services', 'Gantulga', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-014', 'Approved', 'Communications Authority', 'Railway', 'Railway Law Article 18', 'Railway', '2024-12-01', '2027-12-01', 'Ulaanbaatar to Sainshand', 'Standard', 'active', 'LIC2024-014', '2024-11-25', 'Grant permission', 'Railway communication license', 'Tsend', 'Railway Station 1, Ulaanbaatar', '+976-11-345678', 'tsend@railway.mn', 'Railway Communications', 'Munkh', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-015', 'Approved', 'Spectrum Commission', 'Scientific', 'Science Law Article 14', 'Research', '2025-01-10', '2027-01-10', 'National research centers', 'Simple', 'active', 'LIC2025-015', '2025-01-05', 'Grant permission', 'Scientific research license', 'Amgalan', 'Science Park 20, Ulaanbaatar', '+976-11-234890', 'amgalan@science.mn', 'Research Services', 'Tsetseg', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-016', 'Approved', 'Radio Authority', 'Commercial', 'Radio Law Article 29', 'Community Radio', '2025-04-01', '2028-04-01', 'Arkhangai province', 'Simple', 'active', 'LIC2025-016', '2025-03-25', 'Grant permission', 'Community radio license', 'Tseren', 'Tsetserleg City 55', '+976-93-567890', 'tseren@community.mn', 'Community Media', 'Ariun', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-017', 'Approved', 'Ministry of Digital Affairs', '5G Services', '5G Regulations Article 5', '5G', '2025-01-01', '2030-01-01', 'Ulaanbaatar pilot zone', 'Priority', 'active', 'LIC2025-017', '2024-12-25', 'Grant permission', '5G pilot license', 'Munkhbat', '5G Tower 1, Ulaanbaatar', '+976-11-777888', 'munkhbat@5g.mn', '5G Services', 'Tuguldur', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-018', 'Expired', 'Communications Authority', 'Cable TV', 'Cable Law Article 16', 'Cable', '2022-06-01', '2025-06-01', 'Darkhan city', 'Standard', 'expired', 'LIC2022-018', '2022-05-25', 'Grant permission', 'Cable TV license expired', 'Suld', 'Darkhan Mall 3rd floor', '+976-97-234567', 'suld@cable.mn', 'Cable TV', 'Gana', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-019', 'Approved', 'Spectrum Commission', 'Police', 'Police Law Article 35', 'Police', '2025-03-15', '2028-03-15', 'Nationwide', 'Priority', 'active', 'LIC2025-019', '2025-03-10', 'Grant permission', 'Police communication license', 'Narangerel', 'Police HQ 9, Ulaanbaatar', '+976-11-119110', 'narangerel@police.mn', 'Police Services', 'Tsendpurev', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-020', 'Approved', 'Radio Authority', 'Weather', 'Weather Service Act Article 8', 'Weather', '2025-02-10', '2028-02-10', 'All weather stations', 'Standard', 'active', 'LIC2025-020', '2025-02-05', 'Grant permission', 'Weather station license', 'Uugan', 'Weather Center 12, Ulaanbaatar', '+976-11-456123', 'uugan@weather.mn', 'Weather Services', 'MGLkh', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-021', 'Approved', 'Ministry of Digital Affairs', 'Educational', 'Education Law Article 40', 'Educational', '2025-01-25', '2028-01-25', 'National universities', 'Standard', 'active', 'LIC2025-021', '2025-01-20', 'Grant permission', 'Educational broadcasting license', 'Odsuren', 'National University Campus', '+976-11-321654', 'odsuren@edu.mn', 'Educational Services', 'Tseren', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-022', 'Approved', 'Communications Authority', 'IoT Services', 'IoT Law Article 12', 'IoT', '2025-04-15', '2029-04-15', 'Smart city pilot', 'Express', 'active', 'LIC2025-022', '2025-04-10', 'Grant permission', 'IoT network license', 'Ankhbayar', 'Tech Hub 44, Ulaanbaatar', '+976-11-890123', 'ankhbayar@iot.mn', 'IoT Services', 'Gantulga', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-023', 'Approved', 'Spectrum Commission', 'Forestry', 'Forestry Law Article 20', 'Forestry', '2025-03-20', '2028-03-20', 'Khan Khentii protected area', 'Standard', 'active', 'LIC2025-023', '2025-03-15', 'Grant permission', 'Forestry communication license', 'Tungalag', 'Khan Khentii Office 6', '+976-96-345678', 'tungalag@forestry.mn', 'Forestry Services', 'Ariunaz', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-024', 'Approved', 'Radio Authority', 'Mining', 'Mining Law Article 45', 'Mining', '2025-02-25', '2028-02-25', 'Oyu Tolgoi site', 'Priority', 'active', 'LIC2024-024', '2025-02-20', 'Grant permission', 'Mining communication license', 'Sainsana', 'Oyu Tolgoi Camp 1', '+976-94-567890', 'sainsana@mining.mn', 'Mining Services', 'Tuguldur', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-025', 'Approved', 'Ministry of Digital Affairs', 'Defense', 'Defense Law Article 55', 'Defense', '2025-01-30', '2028-01-30', 'Strategic locations', 'Classified', 'active', 'LIC2025-025', '2025-01-25', 'Grant permission', 'Defense communication license', 'Galsan', 'Defense HQ 88, Ulaanbaatar', '+976-11-991122', 'galsan@defense.mn', 'Defense Services', 'Tseren', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-026', 'Approved', 'Communications Authority', 'Agriculture', 'Agriculture Law Article 30', 'Agriculture', '2025-04-10', '2028-04-10', 'Central provinces', 'Standard', 'active', 'LIC2025-026', '2025-04-05', 'Grant permission', 'Agriculture monitoring license', 'Menda', 'Agricultural Center 18, Ulaanbaatar', '+976-11-654321', 'menda@agri.mn', 'Agriculture Services', 'Saruul', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-027', 'Expired', 'Spectrum Commission', 'Diplomatic', 'Diplomatic Law Article 25', 'Diplomatic', '2024-04-01', '2025-04-01', 'Embassy district', 'Diplomatic', 'expired', 'LIC2024-027', '2024-03-25', 'Grant permission', 'Diplomatic license expired', 'Ariuna', 'Embassy Row 15', '+976-11-778899', 'ariuna@diplo.mn', 'Diplomatic Services', 'Gantugs', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-028', 'Approved', 'Radio Authority', 'Transportation', 'Transport Law Article 35', 'Transport', '2024-12-05', '2026-06-05', 'Bus fleet nationwide', 'Standard', 'expired', 'LIC2025-028', '2025-02-28', 'Grant permission', 'Fleet communication license', 'Tsend', 'Transport Terminal 5, Ulaanbaatar', '+976-11-345890', 'tsend@transport.mn', 'Transport Services', 'Munkhjin', '2026-05-13 23:07:25', '2026-05-14 01:00:00', 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-029', 'Approved', 'Ministry of Digital Affairs', 'Emergency', 'Emergency Law Article 22', 'Disaster', '2025-02-05', '2028-02-05', 'All provinces', 'Priority', 'active', 'LIC2025-029', '2025-02-01', 'Grant permission', 'Disaster management license', 'Altanzul', 'Disaster Center 10, Ulaanbaatar', '+976-11-113355', 'altanzul@disaster.mn', 'Emergency Services', 'Tsetseg', '2026-05-13 23:07:25', NULL, 0);
INSERT INTO `rsbt_special_permit` VALUES ('LIC-030', 'Approved', 'Communications Authority', 'Banking', 'Banking Law Article 60', 'Banking', '2025-01-15', '2028-01-15', 'All bank branches', 'High Priority', 'active', 'LIC2025-030', '2025-01-10', 'Grant permission', 'Secure banking communication license', 'Gankhuyag', 'Bank of Mongolia HQ', '+976-11-220099', 'gankhuyag@bank.mn', 'Banking Services', 'Tuguldur', '2026-05-13 23:07:25', NULL, 0);

-- ----------------------------
-- Table structure for rsbt_special_permit_frequency
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_special_permit_frequency`;
CREATE TABLE `rsbt_special_permit_frequency`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `PERMITID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '授权主表ID',
  `FREQUENCY` decimal(18, 6) NULL DEFAULT NULL COMMENT '频率(MHz)',
  `BADNWIDTH` decimal(18, 6) NULL DEFAULT NULL COMMENT '带宽(MHz)',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE,
  INDEX `idx_permit_id`(`PERMITID`) USING BTREE,
  CONSTRAINT `fk_frequency_permit` FOREIGN KEY (`PERMITID`) REFERENCES `rsbt_special_permit` (`GUID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '授权频率扩展表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for rsbt_special_permit_station
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_special_permit_station`;
CREATE TABLE `rsbt_special_permit_station`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `PERMITID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '授权主表ID',
  `QUANTITY` int(0) NULL DEFAULT NULL COMMENT '数量',
  `OUTPUTPOWER` decimal(18, 6) NULL DEFAULT NULL COMMENT '输出功率(W)',
  `TYPE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类型',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE,
  INDEX `idx_permit_id`(`PERMITID`) USING BTREE,
  CONSTRAINT `fk_station_permit` FOREIGN KEY (`PERMITID`) REFERENCES `rsbt_special_permit` (`GUID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '授权台站扩展表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for rsbt_station
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_station`;
CREATE TABLE `rsbt_station`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `TYPE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '类型',
  `TECHNOLOGY` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '技术体制',
  `BBUMODEL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'BBU型号',
  `OWNEDSITE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '归属站址',
  `BACKBONE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '骨干网',
  `STATIONPURPOSE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '台站用途',
  `MODULATION` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '调制方式',
  `STATIONTYPE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '台站类型',
  `FREQUENCYT` decimal(18, 6) NULL DEFAULT NULL COMMENT '发射频率(MHz)',
  `FREQUENCYR` decimal(18, 6) NULL DEFAULT NULL COMMENT '接收频率(MHz)',
  `BANDWIDTH` decimal(18, 6) NULL DEFAULT NULL COMMENT '带宽(MHz)',
  `DEVICEMODEL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备型号',
  `DEVICEQUANTITY` int(0) NULL DEFAULT NULL COMMENT '设备数量',
  `OUTPUTPOWER` decimal(18, 6) NULL DEFAULT NULL COMMENT '输出功率(W)',
  `ANTTYPE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '天线型号',
  `ANTQUANTITY` int(0) NULL DEFAULT NULL COMMENT '天线数量',
  `PROVINCE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '省份',
  `DISTRICT` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '地区',
  `LOCATION` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '详细地址',
  `UNIT` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `EQUIPNAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `SITENAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '站址名称',
  `LONGITUDE` decimal(18, 10) NULL DEFAULT NULL COMMENT '经度',
  `LATITUDE` decimal(18, 10) NULL DEFAULT NULL COMMENT '纬度',
  `STARTDATE` date NULL DEFAULT NULL COMMENT '启用日期',
  `EXPIRATIONDATE` date NULL DEFAULT NULL COMMENT '到期日期',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '台站管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rsbt_station
-- ----------------------------
INSERT INTO `rsbt_station` VALUES ('ST021', 'Mobile', '5G NR', 'AAU5618', 'Site001', 'Backbone', 'Public Mobile', '64QAM', 'Base Station', 3500.000000, 3500.000000, 100.000000, 'Huawei AAU5618', 6, 60.000000, '64T64R Antenna', 6, 'Ulaanbaatar', 'Sukhbaatar', 'Peace Avenue 1', 'Mobicom', NULL, 'Ulaanbaatar Central BTS', 106.9057620000, 47.8863890000, '2025-01-15', '2025-01-15', '2026-05-13 01:27:23', '2026-05-21 15:38:58', 0);
INSERT INTO `rsbt_station` VALUES ('ST022', 'Mobile', 'FDD-LTE', 'BBU5600', 'Site002', 'Backbone', 'Public Mobile', '16QAM', 'Base Station', 2110.000000, 1930.000000, 20.000000, 'ZTE R8884', 6, 40.000000, 'Directional Antenna', 9, 'Ulaanbaatar', 'Bayangol', 'Olympic Street 100', 'Unitel', NULL, 'Bayangol BTS', 106.9195740000, 47.9182930000, '2023-06-20', '2028-06-20', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST023', 'Broadcasting', 'TD-LTE', 'AAU5614', 'Site003', 'Access', 'Industrial Network', '64QAM', 'Small Cell', 2600.000000, 2600.000000, 40.000000, 'Huawei AAU5614', 2, 20.000000, 'Panel Antenna', 4, 'Ulaanbaatar', 'Chingeltei', 'Amar Street 50', 'Skytel', NULL, 'Chingeltei Micro BTS', 106.8956330000, 47.9214550000, '2025-03-01', '2029-03-01', '2026-05-13 01:27:23', '2026-05-21 15:41:52', 0);
INSERT INTO `rsbt_station` VALUES ('ST024', 'Broadcasting', '5G NR', 'LampSite', 'Site004', 'Access', 'Indoor Coverage', '64QAM', 'DAS', 3300.000000, 3300.000000, 100.000000, 'Huawei LampSite', 24, 2.000000, 'Ceiling Antenna', 48, 'Ulaanbaatar', 'Songinokhairkhan', 'Savsky Business Center', 'Mongolia Telecom', NULL, 'Savsky Indoor DAS', 106.7346890000, 47.9182930000, '2024-02-28', '2029-02-28', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST025', 'Mobile', 'TD-LTE', 'BBU5900', 'Site005', 'Backbone', 'Public Mobile', 'QPSK', 'Base Station', 2570.000000, 2370.000000, 20.000000, 'Huawei AAU5613', 4, 40.000000, 'Panel Antenna', 8, 'Darkhan', 'Darkhan', 'Industrial Zone', 'Mobicom', NULL, 'Darkhan Industrial BTS', 105.9595640000, 49.4747040000, '2023-08-10', '2028-08-10', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST026', 'Mobile', 'FDD-LTE', 'BBU5600', 'Site006', 'Backbone', 'Public Mobile', '16QAM', 'Base Station', 1800.000000, 1710.000000, 15.000000, 'Nokia Flexi', 3, 30.000000, 'Directional Antenna', 6, 'Erdenet', 'Erdenet', 'Mining Road 88', 'Unitel', NULL, 'Erdenet Mining BTS', 104.0441670000, 49.0282990000, '2022-11-15', '2027-11-15', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST028', 'Mobile', '5G NR', 'AAU5618', 'Site008', 'Backbone', 'Public Mobile', '64QAM', 'Base Station', 3700.000000, 3700.000000, 100.000000, 'Huawei AAU5618', 6, 60.000000, '64T64R Antenna', 6, 'Ulaanbaatar', 'Nalaikh', 'Nalaikh District', 'Mongolia Telecom', NULL, 'Nalaikh BTS', 107.0466670000, 47.4833330000, '2026-04-20', '2026-04-20', '2026-05-13 01:27:23', '2026-05-21 15:39:02', 0);
INSERT INTO `rsbt_station` VALUES ('ST029', 'Broadcasting', 'FDD-LTE', 'Book RRU', 'Site009', 'Access', 'Indoor Coverage', '16QAM', 'DAS', 2100.000000, 1920.000000, 20.000000, 'Huawei LampSite', 18, 3.000000, 'Omni Antenna', 36, 'Ulaanbaatar', 'Bayanzurkh', 'Gandan Monastery Area', 'Mobicom', NULL, 'Gandan Indoor DAS', 106.8833330000, 47.9166670000, '2023-09-05', '2028-09-05', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST030', 'Mobile', 'FDD-LTE', 'BBU5600', 'Site010', 'Backbone', 'Public Mobile', '16QAM', 'Base Station', 2600.000000, 2500.000000, 20.000000, 'ZTE R8884', 6, 40.000000, 'Panel Antenna', 9, 'Ulaanbaatar', 'Selbe', 'Arboretum Area', 'Unitel', NULL, 'Selbe BTS', 106.7666670000, 47.9500000000, '2023-03-20', '2026-03-20', '2026-05-13 01:27:23', '2026-05-21 15:35:47', 0);
INSERT INTO `rsbt_station` VALUES ('ST031', 'Broadcasting', 'eMTC', 'eNodeB', 'Site011', 'Access', 'IoT', 'QPSK', 'Small Cell', 1800.000000, 1720.000000, 10.000000, 'ZTE R8972', 1, 0.500000, 'Ceiling Antenna', 2, 'Ulgii', 'Bayan-Ulgii', 'Market Square', 'Skytel', NULL, 'Ulgii Market Micro', 91.8666670000, 48.9000000000, '2023-04-25', '2026-04-25', '2026-05-13 01:27:23', '2026-05-21 15:36:43', 0);
INSERT INTO `rsbt_station` VALUES ('ST032', 'Mobile', 'TD-LTE', 'BBU5900', 'Site012', 'Backbone', 'Industrial Network', '16QAM', 'Base Station', 2370.000000, 2570.000000, 20.000000, 'Huawei AAU5613', 4, 30.000000, 'Panel Antenna', 8, 'Ulaanbaatar', 'Khan-Uul', 'Ulaanbaatar Airport', 'Mongolia Telecom', NULL, 'Airport Industrial BTS', 106.7666670000, 47.8333330000, '2026-05-10', '2029-05-10', '2026-05-13 01:27:23', '2026-05-21 15:39:39', 0);
INSERT INTO `rsbt_station` VALUES ('ST033', 'Broadcasting', '5G NR', 'LampSite', 'Site013', 'Access', 'Indoor Coverage', '64QAM', 'DAS', 3600.000000, 3600.000000, 100.000000, 'Huawei LampSite', 24, 2.000000, 'Ceiling Antenna', 48, 'Ulaanbaatar', 'Sukhbaatar', 'Government House', 'Mobicom', NULL, 'Government Indoor DAS', 106.9057620000, 47.8863890000, '2024-06-01', '2029-06-01', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST034', 'Mobile', '', 'BBU5600', 'Site014', '', '', '', 'Macro', 900.000000, 870.000000, 20.000000, 'Nokia Flexi', 3, 40.000000, '', 6, 'Arvayheer', '', '', 'A1', '', 'Arvayheer Central BTS', 103.8333330000, 46.2500000000, '2022-12-18', '2027-12-18', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST035', 'Broadcasting', '5G NR', 'pRRU', 'Site015', 'Access', 'Indoor Coverage', '64QAM', 'Small Cell', 3500.000000, 350000.000000, 100.000000, 'Huawei pRRU', 1, 5.000000, 'Aesthetic Antenna', 2, 'Ulaanbaatar', 'Chingeltei', 'Blue Sky Tower', 'Skytel', NULL, 'Blue Sky Micro BTS', 106.9500000000, 47.9333330000, '2024-07-15', '2026-07-15', '2026-05-13 01:27:23', '2026-05-21 15:35:52', 0);
INSERT INTO `rsbt_station` VALUES ('ST036', 'Mobile', 'TD-LTE', 'BBU5900', 'Site016', 'Backbone', 'Public Mobile', 'QPSK', 'Base Station', 2515.000000, 2635.000000, 20.000000, 'Huawei AAU5613', 3, 20.000000, 'Directional Antenna', 6, 'Ulaanbaatar', 'Bagakhangai', 'Ulaanbaatar IT Park', 'Mobicom', NULL, 'IT Park BTS', 106.8500000000, 47.7666670000, '2023-10-08', '2028-10-08', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST037', 'Broadcasting', 'NB-IoT', 'eNodeB', 'Site017', 'Access', 'IoT', 'QPSK', 'Small Cell', 920.000000, 880.000000, 3.000000, 'Huawei eSite', 1, 0.100000, 'Omni Antenna', 1, 'Ulaanbaatar', 'Songinokhairkhan', 'Modern City Mall', 'Mongolia Telecom', NULL, 'Modern City IoT Micro', 106.7166670000, 47.9166670000, '2023-11-20', '2028-11-20', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST038', 'Mobile', '5G NR', 'AAU5614', 'Site018', 'Backbone', 'Public Mobile', '64QAM', 'Base Station', 4800.000000, 4800.000000, 100.000000, 'Huawei AAU5614', 3, 40.000000, '32T32R Antenna', 3, 'Ulaanbaatar', 'Bayangol', 'National Sports Stadium', 'Unitel', NULL, 'Stadium BTS', 106.9500000000, 47.9166670000, '2024-08-01', '2029-08-01', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST039', 'Broadcasting', 'FDD-LTE', 'Book RRU', 'Site019', 'Access', 'Community Coverage', '16QAM', 'DAS', 2110.000000, 1930.000000, 20.000000, 'Huawei Book RRU', 12, 5.000000, 'Decorative Antenna', 24, 'Ulaanbaatar', 'Sukhbaatar', 'Ulaanbaatar Tower', 'Mobicom', NULL, 'Tower Indoor DAS', 106.9000000000, 47.8833330000, '2023-12-25', '2028-12-25', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST040', 'Mobile', '', 'BBU5600', 'Site020', '', '', '', 'Macro', 1800.000000, 1710.000000, 15.000000, 'ZTE R8884', 4, 40.000000, '', 8, 'Ulaanbaatar', '', '', 'ON', '', 'Industrial Park BTS', 106.8166670000, 47.8166670000, '2024-09-10', '2029-09-10', '2026-05-13 01:27:23', '2026-05-21 14:12:08', 0);
INSERT INTO `rsbt_station` VALUES ('ST061', 'Fixed', 'Microwave', 'RTN-380', 'Site041', 'Backbone', 'Backhaul Link', 'QPSK', 'Microwave Station', 5925.000000, 5925.000000, 40.000000, 'Huawei RTN-380H', 2, 10.000000, 'Parabolic Antenna', 2, 'Ulaanbaatar', 'Sukhbaatar', 'Peace Avenue 50', 'Mongolia Telecom', NULL, 'UB Central Microwave', 106.9050000000, 47.8900000000, '2023-01-10', '2028-01-10', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST062', 'Fixed', 'Microwave', 'RTN-950', 'Site042', 'Backbone', 'Transmission Relay', 'QPSK', 'Microwave Station', 7125.000000, 7125.000000, 40.000000, 'Nokia FlexiPacket MW', 2, 5.000000, 'Parabolic Antenna', 2, 'Selenge', 'Selenge', 'Border Crossing', 'Unitel', NULL, 'Selenge Relay Station', 106.2330000000, 49.7890000000, '2023-03-15', '2028-03-15', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST063', 'Fixed', 'Microwave', 'RTN-380', 'Site043', 'Access', 'Rural Backhaul', '16QAM', 'Microwave Station', 5925.000000, 5925.000000, 40.000000, 'Huawei RTN-380H', 2, 10.000000, 'Parabolic Antenna', 2, 'Dornogovi', 'Dornogovi', 'Sainshand District', 'Skytel', NULL, 'Sainshand Microwave', 109.3210000000, 44.2230000000, '2026-05-20', '2028-05-20', '2026-05-21 14:23:07', '2026-05-21 15:40:33', 0);
INSERT INTO `rsbt_station` VALUES ('ST064', 'Fixed', 'Microwave', 'RTN-950', 'Site044', 'Backbone', 'Industrial Backhaul', 'QPSK', 'Microwave Station', 7750.000000, 7750.000000, 50.000000, 'Nokia FlexiPacket MW', 2, 5.000000, 'Parabolic Antenna', 2, 'Darkhan', 'Darkhan', 'Industrial Zone', 'Mobicom', NULL, 'Darkhan Industrial Microwave', 105.9500000000, 49.4750000000, '2023-07-08', '2028-07-08', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST065', 'Fixed', 'Microwave', 'RTN-380', 'Site045', 'Access', 'Remote Access', '64QAM', 'Microwave Station', 13.000000, 13.000000, 27.000000, 'Huawei RTN-380H', 1, 5.000000, 'Parabolic Antenna', 1, 'Khentii', 'Khentii', 'Eastern Remote Site', 'Mongolia Telecom', NULL, 'Khentii East Microwave', 110.4500000000, 48.3500000000, '2023-09-12', '2025-09-12', '2026-05-21 14:23:07', '2026-05-21 15:36:04', 0);
INSERT INTO `rsbt_station` VALUES ('ST066', 'Others', 'Ku-Band', 'VSAT-9000', 'Site046', 'Access', 'Remote Access', '8PSK', 'Satellite Station', 11.700000, 14.000000, 27.000000, 'Hughes HN9000', 1, 1.000000, 'Dish Antenna', 1, 'Ulaanbaatar', 'Khan-Uul', 'Airport Cargo', 'SkyNet LLC', NULL, 'UB Airport Satellite', 106.8200000000, 47.8400000000, '2022-11-20', '2027-11-20', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST067', 'Others', 'Ka-Band', 'VSAT-7000', 'Site047', 'Access', 'Remote Access', 'QPSK', 'Satellite Station', 18.500000, 30.000000, 500.000000, 'ViaSat Surface', 1, 2.000000, 'Dish Antenna', 1, 'Dornogovi', 'Dornogovi', 'Gobi Mining Site', 'SkyNet LLC', NULL, 'Gobi Mining Satellite', 109.5000000000, 43.9000000000, '2022-12-05', '2027-12-05', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST068', 'Others', 'C-Band', 'Explorer 450', 'Site048', 'Access', 'Emergency Link', 'QPSK', 'Satellite Station', 4.000000, 6.000000, 36.000000, 'NERA Explorer', 1, 1.500000, 'Dish Antenna', 1, 'Ovorkhangai', 'Ovorkhangai', 'Remote Aimag Center', 'Mongolia Telecom', NULL, 'Ovorkhangai Emergency', 103.8333330000, 46.2500000000, '2023-02-28', '2028-02-28', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST069', 'Others', 'Ku-Band', 'VSAT-9000', 'Site049', 'Access', 'Broadcast Contribution', '8PSK', 'Satellite Station', 14.250000, 12.500000, 27.000000, 'Hughes HN9000', 1, 1.000000, 'Dish Antenna', 1, 'Ulgii', 'Bayan-Ulgii', 'Western Regional Center', 'National Broadcasting', NULL, 'Ulgii Broadcast Satellite', 91.8666670000, 48.9000000000, '2023-04-15', '2028-04-15', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST070', 'Others', 'C-Band', 'Explorer 450', 'Site050', 'Access', 'Remote Monitoring', 'QPSK', 'Satellite Station', 4.000000, 6.000000, 36.000000, 'NERA Explorer', 1, 1.500000, 'Dish Antenna', 1, 'Khovd', 'Khovd', 'Altai Mountains', 'Skytel', NULL, 'Khovd Remote Satellite', 91.5000000000, 48.5000000000, '2023-06-20', '2028-06-20', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST071', 'Mobile', '5G NR', 'AAU5618', 'Site051', 'Backbone', 'Public Mobile', '64QAM', 'Base Station', 3500.000000, 3500.000000, 100.000000, 'Huawei AAU5618', 6, 60.000000, '64T64R Antenna', 6, 'Selenge', 'Selenge', 'Railway Station', 'Mobicom', NULL, 'Selenge Railway BTS', 106.5000000000, 49.6000000000, '2024-02-01', '2029-02-01', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST072', 'Mobile', 'FDD-LTE', 'BBU5600', 'Site052', 'Backbone', 'Public Mobile', '16QAM', 'Base Station', 1800.000000, 1710.000000, 20.000000, 'Nokia Flexi', 3, 40.000000, 'Directional Antenna', 6, 'Dornogovi', 'Dornogovi', 'Sainshand City Center', 'Unitel', NULL, 'Sainshand BTS', 109.3210000000, 44.2230000000, '2023-09-15', '2028-09-15', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST073', 'Broadcasting', 'DVB-T2', 'TX-8800', 'Site053', 'Access', 'Regional Broadcast', 'OFDM', 'TV Transmitter', 474.000000, 474.000000, 8.000000, 'Rohde & Schwarz NH7300', 2, 100.000000, 'Omnidirectional', 4, 'Ulaanbaatar', 'Bayangol', 'Central Tower', 'National Broadcasting', NULL, 'UB TV Tower', 106.9500000000, 47.9166670000, '2022-01-20', '2027-01-20', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST074', 'Mobile', 'TD-LTE', 'BBU5900', 'Site054', 'Backbone', 'Public Mobile', 'QPSK', 'Base Station', 2570.000000, 2370.000000, 20.000000, 'Huawei AAU5613', 4, 40.000000, 'Panel Antenna', 8, 'Darkhan', 'Darkhan', 'Mining Area', 'Mobicom', NULL, 'Darkhan Mining BTS', 105.9500000000, 49.4700000000, '2024-01-05', '2029-01-05', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST075', 'Fixed', 'Microwave', 'RTN-380', 'Site055', 'Backbone', 'City Backhaul', '64QAM', 'Microwave Station', 5925.000000, 5925.000000, 40.000000, 'Huawei RTN-380H', 2, 10.000000, 'Parabolic Antenna', 2, 'Erdenet', 'Erdenet', 'City Center', 'Mongolia Telecom', NULL, 'Erdenet City Microwave', 104.0440000000, 49.0280000000, '2023-08-15', '2028-08-15', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST076', 'Others', 'Ku-Band', 'VSAT-9000', 'Site056', 'Access', 'Border Communication', '8PSK', 'Satellite Station', 14.000000, 12.500000, 27.000000, 'Hughes HN9000', 1, 1.000000, 'Dish Antenna', 1, 'Bayan-Ulgii', 'Bayan-Ulgii', 'Border Checkpoint', 'SkyNet LLC', NULL, 'Border Satellite Station', 91.8500000000, 48.8800000000, '2023-10-01', '2028-10-01', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST077', 'Mobile', '5G NR', 'AAU5618', 'Site057', 'Backbone', 'Public Mobile', '64QAM', 'Base Station', 3700.000000, 3700.000000, 100.000000, 'Huawei AAU5618', 6, 60.000000, '64T64R Antenna', 6, 'Ulaanbaatar', 'Nalaikh', 'Nalaikh Industrial', 'Unitel', NULL, 'Nalaikh Industrial BTS', 107.0500000000, 47.4800000000, '2024-03-10', '2029-03-10', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST078', 'Broadcasting', 'FM', 'TX-5000', 'Site058', 'Access', 'FM Radio Broadcast', 'FM', 'FM Transmitter', 104.500000, 104.500000, 0.200000, 'Nautel NX200', 1, 200.000000, 'Omnidirectional', 4, 'Ulaanbaatar', 'Sukhbaatar', 'UB FM Tower', 'National Broadcasting', NULL, 'UB FM Radio', 106.9000000000, 47.8850000000, '2021-06-01', '2026-06-01', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST079', 'Mobile', 'FDD-LTE', 'BBU5600', 'Site059', 'Backbone', 'Public Mobile', '16QAM', 'Base Station', 2100.000000, 1920.000000, 20.000000, 'ZTE R8884', 6, 40.000000, 'Directional Antenna', 9, 'Selenge', 'Altanbulag', 'Border Trade Zone', 'Skytel', NULL, 'Altanbulag BTS', 106.8000000000, 49.6500000000, '2024-04-20', '2029-04-20', '2026-05-21 14:23:07', NULL, 0);
INSERT INTO `rsbt_station` VALUES ('ST080', 'Others', 'Ka-Band', 'VSAT-7000', 'Site060', 'Access', 'Government Emergency', 'QPSK', 'Satellite Station', 20.000000, 30.000000, 500.000000, 'ViaSat Surface', 1, 2.000000, 'Dish Antenna', 1, 'Arkhangai', 'Arkhangai', 'Provincial Center', 'Mongolia Telecom', NULL, 'Arkhangai Government Sat', 103.5000000000, 46.5000000000, '2023-05-01', '2028-05-01', '2026-05-21 14:23:07', NULL, 0);

-- ----------------------------
-- Table structure for rsbt_user
-- ----------------------------
DROP TABLE IF EXISTS `rsbt_user`;
CREATE TABLE `rsbt_user`  (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键ID',
  `USERNAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `PASSWORD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码(Bcrypt加密)',
  `NAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '姓名',
  `EMAIL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `PHONE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '电话',
  `ROLE_ID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '角色ID',
  `ORG_ID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '组织ID',
  `STATUS` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'active' COMMENT '状态: active-激活, inactive-禁用',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `DELETED` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  PRIMARY KEY (`GUID`) USING BTREE,
  UNIQUE INDEX `USERNAME`(`USERNAME`) USING BTREE,
  INDEX `idx_username`(`USERNAME`) USING BTREE,
  INDEX `idx_role_id`(`ROLE_ID`) USING BTREE,
  INDEX `idx_org_id`(`ORG_ID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rsbt_user
-- ----------------------------
INSERT INTO `rsbt_user` VALUES ('1712a2eb-cfd1-43e5-9a8d-462676cc0ac5', 'zhang', '$2a$10$WoipotZaN1n/Tdi54c.4eebqFaqEtO12/j2eyVRio1Zfggjjz6jn6', 'Zhang San', '5555@gmail.com', '13388889999', 'role-user', 'org-001', 'active', '2026-05-09 08:29:59', NULL, 0);
INSERT INTO `rsbt_user` VALUES ('admin-001', 'admin', '$2a$10$K76Gf47QG8Wksmmh3z3hP.hANkD.3/OdG88fHeLa8iFjhxTtB8Z9C', 'Administrator', 'admin@crc.mn', '+976-99-111122', 'role-admin', 'org-001', 'active', '2026-05-07 16:12:57', '2026-05-09 01:39:50', 0);

SET FOREIGN_KEY_CHECKS = 1;
