-- ============================================
-- 插入30个License数据到RSBT_SPECIAL_PERMIT表
-- ============================================

USE freqmanage;

-- License 1
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-001', 'Approved', 'Ministry of Digital Affairs', 'Commercial', 'Radio Law Article 25', 'Broadcasting', '2025-01-15', '2028-01-14', 'Ulaanbaatar Central Area', 'Standard', 'active', 'LIC2025-001', '2025-01-10', 'Grant permission', 'Standard broadcasting license', 'Bat Erdene', 'Peace Avenue 12, Ulaanbaatar', '+976-11-321456', 'bat.erdene@mda.gov.mn', 'Commercial Broadcasting', 'Dorligjav');

-- License 2
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-002', 'Approved', 'Communications Authority', 'Telecommunications', 'Telecom Law Section 18', 'Mobile', '2025-02-01', '2027-02-01', 'Nationwide coverage', 'Express', 'active', 'LIC2025-002', '2025-01-28', 'Grant permission', '4G mobile network license', 'Saruul', 'Olympic Street 45, Ulaanbaatar', '+976-11-654321', 'saruul@ca.gov.mn', 'Mobile Services', 'Tsend');

-- License 3
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-003', 'Approved', 'Spectrum Commission', 'Satellite', 'Space Act Article 12', 'Satellite', '2024-06-01', '2029-06-01', 'National territory', 'Complex', 'active', 'LIC2024-003', '2024-05-25', 'Grant permission', 'Satellite communication license', 'Ariunaa', ' Government House 8, Ulaanbaatar', '+976-11-789012', 'ariunaa@sc.gov.mn', 'Satellite Services', 'Gantulga');

-- License 4
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-004', 'Approved', 'Radio Authority', 'Amateur', 'Radio Regulations Article 8', 'Amateur', '2025-03-10', '2028-03-09', 'Nationwide', 'Simple', 'active', 'LIC2025-004', '2025-03-05', 'Grant permission', 'Amateur radio license', 'Zoloo', 'Bayan Tower 22, Ulaanbaatar', '+976-11-456789', 'zoloo@ra.gov.mn', 'Amateur Services', 'MGL');

-- License 5
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-005', 'Approved', 'Ministry of Digital Affairs', 'Commercial', 'Radio Law Article 26', 'TV Broadcasting', '2024-09-01', '2027-09-01', 'Khovd province', 'Standard', 'active', 'LIC2024-005', '2024-08-25', 'Grant permission', 'Regional TV license', 'Nomin', 'Khovd Main Street 15', '+976-94-234567', 'nomin@khovd.tv', 'Regional TV Broadcasting', 'Tseren');

-- License 6
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-006', 'Approved', 'Communications Authority', 'Data Services', 'Telecom Law Section 20', 'ISP', '2025-01-20', '2028-01-20', 'Ulaanbaatar area', 'Standard', 'active', 'LIC2025-006', '2025-01-15', 'Grant permission', 'Internet service provider license', 'Enkhtaivan', 'Seoul Street 100, Ulaanbaatar', '+976-11-876543', 'enkhtai@isp.mn', 'ISP Services', 'Ariuka');

-- License 7
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-007', 'Expired', 'Spectrum Commission', 'Microwave', 'Microwave Regulations Article 5', 'Point to Point', '2023-05-01', '2025-05-01', 'Ulaanbaatar to Darkhan', 'Complex', 'expired', 'LIC2023-007', '2023-04-25', 'Grant permission', 'Microwave link license expired', 'Mongol', 'Central Tower 33, Ulaanbaatar', '+976-11-234567', 'mongol@microwave.mn', 'Microwave Links', 'Sengoo');

-- License 8
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-008', 'Approved', 'Radio Authority', 'Public Safety', 'Public Safety Act Article 15', 'Emergency', '2025-02-15', '2028-02-15', 'Nationwide', 'Priority', 'active', 'LIC2025-008', '2025-02-10', 'Grant permission', 'Emergency services license', 'Ganzorig', 'Emergency Center 5, Ulaanbaatar', '+976-11-112233', 'ganzorig@emergency.mn', 'Emergency Communications', 'Tuvdendorj');

-- License 9
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-009', 'Approved', 'Ministry of Digital Affairs', 'Commercial', 'Radio Law Article 27', 'FM Radio', '2024-11-01', '2027-11-01', 'Darhan city', 'Standard', 'active', 'LIC2024-009', '2024-10-25', 'Grant permission', 'FM radio broadcasting license', 'Otgon', 'Darhan Industrial Street 88', '+976-97-345678', 'otgon@fm.mn', 'FM Broadcasting', 'Batsaikhan');

-- License 10
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-010', 'Approved', 'Communications Authority', 'Wireless Broadband', 'Broadband Law Article 10', 'WBB', '2025-01-05', '2030-01-05', 'Nationwide', 'Complex', 'active', 'LIC2025-010', '2025-01-01', 'Grant permission', 'Wireless broadband license', 'Sarantsetseg', 'Innovation Park 12, Ulaanbaatar', '+976-11-567890', 'sarantsetseg@wbb.mn', 'Wireless Broadband', 'Enkhbayar');

