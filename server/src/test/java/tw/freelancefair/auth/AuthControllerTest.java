package tw.freelancefair.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import tw.freelancefair.user.User;
import tw.freelancefair.user.UserRepository;

/** 對應 openspec/changes/add-member-auth/specs/member-auth/spec.md 的每個 Scenario */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;

    private static String uniqueEmail() {
        return "u" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    private ResultActions register(String email, String password, String name) throws Exception {
        return register(email, password, name, null);
    }

    /** extraRole：測試夾帶 role 欄位時用，正常註冊不需要 */
    private ResultActions register(String email, String password, String name, String extraRole) throws Exception {
        var map = new java.util.LinkedHashMap<String, String>();
        map.put("email", email);
        map.put("password", password);
        map.put("displayName", name);
        if (extraRole != null) map.put("role", extraRole);
        String body = json.writeValueAsString(map);
        return mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions login(String email, String password) throws Exception {
        String body = json.writeValueAsString(java.util.Map.of("email", email, "password", password));
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    // ── Requirement: 註冊 ──

    @Test
    void 註冊成功_不需選身分_角色為MEMBER() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123", "林小安")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.displayName").value("林小安"))
                .andExpect(jsonPath("$.role").value("MEMBER"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void Email重複_回409() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123", "甲").andExpect(status().isCreated());
        register(email.toUpperCase(), "secret123", "乙")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("此 Email 已被註冊"));
    }

    @Test
    void 夾帶ADMIN仍是一般會員() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123", "壞人", "ADMIN")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("MEMBER"));
        assertThat(users.findByEmail(email).orElseThrow().getRole()).isEqualTo(tw.freelancefair.user.Role.MEMBER);
    }

    // ── Requirement: 輸入驗證 ──

    @Test
    void 密碼太弱_回400並指出password() throws Exception {
        register(uniqueEmail(), "abc", "某人")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("password"));
    }

    @Test
    void Email格式錯誤_回400() throws Exception {
        register("not-an-email", "secret123", "某人")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("email"));
    }

    // ── Requirement: 密碼安全儲存 ──

    @Test
    void 資料庫不存明文密碼() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123", "某人").andExpect(status().isCreated());
        User saved = users.findByEmail(email).orElseThrow();
        assertThat(saved.getPasswordHash()).isNotEqualTo("secret123");
        assertThat(encoder.matches("secret123", saved.getPasswordHash())).isTrue();
    }

    // ── Requirement: 登入 ──

    @Test
    void 登入成功_回token與使用者() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123", "某人");
        login(email, "secret123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void 密碼錯誤與帳號不存在_回相同401訊息() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123", "某人");
        login(email, "wrong9999")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email 或密碼錯誤"));
        login(uniqueEmail(), "secret123")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email 或密碼錯誤"));
    }

    // ── Requirement: 取得目前使用者 ──

    @Test
    void 帶有效token_回200與自己的資料() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123", "某人");
        String res = login(email, "secret123").andReturn().getResponse().getContentAsString();
        JsonNode node = json.readTree(res);
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + node.get("token").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }

    @Test
    void 沒帶token_回401() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void 亂填token_回401() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 健康檢查不需登入() throws Exception {
        mvc.perform(get("/api/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ok"));
    }
}
