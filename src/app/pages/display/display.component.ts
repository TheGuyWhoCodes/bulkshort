import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isEmpty } from 'lodash';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {

  @ViewChild('copyable') private input;
  private urls: {} = {}
  private success: boolean = false
  private key: string = ""
  private failed = false
  constructor(private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("lync.rip :: "+this.activatedRoute.snapshot.params.id)
    this.key = this.activatedRoute.snapshot.params.id
    this.getURLS(this.activatedRoute.snapshot.params.id).toPromise().then((x) => {
      if(x["urls"] == null) {
        this.failed = true
        this.success=false
        this.titleService.setTitle("lync.rip :: error!")
        return
      }
      for(let y in x["urls"]) {

        if(x["urls"][y].Url.slice(0,7) !== "http://" && x["urls"][y].Url.slice(0,8) !== "https://"){
          x["urls"][y].Url = "http://"+ x["urls"][y].Url
        }
      }
      this.urls = x
    })
    this.success = this.activatedRoute.snapshot.queryParamMap.get("success") === 'true'
    this.input.nativeElement.focus()
    this.input.nativeElement.value = environment.url+this.key
  }

  redirectHome() {
    this.router.navigate(["/"]);
  }

  hasUrls(): boolean {
    return !isEmpty(this.urls)
  }

  getURLS(key: string) {
    return this.http.get(environment.api+"api/v0/getURLS/", {
      params: {
        id: key
      }
    })
  }

  copyInputMessage(inputElement){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }
}
