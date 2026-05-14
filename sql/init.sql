-- ============================================
-- 10频管分析系统 数据库初始化脚本
-- 数据库: freqmanage
-- MySQL 8.0
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS freqmanage DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE freqmanage;

-- ============================================
-- 1. RSBT_PLANNNING - 频率规划表
-- ============================================
DROP TABLE IF EXISTS RSBT_PLANNNING;
CREATE TABLE RSBT_PLANNNING (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    RADIOSERVICES   VARCHAR(100)    DEFAULT NULL COMMENT '无线业务',
    SUBSERVICES     VARCHAR(100)    DEFAULT NULL COMMENT '子业务',
    LEVEL           VARCHAR(50)     DEFAULT NULL COMMENT '等级',
    SEGMENTNAME     VARCHAR(100)    DEFAULT NULL COMMENT '频段名称',
    STARTFREQUENCY  DECIMAL(18,6)   DEFAULT NULL COMMENT '起始频率(MHz)',
    STOPFREQUENCY   DECIMAL(18,6)   DEFAULT NULL COMMENT '终止频率(MHz)',
    STEP            DECIMAL(18,6)   DEFAULT NULL COMMENT '频率步进(MHz)',
    BANDWIDTH       DECIMAL(18,6)   DEFAULT NULL COMMENT '带宽(MHz)',
    REMARK          VARCHAR(500)    DEFAULT NULL COMMENT '备注',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME     DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED         TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='频率规划表';

-- ============================================
-- 2. RSBT_STATION - 台站管理表
-- ============================================
DROP TABLE IF EXISTS RSBT_STATION;
CREATE TABLE RSBT_STATION (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    TYPE            VARCHAR(50)     DEFAULT NULL COMMENT '类型',
    TECHNOLOGY      VARCHAR(50)     DEFAULT NULL COMMENT '技术体制',
    BBUMODEL        VARCHAR(100)    DEFAULT NULL COMMENT 'BBU型号',
    OWNEDSITE       VARCHAR(100)    DEFAULT NULL COMMENT '归属站址',
    BACKBONE        VARCHAR(50)     DEFAULT NULL COMMENT '骨干网',
    STATIONPURPOSE  VARCHAR(100)    DEFAULT NULL COMMENT '台站用途',
    MODULATION      VARCHAR(50)     DEFAULT NULL COMMENT '调制方式',
    STATIONTYPE     VARCHAR(50)     DEFAULT NULL COMMENT '台站类型',
    FREQUENCYT      DECIMAL(18,6)   DEFAULT NULL COMMENT '发射频率(MHz)',
    FREQUENCYR      DECIMAL(18,6)   DEFAULT NULL COMMENT '接收频率(MHz)',
    BANDWIDTH       DECIMAL(18,6)   DEFAULT NULL COMMENT '带宽(MHz)',
    DEVICEMODEL     VARCHAR(100)    DEFAULT NULL COMMENT '设备型号',
    DEVICEQUANTITY  INT             DEFAULT NULL COMMENT '设备数量',
    OUTPUTPOWER     DECIMAL(18,6)   DEFAULT NULL COMMENT '输出功率(W)',
    ANTTYPE         VARCHAR(100)    DEFAULT NULL COMMENT '天线型号',
    ANTQUANTITY     INT             DEFAULT NULL COMMENT '天线数量',
    PROVINCE        VARCHAR(50)     DEFAULT NULL COMMENT '省份',
    DISTRICT        VARCHAR(50)     DEFAULT NULL COMMENT '地区',
    LOCATION        VARCHAR(200)    DEFAULT NULL COMMENT '详细地址',
    SITENAME        VARCHAR(100)    DEFAULT NULL COMMENT '站址名称',
    UNIT            VARCHAR(100)    DEFAULT NULL COMMENT '设台单位/Owner Name',
    LONGITUDE       DECIMAL(18,10)  DEFAULT NULL COMMENT '经度',
    LATITUDE        DECIMAL(18,10)  DEFAULT NULL COMMENT '纬度',
    STARTDATE       DATE            DEFAULT NULL COMMENT '启用日期',
    EXPIRATIONDATE  DATE            DEFAULT NULL COMMENT '到期日期',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME     DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED         TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='台站管理表';

-- ============================================
-- 3. RSBT_SPECIAL_PERMIT - 频率授权主表
-- ============================================
DROP TABLE IF EXISTS RSBT_SPECIAL_PERMIT;
CREATE TABLE RSBT_SPECIAL_PERMIT (
    GUID                VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    CONSENT             VARCHAR(100)    DEFAULT NULL COMMENT '许可决定',
    INTERLOCUTOR       VARCHAR(100)    DEFAULT NULL COMMENT '对话者',
    CATEGORY            VARCHAR(50)     DEFAULT NULL COMMENT '类别',
    LEGAL               VARCHAR(100)    DEFAULT NULL COMMENT '法律依据',
    TYPE                VARCHAR(50)     DEFAULT NULL COMMENT '类型',
    STARTDATE           DATE            DEFAULT NULL COMMENT '开始日期',
    ENDDATE             DATE            DEFAULT NULL COMMENT '结束日期',
    SCOPE               VARCHAR(500)   DEFAULT NULL COMMENT '范围',
    PROCESS             VARCHAR(100)    DEFAULT NULL COMMENT '流程',
    STATUS              VARCHAR(20)     DEFAULT NULL COMMENT '状态: active-有效, expired-过期, revoked-撤销',
    CODE                VARCHAR(100)    DEFAULT NULL COMMENT '许可证号',
    DECISIONDATE        DATE            DEFAULT NULL COMMENT '决定日期',
    DECISION            VARCHAR(500)    DEFAULT NULL COMMENT '决定',
    NOTE                VARCHAR(500)    DEFAULT NULL COMMENT '备注',
    REGISTER            VARCHAR(100)    DEFAULT NULL COMMENT '登记人',
    ADDRESS             VARCHAR(200)    DEFAULT NULL COMMENT '地址',
    PHONE               VARCHAR(50)     DEFAULT NULL COMMENT '电话',
    EMAIL               VARCHAR(100)    DEFAULT NULL COMMENT '邮箱',
    ADMINISTRATIVEINFO   VARCHAR(500)   DEFAULT NULL COMMENT '行政信息',
    DIRECTORNAME        VARCHAR(100)    DEFAULT NULL COMMENT '负责人姓名',
    CREATE_TIME         DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME         DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED             TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='频率授权主表';

-- ============================================
-- 4. RSBT_SPECIAL_PERMIT_FREQUENCY - 授权频率扩展表
-- ============================================
DROP TABLE IF EXISTS RSBT_SPECIAL_PERMIT_FREQUENCY;
CREATE TABLE RSBT_SPECIAL_PERMIT_FREQUENCY (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    PERMITID        VARCHAR(64)     NOT NULL COMMENT '授权主表ID',
    FREQUENCY       DECIMAL(18,6)   DEFAULT NULL COMMENT '频率(MHz)',
    BADNWIDTH       DECIMAL(18,6)   DEFAULT NULL COMMENT '带宽(MHz)',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME     DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED         TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_permit_id (PERMITID),
    CONSTRAINT fk_frequency_permit FOREIGN KEY (PERMITID) REFERENCES RSBT_SPECIAL_PERMIT(GUID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='授权频率扩展表';

-- ============================================
-- 5. RSBT_SPECIAL_PERMIT_STATION - 授权台站扩展表
-- ============================================
DROP TABLE IF EXISTS RSBT_SPECIAL_PERMIT_STATION;
CREATE TABLE RSBT_SPECIAL_PERMIT_STATION (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    PERMITID        VARCHAR(64)     NOT NULL COMMENT '授权主表ID',
    QUANTITY        INT             DEFAULT NULL COMMENT '数量',
    OUTPUTPOWER     DECIMAL(18,6)   DEFAULT NULL COMMENT '输出功率(W)',
    TYPE            VARCHAR(50)     DEFAULT NULL COMMENT '类型',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME     DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED         TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_permit_id (PERMITID),
    CONSTRAINT fk_station_permit FOREIGN KEY (PERMITID) REFERENCES RSBT_SPECIAL_PERMIT(GUID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='授权台站扩展表';

-- ============================================
-- 6. RSBT_USER - 用户表
-- ============================================
DROP TABLE IF EXISTS RSBT_USER;
CREATE TABLE RSBT_USER (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    USERNAME        VARCHAR(50)     NOT NULL UNIQUE COMMENT '用户名',
    PASSWORD        VARCHAR(255)    NOT NULL COMMENT '密码(Bcrypt加密)',
    NAME            VARCHAR(100)    DEFAULT NULL COMMENT '姓名',
    EMAIL           VARCHAR(100)    DEFAULT NULL COMMENT '邮箱',
    PHONE           VARCHAR(50)     DEFAULT NULL COMMENT '电话',
    ROLE_ID         VARCHAR(64)     DEFAULT NULL COMMENT '角色ID',
    ORG_ID          VARCHAR(64)     DEFAULT NULL COMMENT '组织ID',
    STATUS          VARCHAR(20)     DEFAULT 'active' COMMENT '状态: active-激活, inactive-禁用',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME     DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED         TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_username (USERNAME),
    INDEX idx_role_id (ROLE_ID),
    INDEX idx_org_id (ORG_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 7. RSBT_ORGANIZATION - 组织表
-- ============================================
DROP TABLE IF EXISTS RSBT_ORGANIZATION;
CREATE TABLE RSBT_ORGANIZATION (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    PARENT_ID       VARCHAR(64)     DEFAULT NULL COMMENT '父组织ID',
    NAME            VARCHAR(100)    NOT NULL COMMENT '组织名称',
    CODE            VARCHAR(50)     NOT NULL COMMENT '组织代码',
    TYPE            VARCHAR(50)     DEFAULT NULL COMMENT '类型',
    REGION          VARCHAR(50)     DEFAULT NULL COMMENT '区域',
    ADDRESS         VARCHAR(200)    DEFAULT NULL COMMENT '地址',
    CONTACT         VARCHAR(100)    DEFAULT NULL COMMENT '联系人',
    PHONE           VARCHAR(50)     DEFAULT NULL COMMENT '电话',
    EMAIL           VARCHAR(100)    DEFAULT NULL COMMENT '邮箱',
    STATUS          VARCHAR(20)     DEFAULT 'active' COMMENT '状态: active-激活, inactive-禁用',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME     DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED         TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    UNIQUE INDEX idx_code (CODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织表';

-- ============================================
-- 8. RSBT_ROLE - 角色表
-- ============================================
DROP TABLE IF EXISTS RSBT_ROLE;
CREATE TABLE RSBT_ROLE (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    NAME            VARCHAR(50)     NOT NULL COMMENT '角色名称',
    DESCRIPTION     VARCHAR(200)    DEFAULT NULL COMMENT '描述',
    STATUS          VARCHAR(20)     DEFAULT 'active' COMMENT '状态: active-激活, inactive-禁用',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UPDATE_TIME     DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    DELETED         TINYINT(1)      DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    UNIQUE INDEX idx_name (NAME)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ============================================
-- 9. RSBT_ROLE_PERMISSION - 角色权限表
-- ============================================
DROP TABLE IF EXISTS RSBT_ROLE_PERMISSION;
CREATE TABLE RSBT_ROLE_PERMISSION (
    GUID            VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '主键ID',
    ROLE_ID         VARCHAR(64)     NOT NULL COMMENT '角色ID',
    PERMISSION_KEY  VARCHAR(100)    NOT NULL COMMENT '权限标识',
    CREATE_TIME     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_role_id (ROLE_ID),
    INDEX idx_permission_key (PERMISSION_KEY),
    UNIQUE INDEX idx_role_permission (ROLE_ID, PERMISSION_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认管理员用户 (密码: admin123, BCrypt加密后的值)
INSERT INTO RSBT_USER (GUID, USERNAME, PASSWORD, NAME, EMAIL, PHONE, ROLE_ID, ORG_ID, STATUS)
VALUES (
    'admin-001',
    'admin',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH',
    'Administrator',
    'admin@crc.mn',
    '+976-99-111111',
    NULL,
    NULL,
    'active'
);

-- 插入默认角色
INSERT INTO RSBT_ROLE (GUID, NAME, DESCRIPTION, STATUS) VALUES
('role-admin', 'ADMIN', '系统管理员', 'active'),
('role-user', 'USER', '普通用户', 'active');

-- 插入示例组织
INSERT INTO RSBT_ORGANIZATION (GUID, PARENT_ID, NAME, CODE, TYPE, REGION, ADDRESS, CONTACT, PHONE, EMAIL, STATUS) VALUES
('org-001', NULL, '蒙古通信委员会', 'CRC', 'government', 'Ulaanbaatar', 'Government Building, Ulaanbaatar', 'John Smith', '+976-11-123456', 'info@crc.mn', 'active');

-- ============================================
-- 完成
-- ============================================
SELECT 'Database initialization completed successfully!' AS MESSAGE;
