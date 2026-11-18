package tw.freelancefair;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// 排除預設的記憶體帳號（我們用自己的 JWT 驗證）
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class FairGigApplication {
    public static void main(String[] args) {
        SpringApplication.run(FairGigApplication.class, args);
    }
}
