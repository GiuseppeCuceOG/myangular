import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { FeedbackService } from '../services/feedback.service';
import { expand, flyInOut } from '../animations/app.animation';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block'
  },
  animations: [
    flyInOut(),
    expand()
  ]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  feedbackcopy: Feedback[];
  errMess: string;
  spinning = true;
  submittedFeedBack = true;
  contactType = ContactType;
  visibility = 'shown';
  @ViewChild('fform') feedBackFormDirective;

  formErrors = {
  	'firstname': '',
  	'lastname': '',
  	'telnum': '',
  	'email': ''
  };

  validationsMessages = {
  	'firstname': {
  		'required': 'First name is required.',
  		'minlength': 'First name must be at least 2 characters long.',
  		'maxlength': 'First name cannot be longer than 25 characters.'
  	},
  	'lastname': {
  		'required': 'Last name is required.',
  		'minlength': 'Last name must be at least 2 characters long.',
  		'maxlength': 'Last name cannot be longer than 25 characters.'
  	},
  	'telnum': {
  		'required': 'Tel. number is required.',
  		'pattern': 'Tel. number must contain only numbers.'  	
  	},
  	'email': {
  		'required': 'Tel. number is required.',
  		'email': 'Email not in valid format.'
  	}
  };

  constructor(private fb: FormBuilder,
    private fbService: FeedbackService,
    @Inject('BaseURL') private BaseURL) { 
  	this.createForm();
  }

  ngOnInit() {
    //this.fbService.getsubmittedFeedBack()
      //.subscribe((feedback) => this.feedback = feedback);
      console.log(this.visibility);
  }

  createForm() {
  	this.feedbackForm = this.fb.group({
  		firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
  		lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
  		telnum: [0, [Validators.required, Validators.pattern]],
  		email: ['', [Validators.required, Validators.email]],
  		agree: false,
  		contacttype: 'None',
  		message: ''
  	});

  	this.feedbackForm.valueChanges
  		.subscribe(data => this.onValueChanged(data));

  	this.onValueChanged(); //(re)set form validation messages
  }

  onValueChanged(data?: any) {
  	if (!this.feedbackForm) {
  		return;
  	}
  	const form = this.feedbackForm;
  	for (const field in this.formErrors) {
  		if (this.formErrors.hasOwnProperty(field)) {
  			//clear previous error message (if any)
  			this.formErrors[field] = '';
  			const control = form.get(field);
  			if (control && control.dirty && !control.valid) {
  				const messages = this.validationsMessages[field];
  				for (const key in control.errors) {
  					if (control.errors.hasOwnProperty(key)) {
  						this.formErrors[field] += messages[key] + ' ';
  					}
  				}
  			}
  		}
  	}
  }

  submitFeedback() {
    this.feedback = this.feedbackForm.value;
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: 0,
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.fbService.putFeedBack(this.feedback)
      .subscribe(fb => {
        this.feedback = fb;
      });
    this.fbService.getFeedbacks()
      .subscribe(feedback => 
        this.feedbackcopy = feedback,
        errmess => this.errMess = <any>errmess
      );
    this.feedBackFormDirective.resetForm();
  }

  form() {
    return setTimeout( function() {
      this.visibility = 'shown';
      this.submittedFeedBack = false;
      this.spinning = false;
      console.log(this.visibility);
    }, 2000);
  }

  onSubmit() {
   return this.submitFeedback(),
    this.visibility = 'hidden',
    console.log(this.visibility),
    this.form();
  }
}
