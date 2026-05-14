package com.freqmanage.module.statistics.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.freqmanage.module.permit.entity.RsbtSpecialPermit;
import com.freqmanage.module.permit.mapper.SpecialPermitMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class LicenseStatusUpdateTask {

    private final SpecialPermitMapper permitMapper;

    private static final long EXPIRING_DAYS = 60;

    public LicenseStatusUpdateTask(SpecialPermitMapper permitMapper) {
        this.permitMapper = permitMapper;
    }

    @Scheduled(cron = "0 0 1 * * ?")
    public void updateLicenseStatuses() {
        LocalDate now = LocalDate.now();
        LocalDate expiringThreshold = now.plusDays(EXPIRING_DAYS);

        // 更新已过期的: enddate < now
        LambdaUpdateWrapper<RsbtSpecialPermit> expiredWrapper = new LambdaUpdateWrapper<>();
        expiredWrapper.eq(RsbtSpecialPermit::getStatus, "normal")
                     .or().eq(RsbtSpecialPermit::getStatus, "expiring")
                     .or().isNull(RsbtSpecialPermit::getStatus)
                     .lt(RsbtSpecialPermit::getEnddate, now)
                     .set(RsbtSpecialPermit::getStatus, "expired");
        permitMapper.update(null, expiredWrapper);

        // 更新即将过期的: enddate > now AND enddate <= now + 60
        LambdaUpdateWrapper<RsbtSpecialPermit> expiringWrapper = new LambdaUpdateWrapper<>();
        expiringWrapper.eq(RsbtSpecialPermit::getStatus, "normal")
                       .or().isNull(RsbtSpecialPermit::getStatus)
                       .gt(RsbtSpecialPermit::getEnddate, now)
                       .le(RsbtSpecialPermit::getEnddate, expiringThreshold)
                       .set(RsbtSpecialPermit::getStatus, "expiring");
        permitMapper.update(null, expiringWrapper);

        // 更新正常的: enddate > now + 60 或 enddate 为 null
        LambdaUpdateWrapper<RsbtSpecialPermit> normalWrapper = new LambdaUpdateWrapper<>();
        normalWrapper.and(w -> w.eq(RsbtSpecialPermit::getStatus, "expiring")
                                .or().eq(RsbtSpecialPermit::getStatus, "expired"))
                     .and(w -> w.gt(RsbtSpecialPermit::getEnddate, expiringThreshold)
                                .or().isNull(RsbtSpecialPermit::getEnddate))
                     .set(RsbtSpecialPermit::getStatus, "normal");
        permitMapper.update(null, normalWrapper);
    }
}