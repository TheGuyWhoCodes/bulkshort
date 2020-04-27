import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Url, PostResponse } from './url.interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  public urlForm: FormGroup;

  private myStyle: object = {};
  private myParams: object = {};
  private width: number = 100;
  private height: number = 100;
  private hardError: boolean = false;

  errorMessage = "This is an error on our end, try again later!"

  constructor(private _fb: FormBuilder, private http: HttpClient, private router: Router, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("lync.rip :: home")
    this.urlForm = this._fb.group({
      name: ['name', [Validators.required, Validators.minLength(5)]],
      urls: this._fb.array([
        this.initUrl(),
      ])
    })


    this.myStyle = {
          'position': 'fixed',
          'top': '0',
          'width': '100%',
          'height': '100vh',
          'z-index': -1,
          'background-color' : `#336ae5`
      };

    this.myParams = {  
      "particles": {
        "number": {
          "value": 24,
          "density": {
            "enable": true,
            "value_area": 1262.6362266116362
          }
        },
        "color": {
          "value": "#cdcdcd"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
          "image": {
            "src": "img/github.svg",
            "width": 100,
            "height": 100
          }
        },
        "opacity": {
          "value": 1,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1,
            "opacity_min": 0,
            "sync": false
          }
        },
        "size": {
          "value": 3.945738208161363,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 4,
            "size_min": 0.3,
            "sync": false
          }
        },
        "line_linked": {
          "enable": false,
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 1,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 600
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": false,
            "mode": "bubble"
          },
          "onclick": {
            "enable": false,
            "mode": "repulse"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 400,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 250,
            "size": 0,
            "duration": 2,
            "opacity": 0,
            "speed": 3
          },
          "repulse": {
            "distance": 400,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    }
  }

  initUrl() {
    // const urlRegex = `#(?i)\b((?:[a-z][\w-]+:(?:/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))#iS`;

    return this._fb.group({
      url: ['', [Validators.required/*, Validators.pattern(urlRegex)*/]],
      title: ['', Validators.required]

    });
  }

  addUrl() {
    // add address to the list
    const control = <FormArray>this.urlForm.controls['urls'];
    control.push(this.initUrl());
  }

  removeUrl(i: number) {
    const control = <FormArray>this.urlForm.controls['urls'];
    control.removeAt(i);
  }

  save(model: FormGroup) {
    // call API to save customer
    this.hardError = false;
    var urlPost: Url[] = []
    for(let val in model.value.urls) {
      if(model.value.urls[val]["url"] == "") {
        this.hardError = true;
        this.errorMessage = "One of your URLs is empty!"
      }
      if(model.value.urls.length >= 10) {
        this.hardError = true;
        this.errorMessage = "Cannot shorten more than 10 links!"
      }
      if(model.value.urls.size == 0) {
        this.hardError = true;
        this.errorMessage = "Haha, you need to actually shorten a link!"
      }

      urlPost.push({
        url:model.value.urls[val]["url"],
        title: model.value.urls[val]["title"] != "" ? model.value.urls[val]["title"] : "URL "+ (parseInt(val) + 1)
      })
    }

    if(!this.hardError) {
      this.http.post<PostResponse>(environment.api+"api/v0/writeURL/", {      
        "title": "TeFfdsst",
        "urls": urlPost
      }).subscribe(data => {
        this.hardError = false;
        this.router.navigate([data.Id], {queryParams: {success:true}})
      }, error => {
        this.hardError = true;
      })
    }
  }
}
