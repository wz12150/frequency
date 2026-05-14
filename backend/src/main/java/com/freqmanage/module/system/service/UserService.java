package com.freqmanage.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.freqmanage.common.BizException;
import com.freqmanage.common.PageResponse;
import com.freqmanage.module.system.dto.UserCreateDTO;
import com.freqmanage.module.system.dto.UserQueryDTO;
import com.freqmanage.module.system.dto.UserUpdateDTO;
import com.freqmanage.module.system.entity.RsbtOrganization;
import com.freqmanage.module.system.entity.RsbtRole;
import com.freqmanage.module.system.entity.RsbtUser;
import com.freqmanage.module.system.mapper.OrganizationMapper;
import com.freqmanage.module.system.mapper.RoleMapper;
import com.freqmanage.module.system.mapper.UserMapper;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.freqmanage.module.system.vo.UserVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService extends ServiceImpl<UserMapper, RsbtUser> {

    private final RoleMapper roleMapper;
    private final OrganizationMapper organizationMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;

    public UserService(RoleMapper roleMapper, OrganizationMapper organizationMapper, PasswordEncoder passwordEncoder, RoleService roleService) {
        this.roleMapper = roleMapper;
        this.organizationMapper = organizationMapper;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
    }

    public List<SimpleGrantedAuthority> getUserAuthorities(String username) {
        RsbtUser user = getByUsernameEntity(username);
        if (user == null) {
            return Collections.emptyList();
        }

        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

        // Add role-based authority
        if (user.getRoleId() != null) {
            RsbtRole role = roleMapper.selectById(user.getRoleId());
            if (role != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            }
            // Get permissions from role
            List<String> permissions = roleService.getPermissionsByRoleId(user.getRoleId());
            for (String perm : permissions) {
                authorities.add(new SimpleGrantedAuthority(perm));
            }
        }

        return authorities;
    }

    public PageResponse<UserVO> page(UserQueryDTO query) {
        Page<RsbtUser> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<RsbtUser> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getUsername())) {
            wrapper.like(RsbtUser::getUsername, query.getUsername());
        }
        if (StringUtils.hasText(query.getName())) {
            wrapper.like(RsbtUser::getName, query.getName());
        }
        if (StringUtils.hasText(query.getRoleId())) {
            wrapper.eq(RsbtUser::getRoleId, query.getRoleId());
        }
        if (StringUtils.hasText(query.getOrgId())) {
            wrapper.eq(RsbtUser::getOrgId, query.getOrgId());
        }
        if (StringUtils.hasText(query.getStatus())) {
            wrapper.eq(RsbtUser::getStatus, query.getStatus());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.and(w -> w.like(RsbtUser::getUsername, query.getKeyword())
                    .or().like(RsbtUser::getName, query.getKeyword())
                    .or().like(RsbtUser::getEmail, query.getKeyword()));
        }
        wrapper.orderByDesc(RsbtUser::getCreateTime);
        IPage<RsbtUser> result = page(page, wrapper);
        List<UserVO> voList = result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        return new PageResponse<>(voList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    public UserVO getById(String id) {
        RsbtUser entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "用户不存在");
        }
        return convertToVO(entity);
    }

    public UserVO getByUsername(String username) {
        LambdaQueryWrapper<RsbtUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtUser::getUsername, username);
        RsbtUser entity = baseMapper.selectOne(wrapper);
        if (entity == null) {
            return null;
        }
        return convertToVO(entity);
    }

    public RsbtUser getByUsernameEntity(String username) {
        LambdaQueryWrapper<RsbtUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtUser::getUsername, username);
        return baseMapper.selectOne(wrapper);
    }

    public RsbtRole getRoleById(String roleId) {
        return roleMapper.selectById(roleId);
    }

    public List<String> getPermissionsByUserId(String userId) {
        RsbtUser user = baseMapper.selectById(userId);
        if (user == null || user.getRoleId() == null) {
            return Collections.emptyList();
        }
        return roleService.getPermissionsByRoleId(user.getRoleId());
    }

    public void create(UserCreateDTO dto) {
        LambdaQueryWrapper<RsbtUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RsbtUser::getUsername, dto.getUsername());
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BizException(400, "用户名已存在");
        }

        RsbtUser entity = new RsbtUser();
        entity.setGuid(UUID.randomUUID().toString());
        entity.setUsername(dto.getUsername());
        entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setRoleId(dto.getRoleId());
        entity.setOrgId(dto.getOrgId());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "active");
        baseMapper.insert(entity);
    }

    public void update(String id, UserUpdateDTO dto) {
        RsbtUser entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "用户不存在");
        }
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setRoleId(dto.getRoleId());
        entity.setOrgId(dto.getOrgId());
        entity.setStatus(dto.getStatus());
        baseMapper.updateById(entity);
    }

    public void resetPassword(String id, String newPassword) {
        RsbtUser entity = baseMapper.selectById(id);
        if (entity == null) {
            throw new BizException(404, "用户不存在");
        }
        entity.setPassword(passwordEncoder.encode(newPassword));
        baseMapper.updateById(entity);
    }

    public void delete(String id) {
        baseMapper.deleteById(id);
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        RsbtUser entity = getByUsernameEntity(username);
        if (entity == null) {
            throw new BizException(404, "用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, entity.getPassword())) {
            throw new BizException(400, "原密码错误");
        }
        entity.setPassword(passwordEncoder.encode(newPassword));
        baseMapper.updateById(entity);
    }

    public List<RsbtUser> listAll() {
        return baseMapper.selectList(null);
    }

    private UserVO convertToVO(RsbtUser entity) {
        UserVO vo = new UserVO();
        vo.setGuid(entity.getGuid());
        vo.setUsername(entity.getUsername());
        vo.setName(entity.getName());
        vo.setEmail(entity.getEmail());
        vo.setPhone(entity.getPhone());
        vo.setRoleId(entity.getRoleId());
        vo.setOrgId(entity.getOrgId());
        vo.setStatus(entity.getStatus());

        if (entity.getRoleId() != null) {
            RsbtRole role = roleMapper.selectById(entity.getRoleId());
            if (role != null) {
                vo.setRoleName(role.getName());
            }
        }
        if (entity.getOrgId() != null) {
            RsbtOrganization org = organizationMapper.selectById(entity.getOrgId());
            if (org != null) {
                vo.setOrgName(org.getName());
            }
        }
        return vo;
    }
}