# Start from a Debian image with the latest version of Go installed
# and a workspace (GOPATH) configured at /go.
FROM golang:latest

# Create WORKDIR (working directory) for app
WORKDIR /go/src/github.com/TheGuyWhoCodes/bulkshort

# Copy the local package files to the container's workspace
# (in the above WORKDIR)
ADD . .

# Switch WORKDIR to directory where server main.go lives
WORKDIR /go/src/github.com/TheGuyWhoCodes/bulkshort/


# Build the go-API-template userServer command inside the container
# at the most recent WORKDIR
RUN go build -o main
# Run the userServer command by default when the container starts.
# runs command at most recent WORKDIR
ENTRYPOINT ./main
# Document that the container uses port 8080
EXPOSE 8080
# Document that the container uses port 5432
EXPOSE 5432 