FROM node:22-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/frontend-taller/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/frontend-taller/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /build/backend
COPY backend/taller/pom.xml ./
COPY backend/taller/src ./src
COPY --from=frontend /build/frontend/dist ./src/main/resources/static
RUN mvn -B -DskipTests package && cp target/*.jar /build/taller.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S taller && adduser -S taller -G taller
COPY --from=backend /build/taller.jar /app/taller.jar
COPY --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=50.0 -XX:+UseSerialGC -Xss512k"
USER taller
EXPOSE 8080
ENTRYPOINT ["/app/docker-entrypoint.sh"]
