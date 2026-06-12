FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

FROM alpine:3.20

RUN adduser -D app
RUN mkdir -p /data/uploads && chown -R app:app /data
USER app

COPY --from=build /bin/api /api
EXPOSE 8080

ENTRYPOINT ["/api"]
