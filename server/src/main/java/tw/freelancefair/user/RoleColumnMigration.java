package tw.freelancefair.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 一次性資料轉換（openspec: unify-member-role）。
 * 舊版在 MySQL 把 users.role 建成 ENUM('ADMIN','CLIENT','FREELANCER')，
 * 這裡改成 VARCHAR，並把 FREELANCER／CLIENT 轉成 MEMBER。可重複執行。
 * H2（開發、測試）每次都是新資料庫，不需要轉換。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RoleColumnMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(RoleColumnMigration.class);
    private final JdbcTemplate jdbc;

    public RoleColumnMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        String product = jdbc.execute((ConnectionCallback<String>) c -> c.getMetaData().getDatabaseProductName());
        if (product == null || !product.toLowerCase().contains("mysql")) {
            return;
        }
        String type = jdbc.query(
                "SELECT DATA_TYPE FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'",
                rs -> rs.next() ? rs.getString(1) : null);
        if ("enum".equalsIgnoreCase(type)) {
            jdbc.execute("ALTER TABLE users MODIFY role VARCHAR(20) NOT NULL");
            log.info("users.role：ENUM 已改為 VARCHAR(20)");
        }
        int n = jdbc.update("UPDATE users SET role = 'MEMBER' WHERE role IN ('FREELANCER', 'CLIENT')");
        if (n > 0) {
            log.info("已將 {} 個舊版接案者／發案方帳號轉為 MEMBER", n);
        }
    }
}
