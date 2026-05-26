package com.freqmanage.module.permit.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.freqmanage.module.permit.entity.RsbtSpecialPermit;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface SpecialPermitMapper extends BaseMapper<RsbtSpecialPermit> {

    @Select("<script>" +
            "SELECT category, scope AS province, COUNT(*) AS cnt FROM RSBT_SPECIAL_PERMIT " +
            "WHERE 1=1 " +
            "<if test='province != null and province != &quot;All&quot; and province != &quot;&quot;'>" +
            "  AND scope = #{province}" +
            "</if>" +
            "<if test='date != null and date != &quot;&quot;'>" +
            "  AND DATE(startdate) &lt;= STR_TO_DATE(#{date}, '%Y-%m-%d')" +
            "</if>" +
            " GROUP BY category, scope" +
            "</script>")
    List<Map<String, Object>> countByCategoryAndProvince(@Param("province") String province, @Param("date") String date);
}