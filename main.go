package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	firebase "firebase.google.com/go"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"google.golang.org/api/option"
)

type URL struct {
	Url   string `json: "url"`
	Title string `json: "title"`
}

type POSTStruct struct {
	Title string `json:"title"`
	Urls  []URL  `json:"urls"`
}

type WriteStruct struct {
	Title string `json:"title"`
	Urls  []URL  `json:"urls"`
	Id    string
}

func writeURL(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	var t POSTStruct
	err := decoder.Decode(&t)
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(writeUrlInfo(t))
}

func getURLInfo(w http.ResponseWriter, r *http.Request) {
	pathParams := r.URL.Query()["id"][0]

	fmt.Println(pathParams)

	ctx := context.Background()

	conf := &firebase.Config{
		DatabaseURL: "https://bulk-url.firebaseio.com/",
	}

	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	client, err := app.Database(ctx)
	if err != nil {
		log.Fatalln("Error initializing database client:", err)
	}
	// The app only has access to public data as defined in the Security Rules
	ref := client.NewRef(pathParams)
	var data WriteStruct
	if err := ref.Get(ctx, &data); err != nil {
		log.Fatalln("Error reading from database:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)

}

func generateKey() string {
	title := ""
	adj, err := os.Open("./wordlist/adj.txt")

	if err != nil {
		panic(err)
	}
	defer adj.Close()

	noun, err := os.Open("./wordlist/noun.txt")

	if err != nil {
		panic(err)
	}
	defer noun.Close()

	var adjs []string
	var nouns []string

	scanner := bufio.NewScanner(adj)
	for scanner.Scan() {
		adjs = append(adjs, scanner.Text())
	}

	scannerNoun := bufio.NewScanner(noun)
	for scannerNoun.Scan() {
		nouns = append(nouns, scannerNoun.Text())
	}

	rand.Seed(time.Now().Unix())
	title += strings.Title(adjs[rand.Int()%len(adjs)])
	title += strings.Title(adjs[rand.Int()%len(adjs)])
	title += strings.Title(nouns[rand.Int()%len(nouns)])

	return title
}

func writeUrlInfo(t POSTStruct) WriteStruct {
	ctx := context.Background()

	conf := &firebase.Config{
		DatabaseURL: "https://bulk-url.firebaseio.com/",
	}

	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	client, err := app.Database(ctx)
	if err != nil {
		log.Fatalln("Error initializing database client:", err)
	}

	// Get a database reference to our blog.
	id := generateKey()
	ref := client.NewRef(fmt.Sprint(id))

	output := WriteStruct{
		Title: t.Title,
		Urls:  t.Urls,
		Id:    id,
	}

	ref.Set(ctx, output)

	if err != nil {
		log.Fatalln("Error setting value:", err)
	}
	return output
}

func main() {

	port := os.Getenv("PORT")

	if port == "" {
		log.Fatal("$PORT must be set")
	}

	// Generates new router for api to use
	r := mux.NewRouter()

	// Generates Sub Router
	api := r.PathPrefix("/api/v0/").Subrouter()

	api.HandleFunc("/writeURL/", writeURL).Methods(http.MethodPost)
	api.HandleFunc("/getURLS/", getURLInfo).Methods(http.MethodGet)
	handler := cors.Default().Handler(api)

	fmt.Printf(port)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
