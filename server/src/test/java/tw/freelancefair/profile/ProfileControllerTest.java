package tw.freelancefair.profile;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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

/** 對應 openspec/changes/add-member-profile/specs/member-profile/spec.md */
@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    String token;
    long myId;
    String tag;

    record Member(String token, long id) {}

    @BeforeEach
    void setUp() throws Exception {
        tag = UUID.randomUUID().toString().substring(0, 6);
        Member m = signUp("我自己");
        token = m.token();
        myId = m.id();
    }

    private Member signUp(String name) throws Exception {
        String email = "p" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String reg = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email, "password", "secret123", "displayName", name))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email, "password", "secret123"))))
                .andReturn().getResponse().getContentAsString();
        return new Member(json.readTree(res).get("token").asText(), json.readTree(reg).get("id").asLong());
    }

    private ResultActions updateProfile(String tok, String name, String bio, List<String> skills, boolean open)
            throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("displayName", name);
        body.put("bio", bio);
        body.put("skills", skills);
        body.put("openForWork", open);
        var req = put("/api/me/profile").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        if (tok != null) req.header("Authorization", "Bearer " + tok);
        return mvc.perform(req);
    }

    private ResultActions addPortfolio(String tok, String title, String link) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("title", title);
        body.put("description", "作品說明");
        body.put("link", link);
        return mvc.perform(post("/api/me/portfolio").header("Authorization", "Bearer " + tok)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body)));
    }

    // ── Requirement: 修改基本資料 ──

    @Test
    void 修改成功_取得目前使用者顯示新名稱() throws Exception {
        updateProfile(token, "林小安工作室", "專做形象網站", List.of("React", "Figma", "react"), true)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("林小安工作室"))
                .andExpect(jsonPath("$.bio").value("專做形象網站"))
                .andExpect(jsonPath("$.skills.length()").value(2)) // react 與 React 合併
                .andExpect(jsonPath("$.openForWork").value(true));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.displayName").value("林小安工作室"));
    }

    @Test
    void 技能太多_400() throws Exception {
        List<String> eleven = java.util.stream.IntStream.range(0, 11).mapToObj(i -> "skill" + i).toList();
        updateProfile(token, "某人", null, eleven, true)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("skills"));
    }

    @Test
    void 未登入_401() throws Exception {
        updateProfile(null, "某人", null, List.of(), true).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/me/profile")).andExpect(status().isUnauthorized());
    }

    // ── Requirement: 作品集管理 ──

    @Test
    void 新增作品_出現在公開檔案() throws Exception {
        addPortfolio(token, "咖啡店官網", "https://example.com")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.link").value("https://example.com"));
        mvc.perform(get("/api/members/" + myId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.portfolio[0].title").value("咖啡店官網"));
    }

    @Test
    void 不填連結也可以() throws Exception {
        addPortfolio(token, "Logo 設計", "").andExpect(status().isCreated())
                .andExpect(jsonPath("$.link").doesNotExist());
    }

    @Test
    void 不合法連結_400() throws Exception {
        addPortfolio(token, "壞連結", "javascript:alert(1)")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("link"));
    }

    @Test
    void 刪除自己的作品() throws Exception {
        String res = addPortfolio(token, "要刪的", null).andReturn().getResponse().getContentAsString();
        long id = json.readTree(res).get("id").asLong();
        mvc.perform(delete("/api/me/portfolio/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/members/" + myId)).andExpect(jsonPath("$.portfolio.length()").value(0));
    }

    @Test
    void 刪除別人的作品_404且不被刪除() throws Exception {
        String res = addPortfolio(token, "我的作品", null).andReturn().getResponse().getContentAsString();
        long id = json.readTree(res).get("id").asLong();
        Member other = signUp("別人");
        mvc.perform(delete("/api/me/portfolio/" + id).header("Authorization", "Bearer " + other.token()))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/members/" + myId)).andExpect(jsonPath("$.portfolio[0].title").value("我的作品"));
    }

    // ── Requirement: 公開檔案 ──

    @Test
    void 訪客查看檔案_不含Email() throws Exception {
        updateProfile(token, "我自己", "自我介紹", List.of("React"), true);
        mvc.perform(get("/api/members/" + myId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("我自己"))
                .andExpect(jsonPath("$.skills[0]").value("React"))
                .andExpect(jsonPath("$.email").doesNotExist());
    }

    @Test
    void 不存在的會員_404() throws Exception {
        mvc.perform(get("/api/members/999999")).andExpect(status().isNotFound());
    }

    // ── Requirement: 查詢接案者 ──

    @Test
    void 依技能查詢_且未開放接案不出現() throws Exception {
        String figma = "Figma" + tag;
        updateProfile(token, "設計師A" + tag, null, List.of(figma), true);
        Member b = signUp("工程師B");
        updateProfile(b.token(), "工程師B" + tag, null, List.of("React" + tag), true);
        Member c = signUp("設計師C");
        updateProfile(c.token(), "設計師C" + tag, null, List.of(figma), false);

        mvc.perform(get("/api/members").param("skill", figma.toLowerCase()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].displayName").value("設計師A" + tag))
                .andExpect(jsonPath("$[0].email").doesNotExist());

        mvc.perform(get("/api/members").param("keyword", tag))
                .andExpect(jsonPath("$[*].displayName", hasItem("工程師B" + tag)))
                .andExpect(jsonPath("$[*].displayName", not(hasItem("設計師C" + tag))));
    }
}
