## lync.rip

lync.rip is a URL shortner built with GoLang and Angular. This project was built in order to prep for my internship at Google. The website allows for users to shorten multiple websites into a list-viewable shortned URL.

## Setup

For the backend, you need to setup a serviceaccountkey.json and get that into the repo, and also change the database URL in main.go. 

For the frontend, all you need to do is update the enviornemnt variables as to where the backend API is located and what the base url is (ie mine is http://lync.rip/). Next, make sure you run `npm install` to install all needed software dependencies. Next, you can serve the webpage by running `ng s --configuration=dev`.

## What can be done better?

For one there needs to be some sort of authentation as to not overload the backend with requests, same thing for handling too many requests as there is no way to serve a 429 error code is there is too many requets at once from one IP. Also, the way I generate URLs can be cleaned up a lot more. All I'm doing right now is parsing through two text files with adj and nouns, and choosing a random one within that list. I haven't put in a way to handle collisions, which needs to be done.
