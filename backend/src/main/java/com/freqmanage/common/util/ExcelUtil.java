package com.freqmanage.common.util;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelReader;
import com.alibaba.excel.read.listener.PageReadListener;
import com.alibaba.excel.write.metadata.WriteSheet;
import com.freqmanage.common.BizException;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.function.Consumer;

public class ExcelUtil {

    public static <T> void export(List<T> data, Class<T> clazz, OutputStream outputStream) {
        EasyExcel.write(outputStream, clazz)
                .sheet("Sheet1")
                .doWrite(data);
    }

    public static <T> void importData(InputStream inputStream, Class<T> clazz, Consumer<T> consumer) {
        ExcelReader reader = EasyExcel.read(inputStream, clazz, new PageReadListener<T>(list -> {
            for (T item : list) {
                consumer.accept(item);
            }
        })).build();
        reader.readAll();
        reader.finish();
    }

    public static <T> void importDataBatch(InputStream inputStream, Class<T> clazz, Consumer<List<T>> consumer) {
        EasyExcel.read(inputStream, clazz, new PageReadListener<T>(consumer)).sheet().doRead();
    }
}