-- License 11
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-011', 'Approved', 'Spectrum Commission', 'Aviation', 'Aviation Law Article 30', 'Aeronautical', '2025-03-01', '2028-03-01', 'All airports', 'Standard', 'active', 'LIC2025-011', '2025-02-25', 'Grant permission', 'Aeronautical communication license', 'Tsetseg', 'Chinggis Khaan Airport', '+976-11-998877', 'tsetseg@airport.mn', 'Aviation Services', 'Jargal');

-- License 12
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-012', 'Revoked', 'Radio Authority', 'Commercial', 'Radio Law Article 28', 'Radio', '2024-01-01', '2026-01-01', 'Selenge province', 'Standard', 'revoked', 'LIC2024-012', '2023-12-20', 'Revoke permission', 'License revoked due to non-compliance', 'Baatar', 'Selenge Office 4', '+976-98-123456', 'baatar@radio.mn', 'Radio Broadcasting', 'Namjil');

-- License 13
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-013', 'Approved', 'Ministry of Digital Affairs', 'Maritime', 'Maritime Law Article 22', 'Maritime', '2025-02-20', '2028-02-20', 'Mongolia coastal', 'Standard', 'active', 'LIC2025-013', '2025-02-15', 'Grant permission', 'Maritime communication license', 'Oyun', 'Lake Khovd Resort 77', '+976-94-876543', 'oyun@maritime.mn', 'Maritime Services', 'Gantulga');

-- License 14
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-014', 'Approved', 'Communications Authority', 'Railway', 'Railway Law Article 18', 'Railway', '2024-12-01', '2027-12-01', 'Ulaanbaatar to Sainshand', 'Standard', 'active', 'LIC2024-014', '2024-11-25', 'Grant permission', 'Railway communication license', 'Tsend', 'Railway Station 1, Ulaanbaatar', '+976-11-345678', 'tsend@railway.mn', 'Railway Communications', 'Munkh');

-- License 15
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-015', 'Approved', 'Spectrum Commission', 'Scientific', 'Science Law Article 14', 'Research', '2025-01-10', '2027-01-10', 'National research centers', 'Simple', 'active', 'LIC2025-015', '2025-01-05', 'Grant permission', 'Scientific research license', 'Amgalan', 'Science Park 20, Ulaanbaatar', '+976-11-234890', 'amgalan@science.mn', 'Research Services', 'Tsetseg');

-- License 16
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-016', 'Approved', 'Radio Authority', 'Commercial', 'Radio Law Article 29', 'Community Radio', '2025-04-01', '2028-04-01', 'Arkhangai province', 'Simple', 'active', 'LIC2025-016', '2025-03-25', 'Grant permission', 'Community radio license', 'Tseren', 'Tsetserleg City 55', '+976-93-567890', 'tseren@community.mn', 'Community Media', 'Ariun');

-- License 17
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-017', 'Approved', 'Ministry of Digital Affairs', '5G Services', '5G Regulations Article 5', '5G', '2025-01-01', '2030-01-01', 'Ulaanbaatar pilot zone', 'Priority', 'active', 'LIC2025-017', '2024-12-25', 'Grant permission', '5G pilot license', 'Munkhbat', '5G Tower 1, Ulaanbaatar', '+976-11-777888', 'munkhbat@5g.mn', '5G Services', 'Tuguldur');

-- License 18
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-018', 'Expired', 'Communications Authority', 'Cable TV', 'Cable Law Article 16', 'Cable', '2022-06-01', '2025-06-01', 'Darkhan city', 'Standard', 'expired', 'LIC2022-018', '2022-05-25', 'Grant permission', 'Cable TV license expired', 'Suld', 'Darkhan Mall 3rd floor', '+976-97-234567', 'suld@cable.mn', 'Cable TV', 'Gana');

-- License 19
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-019', 'Approved', 'Spectrum Commission', 'Police', 'Police Law Article 35', 'Police', '2025-03-15', '2028-03-15', 'Nationwide', 'Priority', 'active', 'LIC2025-019', '2025-03-10', 'Grant permission', 'Police communication license', 'Narangerel', 'Police HQ 9, Ulaanbaatar', '+976-11-119110', 'narangerel@police.mn', 'Police Services', 'Tsendpurev');

-- License 20
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-020', 'Approved', 'Radio Authority', 'Weather', 'Weather Service Act Article 8', 'Weather', '2025-02-10', '2028-02-10', 'All weather stations', 'Standard', 'active', 'LIC2025-020', '2025-02-05', 'Grant permission', 'Weather station license', 'Uugan', 'Weather Center 12, Ulaanbaatar', '+976-11-456123', 'uugan@weather.mn', 'Weather Services', 'MGLkh');

-- License 21
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-021', 'Approved', 'Ministry of Digital Affairs', 'Educational', 'Education Law Article 40', 'Educational', '2025-01-25', '2028-01-25', 'National universities', 'Standard', 'active', 'LIC2025-021', '2025-01-20', 'Grant permission', 'Educational broadcasting license', 'Odsuren', 'National University Campus', '+976-11-321654', 'odsuren@edu.mn', 'Educational Services', 'Tseren');

