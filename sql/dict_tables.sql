-- Dictionary Table
-- ----------------------------
-- Table structure for sys_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_type`;
CREATE TABLE `sys_dict_type` (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Primary Key ID',
  `NAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Dictionary Type Name',
  `CODE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Dictionary Type Code',
  `DESCRIPTION` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Description',
  `STATUS` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'enabled' COMMENT 'Status: enabled, disabled',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT 'Creation Time',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT 'Update Time',
  PRIMARY KEY (`GUID`) USING BTREE,
  UNIQUE INDEX `idx_dict_type_code`(`CODE`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Dictionary Type Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sys_dict_data
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_data`;
CREATE TABLE `sys_dict_data` (
  `GUID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Primary Key ID',
  `TYPE_ID` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Dictionary Type ID',
  `LABEL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Dictionary Label',
  `VALUE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Dictionary Value',
  `SORT` int(0) NULL DEFAULT 0 COMMENT 'Sort Order',
  `STATUS` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'enabled' COMMENT 'Status: enabled, disabled',
  `REMARK` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Remark',
  `CREATE_TIME` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT 'Creation Time',
  `UPDATE_TIME` datetime(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0) COMMENT 'Update Time',
  PRIMARY KEY (`GUID`) USING BTREE,
  INDEX `idx_dict_data_type_id`(`TYPE_ID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Dictionary Data Table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Dictionary Type Records
-- ----------------------------
INSERT INTO `sys_dict_type` VALUES ('dict-type-001', 'Frequency Band', 'freq_band', 'Radio frequency band types', 'enabled', NOW(), NULL);
INSERT INTO `sys_dict_type` VALUES ('dict-type-002', 'Region Type', 'region_type', 'Administrative region classification', 'enabled', NOW(), NULL);
INSERT INTO `sys_dict_type` VALUES ('dict-type-003', 'Organization Nature', 'org_nature', 'Organization entity types', 'enabled', NOW(), NULL);
INSERT INTO `sys_dict_type` VALUES ('dict-type-004', 'Service Type', 'service_type', 'Radio service types', 'enabled', NOW(), NULL);

-- ----------------------------
-- Dictionary Data Records
-- ----------------------------
INSERT INTO `sys_dict_data` VALUES ('dict-data-001', 'dict-type-001', 'Long Wave (LW)', 'LW', 1, 'enabled', '30 kHz - 300 kHz', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-002', 'dict-type-001', 'Medium Wave (MW)', 'MW', 2, 'enabled', '300 kHz - 3 MHz', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-003', 'dict-type-001', 'Short Wave (SW)', 'SW', 3, 'enabled', '3 MHz - 30 MHz', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-004', 'dict-type-001', 'Very High Frequency (VHF)', 'VHF', 4, 'enabled', '30 MHz - 300 MHz', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-005', 'dict-type-001', 'Ultra High Frequency (UHF)', 'UHF', 5, 'enabled', '300 MHz - 3 GHz', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-006', 'dict-type-001', 'Super High Frequency (SHF)', 'SHF', 6, 'enabled', '3 GHz - 30 GHz', NOW(), NULL);

INSERT INTO `sys_dict_data` VALUES ('dict-data-007', 'dict-type-002', 'National Level', 'national', 1, 'enabled', 'National administrative region', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-008', 'dict-type-002', 'Provincial Level', 'provincial', 2, 'enabled', 'Provincial administrative region', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-009', 'dict-type-002', 'City Level', 'city', 3, 'enabled', 'City administrative region', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-010', 'dict-type-002', 'County Level', 'county', 4, 'enabled', 'County administrative region', NOW(), NULL);

INSERT INTO `sys_dict_data` VALUES ('dict-data-011', 'dict-type-003', 'Government Agency', 'government', 1, 'enabled', 'Government agencies', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-012', 'dict-type-003', 'Public Institution', 'institution', 2, 'enabled', 'Public institutions', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-013', 'dict-type-003', 'Enterprise', 'enterprise', 3, 'enabled', 'Business enterprises', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-014', 'dict-type-003', 'Social Organization', 'organization', 4, 'enabled', 'Social organizations', NOW(), NULL);

INSERT INTO `sys_dict_data` VALUES ('dict-data-015', 'dict-type-004', 'Fixed Service', 'fixed', 1, 'enabled', 'Fixed radio service', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-016', 'dict-type-004', 'Mobile Service', 'mobile', 2, 'enabled', 'Mobile radio service', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-017', 'dict-type-004', 'Broadcasting Service', 'broadcasting', 3, 'enabled', 'Radio broadcasting service', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-018', 'dict-type-004', 'Radionavigation Service', 'radionavigation', 4, 'enabled', 'Radio navigation service', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-019', 'dict-type-004', 'Aeronautical Service', 'aeronautical', 5, 'enabled', 'Aeronautical radio service', NOW(), NULL);
INSERT INTO `sys_dict_data` VALUES ('dict-data-020', 'dict-type-004', 'Maritime Service', 'maritime', 6, 'enabled', 'Maritime radio service', NOW(), NULL);
