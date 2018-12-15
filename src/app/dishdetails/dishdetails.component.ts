import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetails',
  templateUrl: './dishdetails.component.html',
  styleUrls: ['./dishdetails.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block'
  },
  animations: [
    flyInOut(),
    visibility(),
    expand()
  ]
})

export class DishdetailsComponent implements OnInit {
  
  commentForm : FormGroup;
  comment: Comment;
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  dishcopy: Dish;
  visibility = 'shown';
  @ViewChild('fform') realTimeFeedbackFormDirective;

  realTimeFeedback = {
  	rating: 5,
  	comment: '',
 	author: '',
 	date: ''
  };

    formErrors = {
    'author' : '',
    'comment' : ''
  };

  validationMessages = {
    'author': {
      'required':  'Name is required.',
      'minlength':  'Name must be at least 2 characters long.'
    },
    'comment': {
      'required':  'Comment is required.'
    }
  };
  
  constructor(private dishService: DishService,
  	private route: ActivatedRoute, 
  	private location: Location,
  	private ff: FormBuilder,
  	@Inject('BaseURL') private BaseURL) { 
  	this.createForm();
  }

  ngOnInit() {
  	this.dishService.getDishIds()
  		.subscribe((dishIds) => this.dishIds = dishIds);
  	this.route.params
  		.pipe(switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishService.getDish(params['id']); } ))
  		.subscribe((dish) => {
  			this.dish = dish;
  			this.dishcopy = dish;
  			this.setPrevNext(dish.id);
  			this.visibility = 'shown';
  		});
  	//this.dish = this.dishService.getDish(id); Before Promises
  }

  createForm() {
    this.commentForm = this.ff.group(
      {
        author: ['', [Validators.required, Validators.minLength(2)]],
        comment: ['', [Validators.required] ],
        rating: [5]      
      }
    );
      this.commentForm.valueChanges
        .subscribe(data => this.onValueChanged(data));

      this.onValueChanged();// reset form validataion message
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
  
  setPrevNext(dishId: string) {
  	const index = this.dishIds.indexOf(dishId);
  	this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
  	this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
  	this.location.back();
  }

  onSubmit() {
  	this.comment = this.commentForm.value;
    this.commentForm.reset({
      author : '',
      rating : 5,
      comment:'',
      date: ''
    });

    var event = new Date();

    this.comment.date = event.toISOString(); 
  	this.dishcopy.comments.push(this.comment);
  	this.dishService.putDish(this.dishcopy)
  		.subscribe(dish => {
  			this.dish = dish;
  			this.dishcopy = dish;
  		},
  		errmess => { 
  			this.dish = null;
  			this.dishcopy = null;
  			this.errMess = <any>errmess;
  		});
  	this.realTimeFeedbackFormDirective.resetForm();
  }
}
