-- 为频率规划表 rsbt_plannning 添加 ServiceType 和 BandType 字段
-- 业务类型，从数据字典 ServiceType 获取
ALTER TABLE `rsbt_plannning`
ADD COLUMN `SERVICETYPE` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '业务类型，从数据字典 ServiceType 获取' AFTER `REMARK`;

-- 频段类型，从数据字典 BandType 获取
ALTER TABLE `rsbt_plannning`
ADD COLUMN `BANGTYPE` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '频段类型，从数据字典 BandType 获取' AFTER `SERVICETYPE`;