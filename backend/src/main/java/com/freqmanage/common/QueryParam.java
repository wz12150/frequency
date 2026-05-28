package com.freqmanage.common;

import lombok.Data;

@Data
public class QueryParam {
    private long pageNum = 1;
    private long pageSize = 10;
    private String keyword;
}
