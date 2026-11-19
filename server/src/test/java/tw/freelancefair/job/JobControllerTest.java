package tw.freelancefair.job;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** 對應 openspec/changes/add-job-posting/specs/job-posting/spec.md */
@SpringBootTest
@AutoConfigureMockMvc
class JobControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    String clientToken;
    /** 每個測試的標題都帶這個字串，查詢時不會撞到別的測試建立的案件 */
    String tag;

    @BeforeEach
    void setUp() throws Exception {
        clientToken = signUp();
        tag = UUID.randomUUID().toString().substring(0, 6);
    }

    private String signUp() throws Exception {
        String email = "m" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(
                Map.of("email", email, "password", "secret123", "displayName", "測試會員"))))
                .andExpect(status().isCreated());
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email, "password", "secret123"))))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("token").asText();
    }

    private Map<String, Object> validJob() {
        Map<String, Object> m = new HashMap<>();
        m.put("title", "公司形象網站 " + tag);
        m.put("category", "WEB");
        m.put("description", "製作公司形象網站，包含首頁、關於我們、服務介紹三個頁面，需要聯絡表單。");
        m.put("budgetMin", 20000);
        m.put("budgetMax", 40000);
        m.put("deadline", LocalDate.now().plusDays(30).toString());
        m.put("revisionLimit", 2);
        m.put("ipOwnership", "CLIENT_OWNS");
        m.put("portfolioAllowed", true);
        m.put("acceptanceCriteria", List.of("支援手機與桌機瀏覽", "交付原始碼與部署說明"));
        return m;
    }

    private ResultActions postJob(String token, Map<String, Object> body) throws Exception {
        var req = post("/api/jobs").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        if (token != null) req.header("Authorization", "Bearer " + token);
        return mvc.perform(req);
    }

    // ── Requirement: 刊登案件 ──

    @Test
    void 會員刊登成功() throws Exception {
        postJob(clientToken, validJob())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.client.displayName").value("測試會員"))
                .andExpect(jsonPath("$.client.email").doesNotExist())
                .andExpect(jsonPath("$.acceptanceCriteria[0]").value("支援手機與桌機瀏覽"))
                .andExpect(jsonPath("$.acceptanceCriteria[1]").value("交付原始碼與部署說明"));
    }

    @Test
    void 未登入不能刊登_401() throws Exception {
        postJob(null, validJob()).andExpect(status().isUnauthorized());
    }

    // ── Requirement: 刊登內容驗證 ──

    @Test
    void 預算上下限顛倒_400() throws Exception {
        var job = validJob();
        job.put("budgetMin", 50000);
        job.put("budgetMax", 10000);
        postJob(clientToken, job).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("budgetMax"));
    }

    @Test
    void 沒有驗收標準_400() throws Exception {
        var job = validJob();
        job.put("acceptanceCriteria", List.of());
        postJob(clientToken, job).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("acceptanceCriteria"));
    }

    @Test
    void 截止日在過去_400() throws Exception {
        var job = validJob();
        job.put("deadline", LocalDate.now().minusDays(1).toString());
        postJob(clientToken, job).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("deadline"));
    }

    @Test
    void 修改次數超過10_400() throws Exception {
        var job = validJob();
        job.put("revisionLimit", 99);
        postJob(clientToken, job).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("revisionLimit"));
    }

    // ── Requirement: 瀏覽與查詢案件 ──

    @Test
    void 訪客瀏覽() throws Exception {
        postJob(clientToken, validJob()).andExpect(status().isCreated());
        mvc.perform(get("/api/jobs").param("keyword", tag))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("公司形象網站 " + tag));
    }

    @Test
    void 依類別篩選() throws Exception {
        postJob(clientToken, validJob());
        var logo = validJob();
        logo.put("title", "品牌 Logo 設計 " + tag);
        logo.put("category", "DESIGN");
        postJob(clientToken, logo);

        mvc.perform(get("/api/jobs").param("category", "DESIGN").param("keyword", tag))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[*].category", everyItem(is("DESIGN"))));
    }

    @Test
    void 依關鍵字與預算篩選() throws Exception {
        postJob(clientToken, validJob()); // 20000–40000
        var expensive = validJob();
        expensive.put("title", "大型形象網站改版 " + tag);
        expensive.put("budgetMin", 80000);
        expensive.put("budgetMax", 120000);
        postJob(clientToken, expensive);
        var other = validJob();
        other.put("title", "中翻英說明書 " + tag);
        other.put("category", "TRANSLATION");
        other.put("description", "產品說明書約五千字中翻英，需專業術語一致，交付 Word 檔案。");
        postJob(clientToken, other);

        mvc.perform(get("/api/jobs").param("keyword", "形象網站").param("maxBudget", "30000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", hasItem("公司形象網站 " + tag)))
                .andExpect(jsonPath("$[*].title", not(hasItem("大型形象網站改版 " + tag))))
                .andExpect(jsonPath("$[*].title", not(hasItem("中翻英說明書 " + tag))));
    }

    @Test
    void 類別參數錯誤_400() throws Exception {
        mvc.perform(get("/api/jobs").param("category", "XYZ")).andExpect(status().isBadRequest());
    }

    // ── Requirement: 案件詳情與我的案件 ──

    @Test
    void 查看案件詳情() throws Exception {
        String res = postJob(clientToken, validJob()).andReturn().getResponse().getContentAsString();
        long id = json.readTree(res).get("id").asLong();
        mvc.perform(get("/api/jobs/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revisionLimit").value(2))
                .andExpect(jsonPath("$.ipOwnership").value("CLIENT_OWNS"));
    }

    @Test
    void 查看不存在的案件_404() throws Exception {
        mvc.perform(get("/api/jobs/999999")).andExpect(status().isNotFound());
    }

    @Test
    void 我的案件只回自己的() throws Exception {
        postJob(clientToken, validJob());
        String otherClient = signUp();
        var others = validJob();
        others.put("title", "別人的案件 " + tag);
        postJob(otherClient, others);

        mvc.perform(get("/api/me/jobs").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("公司形象網站 " + tag));
    }

    @Test
    void 我的案件需登入_401() throws Exception {
        mvc.perform(get("/api/me/jobs")).andExpect(status().isUnauthorized());
    }
}
