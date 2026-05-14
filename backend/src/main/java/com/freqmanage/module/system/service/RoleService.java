package com.freqmanage.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.RoleCreateDTO;
import com.freqmanage.module.system.dto.RoleQueryDTO;
import com.freqmanage.module.system.dto.RoleUpdateDTO;
import com.freqmanage.module.system.entity.RsbtRole;
import com.freqmanage.module.system.entity.RsbtRolePermission;
import com.freqmanage.module.system.entity.RsbtUser;
import com.freqmanage.module.system.mapper.RoleMapper;
import com.freqmanage.module.system.mapper.RolePermissionMapper;
import com.freqmanage.module.system.mapper.UserMapper;
import com.freqmanage.module.system.vo.RoleVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoleService extends ServiceImpl<RoleMapper, RsbtRole> {

    private final RolePermissionMapper rolePermissionMapper;
    private final UserMapper userMapper;

    public RoleService(RolePermissionMapper rolePermissionMapper, UserMapper userMapper) {
        this.rolePermissionMapper = rolePermissionMapper;
        this.userMapper = userMapper;
    }

    public PageResponse<RoleVO> page(RoleQueryDTO query) {
        Page<RsbtRole> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtRole> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getName())) {
            wrapper.like(RsbtRole::getName, query.getName());
        }
        if (StringUtils.hasText(query.getStatus())) {
            wrapper.eq(RsbtRole::getStatus, query.getStatus());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(RsbtRole::getName, query.getKeyword());
        }
        wrapper.orderByDesc(RsbtRole::getCreateTime);
        IPage<RsbtRole> result = page(page, wrapper);
        List<RoleVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public RoleVO getById(String id) {
        RsbtRole entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "角色不存在");
        }
        return convertToVO(entity);
    }

    @Transactional
    public void create(RoleCreateDTO dto) {
        LambdaQueryWrapper<RsbtRole> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtRole::getName, dto.getName());
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BizException(400, "角色名称已存在");
        }

        RsbtRole entity = new RsbtRole();
        entity.setGuid(UUID.randomUUID().toString());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "enabled");
        baseMapper.insert(entity);

        if (dto.getPermissions() != null && !dto.getPermissions().isEmpty()) {
            for (String permKey : dto.getPermissions()) {
                RsbtRolePermission perm = new RsbtRolePermission();
                perm.setGuid(UUID.randomUUID().toString());
                perm.setRoleId(entity.getGuid());
                perm.setPermissionKey(permKey);
                rolePermissionMapper.insert(perm);
            }
        }
    }

    @Transactional
    public void update(String id, RoleUpdateDTO dto) {
        RsbtRole entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "角色不存在");
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus());
        baseMapper.updateById(entity);

        LambdaQueryWrapper<RsbtRolePermission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtRolePermission::getRoleId, id);
        rolePermissionMapper.delete(wrapper);

        if (dto.getPermissions() != null && !dto.getPermissions().isEmpty()) {
            for (String permKey : dto.getPermissions()) {
                RsbtRolePermission perm = new RsbtRolePermission();
                perm.setGuid(UUID.randomUUID().toString());
                perm.setRoleId(id);
                perm.setPermissionKey(permKey);
                rolePermissionMapper.insert(perm);
            }
        }
    }

    public void delete(String id) {
        LambdaQueryWrapper<RsbtUser> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(RsbtUser::getRoleId, id);
        long userCount = userMapper.selectCount(userWrapper);
        if (userCount > 0) {
            throw new BizException(400, "该角色已有用户关联，无法删除");
        }

        LambdaQueryWrapper<RsbtRolePermission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtRolePermission::getRoleId, id);
        rolePermissionMapper.delete(wrapper);

        baseMapper.deleteById(id);
    }

    public List<RsbtRole> listAll() {
        return baseMapper.selectList(null);
    }

    public List<String> getPermissionsByRoleId(String roleId) {
        LambdaQueryWrapper<RsbtRolePermission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtRolePermission::getRoleId, roleId);
        List<RsbtRolePermission> perms = rolePermissionMapper.selectList(wrapper);
        return perms.stream().map(RsbtRolePermission::getPermissionKey).collect(Collectors.toList());
    }

    private RoleVO convertToVO(RsbtRole entity) {
        RoleVO vo = new RoleVO();
        vo.setGuid(entity.getGuid());
        vo.setName(entity.getName());
        vo.setDescription(entity.getDescription());
        vo.setStatus(entity.getStatus());

        List<String> permissions = getPermissionsByRoleId(entity.getGuid());
        vo.setPermissions(permissions);

        LambdaQueryWrapper<RsbtUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtUser::getRoleId, entity.getGuid());
        vo.setUserCount(Long.valueOf(userMapper.selectCount(wrapper)).intValue());

        return vo;
    }
}