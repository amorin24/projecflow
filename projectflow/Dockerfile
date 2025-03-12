FROM golang:1.21-alpine

WORKDIR /app

COPY projectflow/ .

RUN go build -o projectflow-server .

EXPOSE 8080

CMD ["./projectflow-server"]
