import {Component, OnInit} from '@angular/core';
import {AddPlacePage} from "../add-place/add-place";
import {Place} from "../../models/place";
import {PlacesService} from '../../services/places';
import {ModalController} from "ionic-angular";
import {PlacePage} from "../place/place";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
    constructor(private placesServices: PlacesService, private modalCtrl: ModalController){}

    ngOnInit(){
        this.placesServices.fetchPlaces()
            .then(
                (places: Place[]) => this.places = places
            );
    }

    addPlacePage = AddPlacePage;
    places: Place[] = [];

    ionViewWillEnter(){
        this.places = this.placesServices.loadPlaces();
    }

    onOpenPlace(place: Place, index: number) {
        const modal = this.modalCtrl.create(PlacePage, { place: place, index: index});
        modal.present();
        modal.onDidDismiss(
            () => {
                this.places = this.placesServices.loadPlaces();
            }
        );
    }



}
