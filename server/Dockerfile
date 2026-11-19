# 第一階段：用 Maven 編譯打包
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
RUN mvn -B -ntp -DskipTests package

# 第二階段：只放執行用的 JRE 與 jar，映像檔較小
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/freelance-fair-server-*.jar app.jar
# Render 免費方案只有 512MB，限制 JVM 記憶體避免被系統砍掉
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
