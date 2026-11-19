package tw.freelancefair.application;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** 對應 openspec/changes/add-job-application/specs/job-application/spec.md */
@SpringBootTest
@AutoConfigureMockMvc
class ApplicationControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    record Member(String token, long id) {}

    Member client;
    Member freelancer;
    long jobId;
    String tag;

    @BeforeEach
    void setUp() throws Exception {
        tag = UUID.randomUUID().toString().substring(0, 6);
        client = signUp("發案方");
        freelancer = signUp("接案者");
        jobId = createJob(client);
    }

    // ── 工具 ──

    private Member signUp(String name) throws Exception {
        String email = "a" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String reg = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email, "password", "secret123", "displayName", name))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email, "password", "secret123"))))
                .andReturn().getResponse().getContentAsString();
        return new Member(json.readTree(res).get("token").asText(), json.readTree(reg).get("id").asLong());
    }

    private long createJob(Member owner) throws Exception {
        Map<String, Object> m = new HashMap<>();
        m.put("title", "形象網站應徵測試 " + tag);
        m.put("category", "WEB");
        m.put("description", "製作公司形象網站，包含首頁、關於我們、服務介紹三個頁面，需要聯絡表單。");
        m.put("budgetMin", 20000);
        m.put("budgetMax", 40000);
        m.put("deadline", LocalDate.now().plusDays(30).toString());
        m.put("revisionLimit", 2);
        m.put("ipOwnership", "CLIENT_OWNS");
        m.put("portfolioAllowed", true);
        m.put("acceptanceCriteria", List.of("支援手機與桌機瀏覽"));
        String res = mvc.perform(auth(post("/api/jobs"), owner).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(m)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("id").asLong();
    }

    private static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder req, Member m) {
        return m == null ? req : req.header("Authorization", "Bearer " + m.token());
    }

    private Map<String, Object> validApplication() {
        Map<String, Object> m = new HashMap<>();
        m.put("message", "我做過五個形象網站，熟悉 React 與 RWD，可以先提供設計稿確認。");
        m.put("quotedPrice", 30000);
        m.put("estimatedDays", 14);
        return m;
    }

    private ResultActions apply(Member who, long job, Map<String, Object> body) throws Exception {
        return mvc.perform(auth(post("/api/jobs/" + job + "/applications"), who)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body)));
    }

    private long applyOk(Member who, long job) throws Exception {
        String res = apply(who, job, validApplication()).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("id").asLong();
    }

    private ResultActions accept(Member who, long job, long applicationId) throws Exception {
        return mvc.perform(auth(post("/api/jobs/" + job + "/applications/" + applicationId + "/accept"), who));
    }

    private ResultActions invite(Member who, long job, long freelancerId) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("freelancerId", freelancerId);
        body.put("message", "看過你的作品，想邀請你應徵");
        return mvc.perform(auth(post("/api/jobs/" + job + "/invitations"), who)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body)));
    }

    private void setOpenForWork(Member m, boolean open) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("displayName", "接案者");
        body.put("bio", "自我介紹");
        body.put("skills", List.of("React"));
        body.put("openForWork", open);
        mvc.perform(auth(put("/api/me/profile"), m).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    // ── Requirement: 應徵案件 ──

    @Test
    void 應徵成功() throws Exception {
        apply(freelancer, jobId, validApplication())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.jobId").value(jobId))
                .andExpect(jsonPath("$.quotedPrice").value(30000))
                .andExpect(jsonPath("$.estimatedDays").value(14))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.applicant.id").value(freelancer.id()));
    }

    @Test
    void 未登入不能應徵_401() throws Exception {
        apply(null, jobId, validApplication()).andExpect(status().isUnauthorized());
    }

    @Test
    void 不能應徵自己的案件_403() throws Exception {
        apply(client, jobId, validApplication()).andExpect(status().isForbidden());
    }

    @Test
    void 重複應徵_409() throws Exception {
        applyOk(freelancer, jobId);
        apply(freelancer, jobId, validApplication()).andExpect(status().isConflict());
    }

    @Test
    void 案件已不在招募_409() throws Exception {
        long appId = applyOk(freelancer, jobId);
        accept(client, jobId, appId).andExpect(status().isOk());
        Member late = signUp("晚到的人");
        apply(late, jobId, validApplication()).andExpect(status().isConflict());
    }

    @Test
    void 案件不存在_404() throws Exception {
        apply(freelancer, 999_999, validApplication()).andExpect(status().isNotFound());
    }

    // ── Requirement: 應徵內容驗證 ──

    @Test
    void 報價為0_400() throws Exception {
        var body = validApplication();
        body.put("quotedPrice", 0);
        apply(freelancer, jobId, body).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("quotedPrice"));
    }

    @Test
    void 自我推薦太短_400() throws Exception {
        var body = validApplication();
        body.put("message", "我可以");
        apply(freelancer, jobId, body).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("message"));
    }

    // ── Requirement: 發案方查看應徵 ──

    @Test
    void 發案方查看應徵列表() throws Exception {
        applyOk(freelancer, jobId);
        Member second = signUp("第二位");
        applyOk(second, jobId);
        mvc.perform(auth(get("/api/jobs/" + jobId + "/applications"), client))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].applicant.id").value(freelancer.id()))
                .andExpect(jsonPath("$[0].applicant.displayName").value("接案者"))
                .andExpect(jsonPath("$[0].applicant.email").doesNotExist())
                .andExpect(jsonPath("$[0].message").isString());
    }

    @Test
    void 非發案方不能查看_403() throws Exception {
        applyOk(freelancer, jobId);
        mvc.perform(auth(get("/api/jobs/" + jobId + "/applications"), freelancer))
                .andExpect(status().isForbidden());
    }

    @Test
    void 查看應徵需登入_401() throws Exception {
        mvc.perform(get("/api/jobs/" + jobId + "/applications")).andExpect(status().isUnauthorized());
    }

    // ── Requirement: 選定接案者 ──

    @Test
    void 選定成功() throws Exception {
        long chosen = applyOk(freelancer, jobId);
        Member other = signUp("落選者");
        long notChosen = applyOk(other, jobId);

        accept(client, jobId, chosen)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(chosen))
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        mvc.perform(auth(get("/api/jobs/" + jobId + "/applications"), client))
                .andExpect(jsonPath("$[?(@.id == " + chosen + ")].status").value("ACCEPTED"))
                .andExpect(jsonPath("$[?(@.id == " + notChosen + ")].status").value("REJECTED"));
        mvc.perform(get("/api/jobs/" + jobId)).andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        mvc.perform(get("/api/jobs").param("keyword", tag))
                .andExpect(jsonPath("$[*].id", not(hasItem((int) jobId))));
    }

    @Test
    void 非發案方不能選定_403() throws Exception {
        long appId = applyOk(freelancer, jobId);
        accept(freelancer, jobId, appId).andExpect(status().isForbidden());
    }

    @Test
    void 已選定過不能再選_409() throws Exception {
        long first = applyOk(freelancer, jobId);
        Member other = signUp("第二位");
        long second = applyOk(other, jobId);
        accept(client, jobId, first).andExpect(status().isOk());
        accept(client, jobId, second).andExpect(status().isConflict());
    }

    @Test
    void 應徵不屬於這個案件_404() throws Exception {
        long otherJob = createJob(client);
        long appOnOtherJob = applyOk(freelancer, otherJob);
        accept(client, jobId, appOnOtherJob).andExpect(status().isNotFound());
    }

    // ── Requirement: 我的應徵 ──

    @Test
    void 查看我的應徵與結果() throws Exception {
        long appId = applyOk(freelancer, jobId);
        accept(client, jobId, appId).andExpect(status().isOk());
        mvc.perform(auth(get("/api/me/applications"), freelancer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].jobId").value(jobId))
                .andExpect(jsonPath("$[0].jobTitle").value("形象網站應徵測試 " + tag))
                .andExpect(jsonPath("$[0].status").value("ACCEPTED"))
                .andExpect(jsonPath("$[0].jobStatus").value("IN_PROGRESS"));
    }

    // ── Requirement: 邀請接案者應徵 ──

    @Test
    void 邀請成功() throws Exception {
        setOpenForWork(freelancer, true);
        invite(client, jobId, freelancer.id())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.jobId").value(jobId))
                .andExpect(jsonPath("$.inviteeId").value(freelancer.id()));
    }

    @Test
    void 重複邀請_409() throws Exception {
        setOpenForWork(freelancer, true);
        invite(client, jobId, freelancer.id()).andExpect(status().isCreated());
        invite(client, jobId, freelancer.id()).andExpect(status().isConflict());
    }

    @Test
    void 不能邀請未開放接案的會員_400() throws Exception {
        invite(client, jobId, freelancer.id()).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("freelancerId"));
    }

    @Test
    void 不能邀請自己_400() throws Exception {
        setOpenForWork(client, true);
        invite(client, jobId, client.id()).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("freelancerId"));
    }

    @Test
    void 非發案方不能邀請_403() throws Exception {
        Member third = signUp("第三人");
        setOpenForWork(third, true);
        invite(freelancer, jobId, third.id()).andExpect(status().isForbidden());
    }

    @Test
    void 不能邀請已應徵者_409() throws Exception {
        setOpenForWork(freelancer, true);
        applyOk(freelancer, jobId);
        invite(client, jobId, freelancer.id()).andExpect(status().isConflict());
    }

    // ── Requirement: 收到的邀請 ──

    @Test
    void 受邀者應徵後() throws Exception {
        setOpenForWork(freelancer, true);
        invite(client, jobId, freelancer.id()).andExpect(status().isCreated());
        mvc.perform(auth(get("/api/me/invitations"), freelancer))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].jobId").value(jobId))
                .andExpect(jsonPath("$[0].client.displayName").value("發案方"))
                .andExpect(jsonPath("$[0].message").value("看過你的作品，想邀請你應徵"))
                .andExpect(jsonPath("$[0].applied").value(false));

        applyOk(freelancer, jobId);
        mvc.perform(auth(get("/api/me/invitations"), freelancer))
                .andExpect(jsonPath("$[0].applied").value(true));
    }

    // ── Requirement: 案件應徵人數 ──

    @Test
    void 應徵後人數增加() throws Exception {
        mvc.perform(get("/api/jobs/" + jobId)).andExpect(jsonPath("$.applicationCount").value(0));
        applyOk(freelancer, jobId);
        mvc.perform(get("/api/jobs/" + jobId)).andExpect(jsonPath("$.applicationCount").value(1));
    }
}