-- License 22
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-022', 'Approved', 'Communications Authority', 'IoT Services', 'IoT Law Article 12', 'IoT', '2025-04-15', '2029-04-15', 'Smart city pilot', 'Express', 'active', 'LIC2025-022', '2025-04-10', 'Grant permission', 'IoT network license', 'Ankhbayar', 'Tech Hub 44, Ulaanbaatar', '+976-11-890123', 'ankhbayar@iot.mn', 'IoT Services', 'Gantulga');

-- License 23
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-023', 'Approved', 'Spectrum Commission', 'Forestry', 'Forestry Law Article 20', 'Forestry', '2025-03-20', '2028-03-20', 'Khan Khentii protected area', 'Standard', 'active', 'LIC2025-023', '2025-03-15', 'Grant permission', 'Forestry communication license', 'Tungalag', 'Khan Khentii Office 6', '+976-96-345678', 'tungalag@forestry.mn', 'Forestry Services', 'Ariunaz');

-- License 24
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-024', 'Approved', 'Radio Authority', 'Mining', 'Mining Law Article 45', 'Mining', '2025-02-25', '2028-02-25', 'Oyu Tolgoi site', 'Priority', 'active', 'LIC2024-024', '2025-02-20', 'Grant permission', 'Mining communication license', 'Sainsana', 'Oyu Tolgoi Camp 1', '+976-94-567890', 'sainsana@mining.mn', 'Mining Services', 'Tuguldur');

-- License 25
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-025', 'Approved', 'Ministry of Digital Affairs', 'Defense', 'Defense Law Article 55', 'Defense', '2025-01-30', '2028-01-30', 'Strategic locations', 'Classified', 'active', 'LIC2025-025', '2025-01-25', 'Grant permission', 'Defense communication license', 'Galsan', 'Defense HQ 88, Ulaanbaatar', '+976-11-991122', 'galsan@defense.mn', 'Defense Services', 'Tseren');

-- License 26
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-026', 'Approved', 'Communications Authority', 'Agriculture', 'Agriculture Law Article 30', 'Agriculture', '2025-04-10', '2028-04-10', 'Central provinces', 'Standard', 'active', 'LIC2025-026', '2025-04-05', 'Grant permission', 'Agriculture monitoring license', 'Menda', 'Agricultural Center 18, Ulaanbaatar', '+976-11-654321', 'menda@agri.mn', 'Agriculture Services', 'Saruul');

-- License 27
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-027', 'Expired', 'Spectrum Commission', 'Diplomatic', 'Diplomatic Law Article 25', 'Diplomatic', '2024-04-01', '2025-04-01', 'Embassy district', 'Diplomatic', 'expired', 'LIC2024-027', '2024-03-25', 'Grant permission', 'Diplomatic license expired', 'Ariuna', 'Embassy Row 15', '+976-11-778899', 'ariuna@diplo.mn', 'Diplomatic Services', 'Gantugs');

-- License 28
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-028', 'Approved', 'Radio Authority', 'Transportation', 'Transport Law Article 35', 'Transport', '2025-03-05', '2028-03-05', 'Bus fleet nationwide', 'Standard', 'active', 'LIC2025-028', '2025-02-28', 'Grant permission', 'Fleet communication license', 'Tsend', 'Transport Terminal 5, Ulaanbaatar', '+976-11-345890', 'tsend@transport.mn', 'Transport Services', 'Munkhjin');

-- License 29
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-029', 'Approved', 'Ministry of Digital Affairs', 'Emergency', 'Emergency Law Article 22', 'Disaster', '2025-02-05', '2028-02-05', 'All provinces', 'Priority', 'active', 'LIC2025-029', '2025-02-01', 'Grant permission', 'Disaster management license', 'Altanzul', 'Disaster Center 10, Ulaanbaatar', '+976-11-113355', 'altanzul@disaster.mn', 'Emergency Services', 'Tsetseg');

-- License 30
INSERT INTO RSBT_SPECIAL_PERMIT (GUID, CONSENT, INTERLOCUTOR, CATEGORY, LEGAL, TYPE, STARTDATE, ENDDATE, SCOPE, PROCESS, STATUS, CODE, DECISIONDATE, DECISION, NOTE, REGISTER, ADDRESS, PHONE, EMAIL, ADMINISTRATIVEINFO, DIRECTORNAME)
VALUES ('LIC-030', 'Approved', 'Communications Authority', 'Banking', 'Banking Law Article 60', 'Banking', '2025-01-15', '2028-01-15', 'All bank branches', 'High Priority', 'active', 'LIC2025-030', '2025-01-10', 'Grant permission', 'Secure banking communication license', 'Gankhuyag', 'Bank of Mongolia HQ', '+976-11-220099', 'gankhuyag@bank.mn', 'Banking Services', 'Tuguldur');

-- ============================================
-- 验证插入结果
-- ============================================
SELECT COUNT(*) AS total_licenses FROM RSBT_SPECIAL_PERMIT;