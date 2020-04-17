package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"

	firebase "firebase.google.com/go"
	"github.com/gorilla/mux"
	"google.golang.org/api/option"
)

type POSTStruct struct {
	Title string   `json:"title"`
	Urls  []string `json:"urls"`
}

type WriteStruct struct {
	Title string   `json:"title"`
	Urls  []string `json:"urls"`
	Id    int32
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

func generateKey() int32 {
	return rand.Int31()
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
	// Generates new router for api to use
	r := mux.NewRouter()

	// Generates Sub Router
	api := r.PathPrefix("/api/v0/").Subrouter()

	api.HandleFunc("/writeURL/", writeURL).Methods(http.MethodPost)
	api.HandleFunc("/getURLS/", getURLInfo).Methods(http.MethodGet)

	log.Fatal(http.ListenAndServe(":8080", r))
}
