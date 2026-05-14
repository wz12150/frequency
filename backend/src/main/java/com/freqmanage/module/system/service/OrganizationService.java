package com.freqmanage.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.OrganizationCreateDTO;
import com.freqmanage.module.system.dto.OrganizationQueryDTO;
import com.freqmanage.module.system.dto.OrganizationUpdateDTO;
import com.freqmanage.module.system.entity.RsbtOrganization;
import com.freqmanage.module.system.mapper.OrganizationMapper;
import com.freqmanage.module.system.vo.OrganizationVO;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationService extends ServiceImpl<OrganizationMapper, RsbtOrganization> {

    public PageResponse<OrganizationVO> page(OrganizationQueryDTO query) {
        Page<RsbtOrganization> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtOrganization> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getName())) {
            wrapper.like(RsbtOrganization::getName, query.getName());
        }
        if (StringUtils.hasText(query.getCode())) {
            wrapper.eq(RsbtOrganization::getCode, query.getCode());
        }
        if (StringUtils.hasText(query.getType())) {
            wrapper.eq(RsbtOrganization::getType, query.getType());
        }
        if (StringUtils.hasText(query.getRegion())) {
            wrapper.like(RsbtOrganization::getRegion, query.getRegion());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.and(w -> w.like(RsbtOrganization::getName, query.getKeyword())
                    .or().like(RsbtOrganization::getCode, query.getKeyword()));
        }
        wrapper.orderByDesc(RsbtOrganization::getCreateTime);
        IPage<RsbtOrganization> result = page(page, wrapper);
        List<OrganizationVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public OrganizationVO getById(String id) {
        RsbtOrganization entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        return convertToVO(entity);
    }

    public void create(OrganizationCreateDTO dto) {
        RsbtOrganization entity = new RsbtOrganization();
        entity.setGuid(UUID.randomUUID().toString());
        validateParent(dto.getParentId(), entity.getGuid());
        copyProperties(dto, entity);
        baseMapper.insert(entity);
    }

    public void update(String id, OrganizationUpdateDTO dto) {
        RsbtOrganization entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "记录不存在");
        }
        validateParent(dto.getParentId(), id);
        copyProperties(dto, entity);
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        long childCount = baseMapper.selectCount(new LambdaQueryWrapper<RsbtOrganization>()
                .eq(RsbtOrganization::getParentId, id));
        if (childCount > 0) {
            throw new BizException(400, "该组织存在下级组织，无法删除");
        }
        baseMapper.deleteById(id);
    }

    public List<RsbtOrganization> listAll() {
        return baseMapper.selectList(null);
    }

    private void copyProperties(Object src, RsbtOrganization target) {
        if (src instanceof OrganizationCreateDTO) {
            OrganizationCreateDTO dto = (OrganizationCreateDTO) src;
            target.setParentId(dto.getParentId());
            target.setName(dto.getName());
            target.setCode(dto.getCode());
            target.setType(dto.getType());
            target.setRegion(dto.getRegion());
            target.setAddress(dto.getAddress());
            target.setContact(dto.getContact());
            target.setPhone(dto.getPhone());
            target.setEmail(dto.getEmail());
            target.setStatus(dto.getStatus() != null ? dto.getStatus() : "enabled");
        } else if (src instanceof OrganizationUpdateDTO) {
            OrganizationUpdateDTO dto = (OrganizationUpdateDTO) src;
            target.setParentId(dto.getParentId());
            target.setName(dto.getName());
            target.setCode(dto.getCode());
            target.setType(dto.getType());
            target.setRegion(dto.getRegion());
            target.setAddress(dto.getAddress());
            target.setContact(dto.getContact());
            target.setPhone(dto.getPhone());
            target.setEmail(dto.getEmail());
            target.setStatus(dto.getStatus());
        }
    }

    private OrganizationVO convertToVO(RsbtOrganization entity) {
        OrganizationVO vo = new OrganizationVO();
        vo.setGuid(entity.getGuid());
        vo.setParentId(entity.getParentId());
        vo.setName(entity.getName());
        vo.setCode(entity.getCode());
        vo.setType(entity.getType());
        vo.setRegion(entity.getRegion());
        vo.setAddress(entity.getAddress());
        vo.setContact(entity.getContact());
        vo.setPhone(entity.getPhone());
        vo.setEmail(entity.getEmail());
        vo.setStatus(entity.getStatus());
        vo.setCreateTime(entity.getCreateTime());
        vo.setUpdateTime(entity.getUpdateTime());
        return vo;
    }

    private void validateParent(String parentId, String currentId) {
        if (!StringUtils.hasText(parentId)) {
            return;
        }
        if (parentId.equals(currentId)) {
            throw new BizException(400, "父级组织不能选择自己");
        }
        RsbtOrganization parent = baseMapper.selectById(parentId);
        if (parent == null) {
            throw new BizException(400, "父级组织不存在");
        }
    }
}