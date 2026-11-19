package tw.freelancefair.user;

/**
 * 帳號角色。一般使用者都是 MEMBER，可以同時發案與接案；
 * 「發案方／接案者」由與案件的關係決定，不是帳號身分。
 * ADMIN 不可自行註冊。
 */
public enum Role {
    MEMBER,
    ADMIN
}
