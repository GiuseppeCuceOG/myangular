import { Injectable } from '@angular/core';
import { Promotion } from '../shared/promotion';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { map, catchError } from 'rxjs/operators';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

  getPromotions(): Observable<Promotion[]> {
  	return this.http.get<Promotion[]>(baseURL + 'promotions')
      .pipe(catchError(this.processHTTPMsgService.handleError));
      //(PROMOTIONS).pipe(delay(2000));
  }

  /*getPromotion(id: string): Promotion {
  	return PROMOTIONS.filter((promo) => (promo.id === id))[0];
  }*/

  getFeaturedPromotion(): Observable<Promotion> {
  	return this.http.get<Promotion>(baseURL + 'promotions?featured=true')
      .pipe(map(promo => promo[0]))
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }
}

// getFeaturedDish(): Observable<Dish> {
 //   return this.http.get<Dish>(baseURL + 'dishes?featured=true')
  //    .pipe(map(dishes => dishes[0]))
   //   .pipe(catchError(this.processHTTPMsgService.handleError));
  //}