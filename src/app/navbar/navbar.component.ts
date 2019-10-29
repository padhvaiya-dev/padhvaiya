import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { DataService } from './../services/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../services/alert.service';
import { StateService } from '../services/state.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isDisabled: boolean = false;
  @ViewChild('userSettings', { static: true }) private userSettingsEl: ElementRef;
  @ViewChild('quesTab', { static: false }) public quesTabEl: ElementRef;
  @ViewChild('ansTab', { static: false }) public ansTabEl: ElementRef;
  @ViewChild('closeButton', { static: true }) public closeButton: ElementRef;

  imgFile: File;
  askQuestionForm: FormGroup
  userLoggedIn: string = 'Guest';
  constructor(
    private _dataService: DataService,
    private _renderer: Renderer2,
    private _fb: FormBuilder,
    private _stateService: StateService,
    private _notify: AlertService
  ) { }

  ngOnInit() {
    this.userLoggedIn = localStorage.getItem('loggedInUser');
    this.askQuestionForm = this._fb.group({
      desc: ['', [Validators.required]]
    })
  }

  goLogout() {
    this._dataService.logout();
  }

  onNewQuestionSubmit() {
    const userId: string = this._dataService.currentUserValue._id;
    if (!this.askQuestionForm.valid) this._notify.warning('Answer cannot be empty');
    this._dataService.createQuestionByUser(this.askQuestionForm.value, userId, this.imgFile)
      .subscribe(_ => {
        this._notify.success('You asked a question!');
        this.closeButton.nativeElement.click();
        this.fetchAllQuestions();
      },
        err => {
          this._notify.error(err);
        })
  }

  fetchAllQuestions() {
    this._dataService.fetchQuestions()
      .subscribe(
        respObj => {
          this._stateService.questionDetailState.questionList = respObj;
        },
        err => {
          this._notify.error(err);
        }
      )
  }

  fileUpload(event) {
    this.imgFile = event.target.files[0];
  }

  onToggleProfile() {
    this.isDisabled = !this.isDisabled;
    this.isDisabled
      ? this._renderer.addClass(this.userSettingsEl.nativeElement, 'active')
      : this._renderer.removeClass(this.userSettingsEl.nativeElement, 'active');
  }
}
