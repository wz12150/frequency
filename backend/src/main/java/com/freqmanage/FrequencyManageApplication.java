package com.freqmanage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FrequencyManageApplication {

    public static void main(String[] args) {
        SpringApplication.run(FrequencyManageApplication.class, args);
    }
}
